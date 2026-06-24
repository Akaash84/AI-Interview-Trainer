import React, { useState, useEffect } from 'react';

const ContactUs = () => {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    message: ''
  });
  const [useCases, setUseCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch use cases from backend
  useEffect(() => {
    const fetchUseCases = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/contact/use-cases`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch use cases');
        }

        const result = await response.json();
        setUseCases(result.data || []);

      } catch (err) {
        console.error('Error fetching use cases:', err);
        setError(err.message);
        
        // Fallback to hardcoded data if API fails
        setUseCases([
          {
            title: "Interview Preparation",
            description: "Practice with AI-powered mock interviews tailored to your industry and role.",
            icon: "💼"
          },
          {
            title: "Technical Skills Assessment",
            description: "Evaluate and improve your technical knowledge with interactive coding challenges.",
            icon: "⚡"
          },
          {
            title: "Behavioral Question Training",
            description: "Master the art of storytelling with STAR method coaching and feedback.",
            icon: "🎯"
          },
          {
            title: "Resume Optimization",
            description: "Get AI-powered suggestions to make your resume stand out to recruiters.",
            icon: "📄"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUseCases();
  }, [API_BASE_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setSubmitMessage('');
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage('Thank you for your message! We\'ll get back to you soon.');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          message: ''
        });
      } else {
        throw new Error(result.message || 'Failed to submit form');
      }

    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollCasesLeft = () => {
    setCurrentCaseIndex(Math.max(0, currentCaseIndex - 1));
  };

  const scrollCasesRight = () => {
    setCurrentCaseIndex(Math.min(useCases.length - 1, currentCaseIndex + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contact Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-black text-center mb-8">Contact Us</h1>
            
            {/* Success/Error Messages */}
            {submitMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-center">{submitMessage}</p>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-center">{error}</p>
              </div>
            )}
            
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-200 resize-none"
                  placeholder="Tell us how we can help you..."
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-black text-center mb-12">Use cases</h2>
          
          {error && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-center text-sm">
                Unable to load use cases from server. Showing cached data.
              </p>
            </div>
          )}
          
          {/* Use Cases Carousel */}
          <div className="relative">
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={scrollCasesLeft}
                disabled={currentCaseIndex === 0}
                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  {currentCaseIndex + 1} / {useCases.length}
                </span>
              </div>
              
              <button
                onClick={scrollCasesRight}
                disabled={currentCaseIndex >= useCases.length - 1}
                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Use Cases Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                // Loading skeleton for use cases
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white border-2 border-gray-300 rounded-xl p-6 h-64 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3 mx-auto"></div>
                    </div>
                  </div>
                ))
              ) : (
                useCases.map((useCase, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index >= currentCaseIndex && index < currentCaseIndex + 4 
                      ? 'opacity-100 transform translate-x-0' 
                      : 'opacity-50 transform translate-x-4'
                  }`}
                >
                  <div className="bg-white border-2 border-gray-300 rounded-xl p-6 h-64 flex flex-col items-center justify-center text-center hover:border-black transition-all duration-300">
                    {/* Content */}
                    <div className="text-center">
                      <div className="text-3xl mb-3">{useCase.icon}</div>
                      <h3 className="text-lg font-bold text-black mb-2">{useCase.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{useCase.description}</p>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-8">
              {useCases.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCaseIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentCaseIndex ? 'bg-black' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;