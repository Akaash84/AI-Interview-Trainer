import React, { useState, useRef, useEffect } from 'react';

const AboutUs = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  
  // State for API data
  const [teamMembers, setTeamMembers] = useState([]);
  const [companyData, setCompanyData] = useState(null);
  const [visionMissionData, setVisionMissionData] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL - Force to use port 3001 where our server is running
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch data from backend
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [teamResponse, companyResponse, visionMissionResponse, contactResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/about/team`),
          fetch(`${API_BASE_URL}/api/about/company`),
          fetch(`${API_BASE_URL}/api/about/vision-mission`),
          fetch(`${API_BASE_URL}/api/about/contact`)
        ]);

        // Check if all requests were successful
        if (!teamResponse.ok || !companyResponse.ok || !visionMissionResponse.ok || !contactResponse.ok) {
          throw new Error('Failed to fetch data from server');
        }

        // Parse responses
        const [teamData, companyDataResult, visionMissionDataResult, contactDataResult] = await Promise.all([
          teamResponse.json(),
          companyResponse.json(),
          visionMissionResponse.json(),
          contactResponse.json()
        ]);

        // Set state with fetched data
        setTeamMembers(teamData.data || []);
        setCompanyData(companyDataResult.data || null);
        setVisionMissionData(visionMissionDataResult.data || null);
        setContactData(contactDataResult.data || null);

      } catch (err) {
        console.error('Error fetching about data:', err);
        setError(err.message);
        
        // Fallback to hardcoded data if API fails
        setTeamMembers([
          {
            name: "Alex Chen",
            role: "Co-Founder & CEO",
            image: "AC",
            description: "Former Google engineer with 8+ years in AI/ML. Led teams at top tech companies.",
            linkedin: "#",
            twitter: "#"
          },
          {
            name: "Sarah Johnson",
            role: "Co-Founder & CTO", 
            image: "SJ",
            description: "AI researcher and Stanford PhD. Expert in natural language processing.",
            linkedin: "#",
            twitter: "#"
          },
          {
            name: "Michael Park",
            role: "Head of Product",
            image: "MP", 
            description: "Product leader from Meta with deep experience in user-centric design.",
            linkedin: "#",
            twitter: "#"
          },
          {
            name: "Emily Davis",
            role: "Lead Engineer",
            image: "ED",
            description: "Full-stack engineer passionate about creating seamless user experiences.",
            linkedin: "#",
            twitter: "#"
          },
          {
            name: "David Wilson",
            role: "Data Scientist",
            image: "DW",
            description: "ML engineer specializing in speech recognition and behavioral analysis.",
            linkedin: "#",
            twitter: "#"
          },
          {
            name: "Jessica Lee",
            role: "UX Designer",
            image: "JL",
            description: "Creative designer focused on crafting intuitive and engaging user interfaces.",
            linkedin: "#",
            twitter: "#"
          },
          {
            name: "Robert Kim",
            role: "Backend Engineer",
            image: "RK",
            description: "Systems architect with expertise in scalable infrastructure and APIs.",
            linkedin: "#",
            twitter: "#"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, [API_BASE_URL]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320; // Width of each card plus gap
      scrollContainerRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320;
      scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
      setCurrentIndex(Math.min(teamMembers.length - 1, currentIndex + 1));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">About Us</h1>
          </div>

          {/* Company Description */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-black mb-6">
                {companyData?.story?.title || "Our Story"}
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                ) : (
                  companyData?.story?.paragraphs?.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  )) || (
                    <>
                      <p>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem 
                        Ipsum has been the industry's standard dummy text ever since the 1500s, My five 
                        centuries but also the leap into electronic typesetting.
                      </p>
                      <p>
                        It has survived not only five centuries but also the leap into electronic typesetting, 
                        remaining essentially unchanged. It was popularised in the 1960s with the release of 
                        Letraset sheets containing Lorem Ipsum passages, and more recently with desktop 
                        publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                      </p>
                      <p>
                        Our platform combines advanced AI with proven interview techniques to provide 
                        personalized feedback and practice opportunities that actually work.
                      </p>
                    </>
                  )
                )}
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-black mb-1">
                    {loading ? (
                      <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto w-16"></div>
                    ) : (
                      companyData?.stats?.successStories || "15K+"
                    )}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Success Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-black mb-1">
                    {loading ? (
                      <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto w-12"></div>
                    ) : (
                      companyData?.stats?.successRate || "98%"
                    )}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-black mb-1">
                    {loading ? (
                      <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto w-16"></div>
                    ) : (
                      companyData?.stats?.userRating || "4.9★"
                    )}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">User Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet the passionate experts behind InterviewTrainer who are dedicated to your success.
            </p>
            {error && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  Unable to load team data from server. Showing cached data.
                </p>
              </div>
            )}
          </div>

          {/* Horizontal Scrolling Team Cards */}
          <div className="relative">
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={scrollLeft}
                disabled={currentIndex === 0}
                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} / {teamMembers.length}
                </span>
              </div>
              
              <button
                onClick={scrollRight}
                disabled={currentIndex >= teamMembers.length - 1}
                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Scrollable Container */}
            <div 
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {loading ? (
                // Loading skeleton for team cards
                Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="flex-none w-80">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center h-full">
                      <div className="relative mx-auto mb-4 w-24 h-24">
                        <div className="w-full h-full bg-gray-200 rounded-2xl animate-pulse"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4 mx-auto"></div>
                      <div className="space-y-2 mb-4">
                        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3 mx-auto"></div>
                      </div>
                      <div className="flex justify-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                teamMembers.map((member, index) => (
                <div key={index} className="flex-none w-80 group">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 h-full">
                    {/* Profile Image Placeholder */}
                    <div className="relative mx-auto mb-4 w-24 h-24">
                      <div className="w-full h-full bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <span className="text-white font-bold text-xl">{member.image}</span>
                        {/* Diagonal lines for wireframe effect */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-transparent via-white to-transparent transform rotate-45"></div>
                          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-transparent via-white to-transparent transform -rotate-45"></div>
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>

                    <h3 className="text-xl font-bold text-black mb-1">{member.name}</h3>
                    <p className="text-sm font-medium text-gray-600 mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{member.description}</p>
                    
                    {/* Social Links */}
                    <div className="flex justify-center space-x-3">
                      <a 
                        href={member.linkedin}
                        className="w-8 h-8 bg-gray-100 hover:bg-black hover:text-white rounded-lg flex items-center justify-center transition-all duration-300"
                        aria-label="LinkedIn"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                      <a 
                        href={member.twitter}
                        className="w-8 h-8 bg-gray-100 hover:bg-black hover:text-white rounded-lg flex items-center justify-center transition-all duration-300"
                        aria-label="Twitter"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-6">
              {teamMembers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    if (scrollContainerRef.current) {
                      const cardWidth = 320;
                      scrollContainerRef.current.scrollTo({ 
                        left: index * cardWidth, 
                        behavior: 'smooth' 
                      });
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-black' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Vision & Mission Text */}
            <div>
              <h2 className="text-4xl font-bold text-black mb-8">Our Vision & Mission</h2>
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-black mb-3 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    {visionMissionData?.vision?.title || "Our Vision"}
                  </h3>
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">
                      {visionMissionData?.vision?.description || 
                      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s. My five centuries but also the leap into electronic typesetting, remaining essentially unchanged."}
                    </p>
                  )}
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-black mb-3 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    {visionMissionData?.mission?.title || "Our Mission"}
                  </h3>
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">
                      {visionMissionData?.mission?.description || 
                      "It has survived not only five centuries but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software."}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Vision Circle Graphic */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-full border-4 border-gray-300 bg-gradient-to-br from-gray-100 to-white flex items-center justify-center relative overflow-hidden">
                  <div className="text-center z-10">
                    <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Vision Illustration</p>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full"></div>
                    <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-orange-400 rounded-full"></div>
                    <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-purple-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work with us CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-black to-gray-900 rounded-2xl p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-20 h-20 border border-white/20 rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-16 h-16 border border-white/20 rounded-full"></div>
              <div className="absolute top-1/2 left-1/4 w-12 h-12 border border-white/10 rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">
                {contactData?.title || "Work with us"}
              </h2>
              {loading ? (
                <div className="space-y-2 mb-8 max-w-2xl mx-auto">
                  <div className="h-6 bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-600 rounded animate-pulse w-3/4 mx-auto"></div>
                </div>
              ) : (
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  {contactData?.description || 
                  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s. My five centuries but also the leap into electronic typesetting."}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-sm text-gray-300 mb-2">Send your message to our team:</p>
                  <div className="text-white font-medium">
                    {loading ? (
                      <div className="h-5 bg-gray-600 rounded animate-pulse w-48"></div>
                    ) : (
                      contactData?.email || "contact@interviewtrainer.ai"
                    )}
                  </div>
                </div>
                
                <button 
                  className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                  onClick={() => {
                    const email = contactData?.email || "contact@interviewtrainer.ai";
                    window.location.href = `mailto:${email}`;
                  }}
                >
                  {contactData?.ctaText || "Email to Us"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default AboutUs;