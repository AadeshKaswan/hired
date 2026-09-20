import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await API.get(`/jobs/${id}`);
      setJob(data);
    };
    fetchJob();
  }, [id]);

  const applyHandler = async () => {
    if (!file) {
      alert('Please upload your resume');
      return;
    }
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('coverLetter', coverLetter);
    try {
      await API.post(`/applications/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Applied successfully!');
      setFile(null);
      setCoverLetter('');
    } catch (err) {
      alert('Application failed – maybe already applied?');
    }
  };

  if (!job)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/20 dark:border-gray-700/30 p-8 md:p-10">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">{job.company}</p>
              <div className="flex gap-3 mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{job.location || 'Remote'}</span>
                <span className="text-sm bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full">
                  {job.type}
                </span>
              </div>
            </div>
            <span className="text-sm text-gray-400 dark:text-gray-500">
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
          <hr className="my-6 border-gray-200 dark:border-gray-700" />
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {job.description}
          </div>
          {job.requirements?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Requirements</h3>
              <ul className="list-disc ml-5 space-y-1 text-gray-600 dark:text-gray-400">
                {job.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {user?.role === 'jobseeker' && (
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Apply for this position</h3>
              <textarea
                placeholder="Write a brief cover letter (optional)"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all mb-3"
                rows="4"
              />
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input
  id="resume-upload"
  type="file"
  accept=".pdf,.doc,.docx"
  onChange={(e) => setFile(e.target.files[0])}
  className="hidden"
/>

<label
  htmlFor="resume-upload"
  className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition text-sm text-gray-600 dark:text-gray-300"
>
  Upload Resume
</label>
                {/* <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition text-sm text-gray-600 dark:text-gray-300">
                  Upload Resume
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label> */}
                {file && <span className="text-sm text-gray-500 dark:text-gray-400">{file.name}</span>}
              </div>
              <button
                onClick={applyHandler}
                className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-xl hover:shadow-indigo-200/50 dark:hover:shadow-indigo-800/30 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Submit Application
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;