import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import RootLayout from './components/RootLayout';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Dashboard from './components/Dashboard';
import CodeEditor from './components/CodeEditor';
import SpeechToTextDis from './components/SpeechToTextDis';
import PricingPage from './components/PricingPage';
import Landing from './components/Landing';
import ProfilePage from './components/ProfilePage';
import PracticeSection from './components/PracticeSection';
import Session from './components/Session';
import ProfileRedirect from './components/ProfileRedirect';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import StartInterview from './components/StartInterview.jsx';
import InterviewSession from './components/InterviewSession.jsx';
import InterviewReport from './components/InterviewReport.jsx';
import RecordingsDashboard from './components/RecordingsDashboard.jsx';
import ContactUs from './components/ContactUs.jsx';
import AboutUs from './components/AboutUs.jsx';
import OAuthCallback from './components/OAuthCallback.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Practice from './components/Practice.jsx';

// Component to handle conditional redirect based on auth state
const HomeRedirect = () => {
  const { isSignedIn } = useAuth();
  
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/signin" replace />;
};

function App() {
  return (
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<HomeRedirect />} />
              <Route path="signin" element={<Signin />} />
              <Route path="signup" element={<Signup />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="contactus" element={<ContactUs />} />
              <Route path="aboutus" element={<AboutUs />} />
              <Route path="auth/callback" element={<OAuthCallback />} />
              
              {/* Protected Routes */}
              <Route path="dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
              <Route path="speech" element={<ProtectedRoute><SpeechToTextDis /></ProtectedRoute>} />
              <Route path="code" element={<ProtectedRoute><CodeEditor/></ProtectedRoute>} />
              <Route path="practice-page" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="practice" element={<ProtectedRoute><PracticeSection /></ProtectedRoute>} />
              <Route path="session" element={<ProtectedRoute><Session /></ProtectedRoute>} />
              <Route path="interview-report" element={<ProtectedRoute><InterviewReport /></ProtectedRoute>} />
              <Route path="recordings" element={<ProtectedRoute><RecordingsDashboard /></ProtectedRoute>} />
              <Route path="profile-redirect" element={<ProtectedRoute><ProfileRedirect /></ProtectedRoute>} />
              <Route path="resume-analyzer" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
              <Route path="/start-interview" element={<ProtectedRoute><StartInterview /></ProtectedRoute>} />
              <Route path="/interview-session" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
            </Route>
          </Routes>
        </div>
      </Router>
  );
}

export default App;