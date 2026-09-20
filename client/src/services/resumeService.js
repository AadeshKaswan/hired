import API from '../api';

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const analyzeResume = (resumeId) => {
  return API.post('/resume/analyze', { resumeId });
};

export const getAnalysis = (analysisId) => {
  return API.get(`/resume/analysis/${analysisId}`);
};

export const getHistory = () => {
  return API.get('/resume/history');
};