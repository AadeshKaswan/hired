import { Link } from 'react-router-dom';

const JobCard = ({ job }) => {
  return (
    <div className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 ease-out border border-transparent hover:border-indigo-200 dark:hover:border-indigo-700 overflow-hidden">
      {/* Hover highlight line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{job.title}</h3>
          <span className="text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full font-medium">
            {job.type}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{job.company} — {job.location || 'Remote'}</p>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{job.description}</p>
        <Link
          to={`/jobs/${job._id}`}
          className="mt-4 inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
        >
          View Details
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default JobCard;