import { useState, useEffect } from 'react';
import API from '../api';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, totalApplications: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'from-indigo-500 to-blue-500' },
    { label: 'Total Jobs', value: stats.totalJobs, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Applications', value: stats.totalApplications, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-xl`}
          >
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="text-4xl font-extrabold mt-2">{card.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;