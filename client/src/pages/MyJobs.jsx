import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    API.get('/jobs/employer/myjobs')
      .then((res) => setJobs(res.data))
      .catch(console.error);
  }, []);

  const deleteJob = async (id) => {
    if (window.confirm('Delete this job?')) {
      await API.delete(`/jobs/${id}`);
      setJobs(jobs.filter((j) => j._id !== id));
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Posted Jobs</h1>
        {jobs.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-10">No jobs posted yet.</div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/30 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {job.company} — {job.location}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-3 text-sm font-medium">
                  <Link to={`/jobs/${job._id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200">
                    View
                  </Link>
                  <Link to={`/jobs/${job._id}/applicants`} className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200">
                    Applicants
                  </Link>
                  <button onClick={() => deleteJob(job._id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;