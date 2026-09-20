import { useState, useEffect } from 'react';
import API from '../api';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const { data } = await API.get('/admin/jobs');
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);
  

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    await API.delete(`/admin/jobs/${id}`);
    setJobs(jobs.filter(j => j._id !== id));
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading jobs...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Manage Jobs</h1>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/30 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Title</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Company</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Posted By</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{job.title}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{job.company}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{job.postedBy?.name || 'Unknown'}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => deleteJob(job._id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr><td colSpan="4" className="p-4 text-center text-gray-400">No jobs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminJobs;
