import { useState, useEffect } from 'react';
import API from '../api';

const MyApplications = () => {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    API.get('/applications/myapps')
      .then((res) => setApps(res.data))
      .catch(console.error);
  }, []);

  const statusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'reviewed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Applications</h1>
        {apps.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-10">No applications yet.</div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <div
                key={app._id}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/30 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{app.job?.title || 'Unknown Job'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {app.job?.company} {app.job?.location && `— ${app.job.location}`}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;