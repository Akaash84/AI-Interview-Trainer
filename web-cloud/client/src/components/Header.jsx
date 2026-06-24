import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import UserButton from './UserButton';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, user } = useAuth();
  const location = useLocation();

  const avatarUrl = user?.imageUrl || '/default-avatar.png'; // fallback for email/password users

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
      <div className="w-full px-2 sm:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isSignedIn ? "/dashboard" : "/signin"} className="flex items-center space-x-2">
            <div className="relative group">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                <span className="text-white font-bold text-lg">IT</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <span className="text-xl font-bold text-black hover:text-gray-700 transition-colors">
                InterviewTrainer
              </span>
              <div className="text-xs text-gray-500 font-medium tracking-wider hidden sm:block">
                AI-POWERED PLATFORM
              </div>
            </div>
          </Link>
          
          {/* Auth Buttons / User Menu */}
          <div className="flex items-center flex-1">
            {isSignedIn ? (
              <>
                <div className="flex items-center space-x-3 mx-auto">
                  {/* <Link to="/dashboard" className="text-gray-600 hover:text-black transition-colors font-medium hidden sm:block">
                    Dashboard
                  </Link> */}
                  {/* <Link to="/speech" className="text-gray-600 hover:text-black transition-colors font-medium hidden sm:block">
                    Speech
                  </Link> */}
                  <Link 
                    to="/practice-page" 
                    className={`text-gray-600 hover:text-black transition-all font-medium hidden sm:block pb-1 border-b-2 ${
                      location.pathname === '/practice-page' 
                        ? 'border-black' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    Practice
                  </Link>
                  {/* <Link to="/start-interview" className="text-gray-600 hover:text-black transition-colors font-medium hidden sm:block">
                    StartInterview
                  </Link> */}
                  <Link 
                    to="/interview-report" 
                    className={`text-gray-600 hover:text-black transition-all font-medium hidden sm:block pb-1 border-b-2 ${
                      location.pathname === '/interview-report' 
                        ? 'border-black' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    InterviewReport
                  </Link>
                  <Link 
                    to="/recordings" 
                    className={`text-gray-600 hover:text-black transition-all font-medium hidden sm:block pb-1 border-b-2 ${
                      location.pathname === '/recordings' 
                        ? 'border-black' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    Recordings
                  </Link>
                  <Link 
                    to="/resume-analyzer" 
                    className={`text-gray-600 hover:text-black transition-all font-medium hidden sm:block pb-1 border-b-2 ${
                      location.pathname === '/resume-analyzer' 
                        ? 'border-black' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    Analyse Resume
                  </Link>
                  {/* <Link to="/pricing" className="text-gray-600 hover:text-black transition-colors font-medium hidden sm:block">
                    Pricing
                  </Link> */}
                  {/* <Link to="/profile" className="text-gray-600 hover:text-black transition-colors font-medium hidden sm:block">
                    Profile
                  </Link> */}
                </div>
                <div className="w-8 h-8">
                  <UserButton
                        appearance={{
                          elements: {
                            avatarBox: "w-8 h-8 ring-2 ring-gray-200 hover:ring-gray-300 transition-all",
                            userButtonPopoverCard: "shadow-2xl border border-gray-200 rounded-xl backdrop-blur-sm",
                            userButtonPopoverActionButton: "hover:bg-gray-50 transition-colors"
                          }
                        }}
                        userProfile={{
                          imageUrl: avatarUrl,
                          firstName: user?.firstName || 'User',
                          lastName: user?.lastName || ''
                        }}
                      />
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 ml-auto">
                <Link to="/signin" className="text-gray-600 hover:text-black transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-50">
                  Sign in
                </Link>
                <Link to="/signup" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Get Started
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="py-4 space-y-4 border-t border-gray-200/60 bg-white/90 backdrop-blur-sm rounded-b-xl">
            {isSignedIn ? (
              <Link to="/dashboard" className="block px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-all font-medium">
                Dashboard
              </Link>
            ) : (
              <div className="px-4 pt-4 space-y-3 border-t border-gray-200">
                <Link to="/signin" className="block w-full text-center py-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-all font-medium">
                  Sign in
                </Link>
                <Link to="/signup" className="block w-full text-center py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all font-semibold">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
