import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analyzeResume } from '../services/resumeService';

const CircularProgress = ({ value }) => (
  <div className="relative w-32 h-32 mx-auto">
    <svg className="w-full h-full" viewBox="0 0 36 36">
      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none" stroke="#e5e7eb" strokeWidth="3" />
      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
        fill="none" stroke="#6366f1"
        strokeWidth="3"
        strokeDasharray={`${value}, 100`}
        strokeLinecap="round" />
    </svg>
    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-indigo-600">{value}</span>
  </div>
);

const AnalysisResultPage = () => {
  const { resumeId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await analyzeResume(resumeId);
        setAnalysis(res.data);
      } catch (err) {
        const message = err.response?.data?.message || 'Analysis failed. Please try again.';
        const retryAfter = err.response?.data?.retryAfter;
        const isRateLimit = err.response?.status === 429;
        const isNotResume = err.response?.data?.isNotResume || false;

        setError({
          message,
          retryAfter,
          isRateLimit,
          isNotResume
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Analyzing your resume with AI...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className={`rounded-2xl p-8 max-w-md text-center ${
          error.isRateLimit 
            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="text-4xl mb-4">{error.isRateLimit ? '⏳' : (error.isNotResume ? '📄' : '⚠️')}</div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {error.isNotResume ? 'Document Not Recognized as Resume' : (error.isRateLimit ? 'High Traffic' : 'Analysis Notice')}
          </h2>
          <p className={`font-medium mb-4 text-sm leading-relaxed ${error.isRateLimit ? 'text-amber-700 dark:text-amber-300' : 'text-red-700 dark:text-red-300'}`}>
            {error.message}
          </p>
          {error.retryAfter && (
            <p className="text-amber-600 dark:text-amber-400 text-sm mb-4">
              {error.retryAfter}
            </p>
          )}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/resume/upload"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              Upload Valid Resume
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Resume Analysis</h1>

        {/* ATS Score */}
        <div className="flex justify-center mb-10">
          <CircularProgress value={analysis.atsScore || 0} />
        </div>

        {/* Candidate info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <InfoCard title="Name" value={analysis.candidateName || 'Not found'} />
          <InfoCard title="Email" value={analysis.email || 'Not found'} />
          <InfoCard title="Phone" value={analysis.phone || 'Not found'} />
        </div>

        {/* Detailed sections */}
        <Section title="Skills" items={analysis.skills} />
        <Section title="Education" items={analysis.education} />
        <Section title="Experience" items={analysis.experience} />
        <Section title="Projects" items={analysis.projects} />
        <Section title="Certifications" items={analysis.certifications} />
        <Section title="Strengths" items={analysis.strengths} />
        <Section title="Weaknesses" items={analysis.weaknesses} />
        <Section title="Missing Skills" items={analysis.missingSkills} />
        <Section title="Suggested Improvements" items={analysis.improvements} />
        <Section title="Recommended Job Roles" items={analysis.recommendedRoles} />

        {/* Summary */}
        {analysis.summary && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{analysis.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({ title, value }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm">
    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    <p className="text-gray-900 dark:text-white font-medium">{value || '—'}</p>
  </div>
);

const Section = ({ title, items }) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  // Handle both array and string inputs
  const itemList = Array.isArray(items) ? items : items.split(',').map(s => s.trim());

  if (itemList.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {itemList.map((item, idx) => (
          <span key={idx} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnalysisResultPage;