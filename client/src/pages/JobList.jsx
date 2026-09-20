import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../api';
import JobCard from '../components/JobCard';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const location = useLocation();

  // 1. Sync keyword from URL query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keywordFromURL = params.get('keyword') || '';
    setKeyword(keywordFromURL);
  }, [location.search]);

  // 2. Fetch jobs whenever keyword changes
  const fetchJobs = useCallback(async () => {
    try {
      const { data } = await API.get(`/jobs?keyword=${encodeURIComponent(keyword)}`);
      setJobs(data);
    } catch (err) {
      console.error(err);
    }
  }, [keyword]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // 3. Handle manual input (also updates the URL if you want, but not required)
  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
    // Optional: update the URL without full page reload using navigate
    // navigate(`/jobs?keyword=${encodeURIComponent(e.target.value)}`);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find your next opportunity</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Browse hundreds of jobs from top companies.</p>
          <div className="mt-6 relative max-w-lg">
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by job title..."
              value={keyword}
              onChange={handleKeywordChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
        {jobs.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 mt-10">No jobs found for "{keyword}".</p>
        )}
      </div>
    </div>
  );
};

export default JobList;