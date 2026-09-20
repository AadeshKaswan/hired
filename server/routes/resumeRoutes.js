const express = require('express');
const path = require('path');
const fs = require('fs');
const { PdfReader } = require('pdfreader');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const ResumeAnalysis = require('../models/ResumeAnalysis');

const router = express.Router();

const upload = require('../middleware/upload');

// Upload resume
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    let text = '';
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext === '.pdf') {
      const rows = [];
      try {
        await new Promise((resolve, reject) => {
          new PdfReader().parseFileItems(req.file.path, (err, item) => {
            if (err) reject(err);
            else if (!item) resolve();
            else if (item.text) rows.push(item.text);
          });
        });
        text = rows.join(' ').trim();
      } catch (e) {
        console.warn('PdfReader parsing error:', e.message);
      }

      // If PdfReader extracted little/no text (e.g. Canva, Figma, vector graphics or complex fonts),
      // fall back to Gemini's native PDF reading capability
      if (!text || text.length < 30) {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const candidateModels = [
            process.env.GEMINI_MODEL,
            'gemini-flash-lite-latest',
            'gemini-3.1-flash-lite',
            'gemini-3.7-flash',
            'gemini-3.6-flash'
          ].filter(Boolean);

          const fileBuffer = fs.readFileSync(req.file.path);
          const pdfPart = {
            inlineData: {
              data: fileBuffer.toString('base64'),
              mimeType: 'application/pdf'
            }
          };

          for (const modelName of candidateModels) {
            try {
              const model = genAI.getGenerativeModel({ model: modelName });
              const aiResult = await model.generateContent([
                pdfPart,
                'Extract all readable text from this resume document verbatim as plain text. Do not summarize, alter, or add any commentary.'
              ]);
              const extracted = aiResult.response.text();
              if (extracted && extracted.trim().length > 20) {
                text = extracted.trim();
                break;
              }
            } catch (err) {
              console.warn(`Fallback extraction model ${modelName} error:`, err.message);
            }
          }
        } catch (aiErr) {
          console.warn('AI PDF text extraction fallback error:', aiErr.message);
        }
      }
    } else {
      const result = await mammoth.extractRawText({ path: req.file.path });
      text = result.value;
    }

    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      extractedText: text
    });

    res.json({
      resumeId: resume._id,
      fileName: resume.fileName,
      extractedTextPreview: (text || '').substring(0, 200) + '...'
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Analyze resume
router.post('/analyze', protect, async (req, res) => {
  try {
    const resume = await Resume.findById(req.body.resumeId);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const candidateModels = [
      process.env.GEMINI_MODEL,
      'gemini-flash-lite-latest',
      'gemini-3.1-flash-lite',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-flash-latest'
    ].filter(Boolean);

    // Multimodal support: If original PDF file exists on disk, attach it directly
    let pdfPart = null;
    if (resume.filePath && fs.existsSync(resume.filePath) && path.extname(resume.filePath).toLowerCase() === '.pdf') {
      try {
        const fileBuffer = fs.readFileSync(resume.filePath);
        pdfPart = {
          inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType: 'application/pdf'
          }
        };
      } catch (fileErr) {
        console.warn('Could not read PDF file for multimodal analysis:', fileErr.message);
      }
    }

    const prompt = `You are a professional resume analyzer and document verification system.

STEP 1: DOCUMENT CLASSIFICATION (CRITICAL)
First, inspect the content and structure of the document to determine if it is genuinely a Resume, Curriculum Vitae (CV), or Professional Candidate Profile.
- A genuine resume/CV is a personal career document outlining an individual's career history, work experience, technical/professional skills, education, and contact details for the purpose of job applications.
- Documents that are NOT resumes include: lab manuals, table of contents/indexes, syllabi, study guides, homework/assignments, exam papers, scientific articles, books, essays, contracts, receipts/invoices, code files, technical manuals, or arbitrary notes.
- If the document is NOT a resume/CV, you MUST set "isResume": false and provide a clear, polite "rejectionReason" (e.g. "The uploaded document appears to be a lab manual/index rather than a resume. Please upload a genuine resume or CV."). Set "candidateName" to "", "atsScore": 0, and all arrays to [].

STEP 2: RESUME ANALYSIS (ONLY IF isResume IS TRUE)
If and only if it IS a resume, extract the information EXACTLY as it appears. Do NOT invent, guess, or hallucinate information.

Return ONLY a valid JSON object with these keys:

{
  "isResume": true,
  "rejectionReason": "",
  "candidateName": "Full name EXACTLY as written on the resume. If not found, empty string.",
  "email": "Email address found on the resume. If multiple, pick the most professional one. If none, empty string.",
  "phone": "Phone number found on the resume. If none, empty string.",
  "skills": ["List ONLY skills explicitly mentioned in the resume. Do NOT guess or add skills that sound related. Max 15 skills."],
  "education": ["Each entry as: 'Degree in Field at Institution, Year'. Only include what's actually listed. If no year, omit it. If no education section, empty array."],
  "experience": ["Each entry as: 'Job Title at Company (StartDate-EndDate): One-sentence summary of achievements from the resume'. Only include real positions listed. If no dates, write 'Dates not specified'."],
  "projects": ["Each entry as: 'Project Name: Description from resume'. Only include projects explicitly listed. If none, empty array."],
  "certifications": ["Only real certifications mentioned in the resume. Do NOT invent common certifications. If none, empty array."],
  "atsScore": "Score from 0-100 based on: keyword relevance, formatting clarity, quantifiable achievements, skills match, and completeness. Be objective and strict — most resumes score 40-70. If isResume is false, must be 0.",
  "strengths": ["3-5 specific strengths based ONLY on what's in the resume. Use quotes or direct references from the resume text."],
  "weaknesses": ["2-4 weaknesses based on gaps visible in the resume: missing metrics, vague descriptions, employment gaps, missing skills for target role, poor formatting indicators."],
  "missingSkills": ["Skills commonly expected for the candidate's field that are NOT present in their resume. Max 5."],
  "improvements": ["3-5 actionable, specific suggestions based on actual gaps in this resume. Examples: 'Add metrics to your experience bullet points', 'Include a professional summary section', 'List relevant certifications'."],
  "recommendedRoles": ["2-4 job titles this candidate is most qualified for based on their actual skills and experience. Be realistic."],
  "summary": "A 2-3 sentence professional summary that could be used at the top of this resume. Use only information from the resume. Do not add achievements they don't have."
}

CRITICAL RULES:
- If isResume is false, DO NOT extract skills or projects from non-resume documents.
- If information is NOT in the resume, leave it empty — never guess
- Do not format skills with dashes or numbers
- Do not add skills the candidate might have based on their job title
- Only extract what is explicitly written
- For ATS score, be honest — a short resume with no metrics should not score above 60

${resume.extractedText && resume.extractedText.trim().length > 20 ? `Resume text:\n${resume.extractedText}` : 'Analyze the attached resume file directly.'}`;

    const contentPayload = pdfPart ? [pdfPart, prompt] : prompt;

    let result = null;
    let lastErr = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json'
          }
        });
        result = await model.generateContent(contentPayload);
        if (result) break;
      } catch (err) {
        lastErr = err;
        console.warn(`Model ${modelName} encountered error: ${err.message}. Trying next fallback model...`);
      }
    }

    if (!result) {
      throw lastErr || new Error('All Gemini candidate models failed.');
    }
    const responseText = result.response.text();
    let cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    const analysisData = JSON.parse(cleaned);

    // Validate document classification
    if (analysisData.isResume === false) {
      await ResumeAnalysis.deleteOne({ resumeId: resume._id });
      return res.status(400).json({
        message: analysisData.rejectionReason || 'The uploaded file does not appear to be a resume or CV. Please upload a genuine resume.',
        isNotResume: true
      });
    }

    // If resume.extractedText was empty, backfill it with candidate info
    if ((!resume.extractedText || resume.extractedText.trim().length < 20) && analysisData.summary) {
      await Resume.findByIdAndUpdate(resume._id, {
        extractedText: `${analysisData.candidateName}\n${analysisData.summary}\nSkills: ${(analysisData.skills || []).join(', ')}`
      });
    }

    const analysis = await ResumeAnalysis.findOneAndUpdate(
      { resumeId: resume._id },
      { resumeId: resume._id, ...analysisData },
      { returnDocument: 'after', upsert: true }
    );

    res.json(analysis);

  } catch (err) {
    console.error('Analysis error:', err.message);

    // Clean rate limit error
    if (err.message.includes('429') || err.message.includes('quota')) {
      return res.status(429).json({
        message: 'AI service is temporarily unavailable. Please try again in a minute.',
        retryAfter: '60 seconds'
      });
    }

    // Invalid JSON from AI
    if (err instanceof SyntaxError) {
      return res.status(502).json({
        message: 'Unable to parse the AI response. Please try again.'
      });
    }

    // Network errors
    if (err.message.includes('fetch') || err.message.includes('network')) {
      return res.status(503).json({
        message: 'Unable to reach AI service. Check your internet connection.'
      });
    }

    // API key issues
    if (err.message.includes('401') || err.message.includes('403') || err.message.includes('key')) {
      return res.status(500).json({
        message: 'AI service configuration error. Please contact support.'
      });
    }

    // Generic fallback
    res.status(500).json({
      message: 'Something went wrong during analysis. Please try again.'
    });
  }
});

// Get single analysis
router.get('/analysis/:id', protect, async (req, res) => {
  const analysis = await ResumeAnalysis.findById(req.params.id);
  if (!analysis) return res.status(404).json({ message: 'Not found' });
  res.json(analysis);
});

// Get history
router.get('/history', protect, async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id })
    .sort('-createdAt')
    .lean();

  const history = await Promise.all(
    resumes.map(async (r) => {
      const analysis = await ResumeAnalysis.findOne({ resumeId: r._id }).sort('-createdAt');
      return {
        resumeId: r._id,
        fileName: r.fileName,
        uploadDate: r.createdAt,
        analysisId: analysis?._id || null,
        atsScore: analysis?.atsScore || null
      };
    })
  );

  res.json(history);
});

module.exports = router;