import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');

const Applicants = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);

  const fetchApplicants = useCallback(async () => {
    const { data } = await API.get(`/applications/job/${jobId}/applicants`);
    setApplicants(data);
  }, [jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const updateStatus = async (appId, status) => {
    await API.put(`/applications/${appId}/status`, { status });
    fetchApplicants();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Applicants</h1>
        {applicants.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-10">No applicants yet.</div>
        ) : (
          <div className="space-y-4">
            {applicants.map((app) => (
              <div
                key={app._id}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/30 p-6"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {app.applicant.name}
                      </h3>
                      {/* --- GMAIL COMPOSE LINK --- */}
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(app.applicant.email)}&su=${encodeURIComponent(`Regarding your application for ${app.job?.title || 'the position'}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
                        title="Compose email in Gmail"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {app.applicant.email}
                      </a>
                    </div>
                    {app.applicant.skills && (
                      <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                        Skills: {app.applicant.skills.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {app.resume && (
                      <a
                        href={`${BACKEND_URL}/${app.resume.replace(/\\/g, '/')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 text-sm underline hover:text-indigo-800 dark:hover:text-indigo-200"
                      >
                        View Resume
                      </a>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app._id, e.target.value)}
                        className="border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
                {app.coverLetter && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Cover Letter:</p>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{app.coverLetter}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applicants;