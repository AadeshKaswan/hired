import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import MyJobs from './pages/MyJobs';
import MyApplications from './pages/MyApplications';
import Applicants from './pages/Applicants';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import CustomCursor from "./components/CustomCursor";
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminJobs from './pages/AdminJobs';
import AdminApplications from './pages/AdminApplications';
import ResumeUploadPage from './pages/ResumeUploadPage';
import AnalysisResultPage from './pages/AnalysisResultPage';
import HistoryPage from './pages/HistoryPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/jobs" element={<PageTransition><JobList /></PageTransition>} />
        <Route path="/jobs/:id" element={<PageTransition><JobDetail /></PageTransition>} />

        {/* Protected User Routes */}
        <Route path="/post-job" element={<PageTransition><ProtectedRoute role="employer"><PostJob /></ProtectedRoute></PageTransition>} />
        <Route path="/my-jobs" element={<PageTransition><ProtectedRoute role="employer"><MyJobs /></ProtectedRoute></PageTransition>} />
        <Route path="/my-applications" element={<PageTransition><ProtectedRoute role="jobseeker"><MyApplications /></ProtectedRoute></PageTransition>} />
        <Route path="/jobs/:jobId/applicants" element={<PageTransition><ProtectedRoute role="employer"><Applicants /></ProtectedRoute></PageTransition>} />

        {/* Resume Analyzer Routes (protected, all authenticated users) */}
        <Route path="/resume/upload" element={<PageTransition><ProtectedRoute><ResumeUploadPage /></ProtectedRoute></PageTransition>} />
        <Route path="/resume/analyze/:resumeId" element={<PageTransition><ProtectedRoute><AnalysisResultPage /></ProtectedRoute></PageTransition>} />
        <Route path="/resume/history" element={<PageTransition><ProtectedRoute><HistoryPage /></ProtectedRoute></PageTransition>} />

        {/* Admin Routes (nested layout) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="applications" element={<AdminApplications />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();

  return (
    <>
      <CustomCursor />
      {/* Ambient background glow (persists across pages) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-30"
          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20"
          animate={{ scale: [1, 1.08, 1], rotate: [0, -1, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="relative">
        <Navbar />
        <main className={location.pathname.startsWith('/admin') ? '' : 'pt-16 md:pt-20'}>
          <AnimatedRoutes />
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;