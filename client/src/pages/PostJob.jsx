import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const PostJob = () => {
  const navigate = useNavigate();
  const [job, setJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary: '',
    type: 'full-time',
  });

  const handleChange = (e) => setJob({ ...job, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...job, requirements: job.requirements.split(',').map((r) => r.trim()) };
    await API.post('/jobs', payload);
    navigate('/my-jobs');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/20 dark:border-gray-700/30 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Post a New Job</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Job Title', name: 'title', placeholder: 'e.g., Senior React Developer', type: 'text' },
              { label: 'Company', name: 'company', placeholder: 'e.g., Acme Inc.', type: 'text' },
              { label: 'Location', name: 'location', placeholder: 'e.g., San Francisco, CA (or Remote)', type: 'text' },
              { label: 'Salary', name: 'salary', placeholder: 'e.g., $80,000 - $120,000', type: 'text' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  name={field.name}
                  placeholder={field.placeholder}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required={field.name !== 'location' && field.name !== 'salary'}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                name="description"
                rows="5"
                placeholder="Describe the role and responsibilities..."
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Requirements (comma-separated)
              </label>
              <input
                name="requirements"
                placeholder="React, Node.js, MongoDB"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type</label>
              <select
                name="type"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-xl hover:shadow-indigo-200/50 dark:hover:shadow-indigo-800/30 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Publish Job
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;