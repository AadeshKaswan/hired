import { useState, useEffect } from 'react';
import API from '../api';

const AdminApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    try {
      const { data } = await API.get('/admin/applications');
      setApps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, []);

  const updateStatus = async (id, status) => {
    await API.put(`/admin/applications/${id}`, { status });
    setApps(apps.map(app => app._id === id ? { ...app, status } : app));
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading applications...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Manage Applications</h1>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/30 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Applicant</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Job</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(app => (
              <tr key={app._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="p-4 text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">{app.applicant?.name}</div>
                  <div className="text-xs text-gray-500">{app.applicant?.email}</div>
                </td>
                <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                  {app.job?.title} <span className="text-gray-400">@ {app.job?.company}</span>
                </td>
                <td className="p-4">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app._id, e.target.value)}
                    className="border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
            {apps.length === 0 && (
              <tr><td colSpan="3" className="p-4 text-center text-gray-400">No applications found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminApplications;