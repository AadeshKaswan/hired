import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHistory } from '../services/resumeService';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then(res => setHistory(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Analysis History</h1>
        {history.length === 0 ? (
          <p className="text-gray-500">No resumes uploaded yet.</p>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.resumeId} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.fileName}</p>
                  <p className="text-sm text-gray-500">{new Date(item.uploadDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  {item.analysisId ? (
                    <>
                      <span className="text-indigo-600 font-bold">{item.atsScore}%</span>
                      <Link to={`/resume/analysis/${item.analysisId}`} className="text-sm text-indigo-600 hover:underline">View</Link>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">Not analyzed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;