import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Building2, GraduationCap, User, CheckSquare } from 'lucide-react';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    // Existing quotes
    {
      text: "Education is not the filling of a pail, but the lighting of a fire.",
      author: "W.B. Yeats"
    },
    {
      text: "The function of education is to teach one to think intensively and to think critically.",
      author: "Martin Luther King Jr."
    },
    {
      text: "The art of teaching is the art of assisting discovery.",
      author: "Mark Van Doren"
    },
    {
      text: "Teaching is the highest form of understanding.",
      author: "Aristotle"
    },
    {
      text: "Intelligence plus character—that is the goal of true education.",
      author: "Martin Luther King Jr."
    },
    {
      text: "The beautiful thing about learning is that no one can take it away from you.",
      author: "B.B. King"
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela"
    },
    {
      text: "The mediocre teacher tells. The good teacher explains. The superior teacher demonstrates. The great teacher inspires.",
      author: "William Arthur Ward"
    },
    {
      text: "Education is not preparation for life; education is life itself.",
      author: "John Dewey"
    },
    {
      text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
      author: "Benjamin Franklin"
    },
    {
      text: "The whole purpose of education is to turn mirrors into windows.",
      author: "Sydney J. Harris"
    },
    {
      text: "Knowledge is power. Information is liberating. Education is the premise of progress.",
      author: "Kofi Annan"
    }
  ];

  useEffect(() => {
    // Get user data
    const user = JSON.parse(localStorage.getItem('userData'));
    if (user) {
      setUserData(user);
    }

    // Set up quote rotation
    const interval = setInterval(() => {
      setCurrentQuote((prevQuote) => {
        // Reset to 0 if we reach the end of quotes array
        return prevQuote >= quotes.length - 1 ? 0 : prevQuote + 1;
      });
    }, 6000); // Change quote every 6 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array since we don't need to track any dependencies

  return (
    <div className="flex-1 p-8 pt-20 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="space-y-4 text-center md:text-left mb-6 md:mb-0">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Welcome back,
                </h1>
                <h2 className="text-3xl font-semibold text-gray-800">
                  {userData?.name || 'Faculty'}
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 justify-center md:justify-start">
                <svg
                  className="w-5 h-5 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative w-32 h-32 bg-white p-2 rounded-lg shadow-xl transform transition duration-300 group-hover:scale-105">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Animated Quote */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-900 to-indigo-700 text-white shadow-xl">
          <div className="absolute top-6 right-6">
            <BookOpen className="w-8 h-8 md:w-12 md:h-12 opacity-20" />
          </div>
          
          <div className="p-4 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <div className="min-h-[12rem] md:min-h-[14rem] flex items-center justify-center overflow-hidden">
                <div 
                  key={currentQuote} 
                  className="w-full px-4 space-y-4 md:space-y-6 animate-quote-slide"
                >
                  <p className="text-xl md:text-3xl font-serif italic leading-relaxed">
                    "{quotes[currentQuote].text}"
                  </p>
                  <p className="text-base md:text-xl text-indigo-200">
                    — {quotes[currentQuote].author}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="mt-12 relative group/section">
          {/* Enhanced gradient background with animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl 
            group-hover/section:from-indigo-100 group-hover/section:to-purple-100 transition-colors duration-500"></div>
          
          <div className="relative p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r 
              from-indigo-600 to-purple-600 animate-pulse">
              Quick Access Dashboard
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Link 
                to="/profile" 
                className="group bg-white/90 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 
                  transform hover:-translate-y-2 border border-indigo-50 hover:border-indigo-200 animate-fade-in-up"
                style={{ animationDelay: '100ms' }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors 
                    group-hover:rotate-6 transform duration-300">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">Profile</h3>
                    <p className="text-sm text-gray-600">View and update your profile</p>
                  </div>
                </div>
              </Link>

              {/* Teaching Card */}
              <Link 
                to="/teaching" 
                className="group bg-white/90 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 
                  transform hover:-translate-y-2 border border-indigo-50 hover:border-indigo-200 animate-fade-in-up"
                style={{ animationDelay: '200ms' }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors 
                    group-hover:rotate-6 transform duration-300">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">Academic Involvment</h3>
                    <p className="text-sm text-gray-600">Manage teaching activities</p>
                  </div>
                </div>
              </Link>

              {/* Research Card */}
              <Link 
                to="/research" 
                className="group bg-white/90 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 
                  transform hover:-translate-y-2 border border-indigo-50 hover:border-indigo-200 animate-fade-in-up"
                style={{ animationDelay: '300ms' }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors 
                    group-hover:rotate-6 transform duration-300">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">Research</h3>
                    <p className="text-sm text-gray-600">Track research activities</p>
                  </div>
                </div>
              </Link>

              {/* Self Development Card */}
              <Link 
                to="/selfdevelopment" 
                className="group bg-white/90 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 
                  transform hover:-translate-y-2 border border-indigo-50 hover:border-indigo-200 animate-fade-in-up"
                style={{ animationDelay: '400ms' }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors 
                    group-hover:rotate-6 transform duration-300">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">Self Development</h3>
                    <p className="text-sm text-gray-600">Monitor personal growth</p>
                  </div>
                </div>
              </Link>

              {/* Portfolio Card */}
              <Link 
                to="/portfolio" 
                className="group bg-white/90 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 
                  transform hover:-translate-y-2 border border-indigo-50 hover:border-indigo-200 animate-fade-in-up"
                style={{ animationDelay: '500ms' }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors 
                    group-hover:rotate-6 transform duration-300">
                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">Portfolio</h3>
                    <p className="text-sm text-gray-600">View your activities</p>
                  </div>
                </div>
              </Link>

              {/* Extra Ordinary Contribution Card */}
              <Link 
                to="/extra" 
                className="group bg-white/90 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 
                  transform hover:-translate-y-2 border border-indigo-50 hover:border-indigo-200 animate-fade-in-up"
                style={{ animationDelay: '700ms' }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors 
                    group-hover:rotate-6 transform duration-300">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">Extra Contributions</h3>
                    <p className="text-sm text-gray-600">Add special achievements</p>
                  </div>
                </div>
              </Link>

              {/* Review Card */}
              <Link 
                to="/review" 
                className="group bg-white/90 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 
                  transform hover:-translate-y-2 border border-indigo-50 hover:border-indigo-200 animate-fade-in-up"
                style={{ animationDelay: '600ms' }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors 
                    group-hover:rotate-6 transform duration-300">
                    <CheckSquare className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">Review</h3>
                    <p className="text-sm text-gray-600">Complete evaluation</p>
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </div>

        {/* Welcome Message with Enhanced Styling */}
        <div className="mt-8 animate-slide-up">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative">
              {/* Decorative Element */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
              
              <div className="p-8 pt-10">
                <div className="text-center max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Welcome to Faculty Performance Evaluation System
                  </h2>
                  
                  <div className="space-y-4">
                    <p className="text-lg text-gray-600 leading-relaxed">
                      This platform is designed to streamline and enhance the process of faculty performance evaluation, 
                      making it easier for you to showcase your academic achievements and professional growth.
                    </p>
                    
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <div className="p-4 rounded-lg bg-indigo-50">
                        <h3 className="text-lg font-semibold text-indigo-700 mb-2">Track Progress</h3>
                        <p className="text-gray-600">Monitor your academic and research activities throughout the year</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-purple-50">
                        <h3 className="text-lg font-semibold text-purple-700 mb-2">Document Achievements</h3>
                        <p className="text-gray-600">Record and showcase your professional accomplishments</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-indigo-50">
                        <h3 className="text-lg font-semibold text-indigo-700 mb-2">Grow Together</h3>
                        <p className="text-gray-600">Contribute to the institution's academic excellence</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes quote-change {
          0%, 20% { opacity: 1; transform: translateY(0); }
          40% { opacity: 0; transform: translateY(-20px); }
          60% { opacity: 0; transform: translateY(20px); }
          80%, 100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes quote-fade {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          20%, 80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
          }
        }

        @keyframes quote-slide {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          5%, 90% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }

        .animate-quote-change {
          animation: quote-change 6s ease-in-out infinite;
        }

        .animate-quote-fade {
          animation: quote-fade 6s ease-in-out;
        }

        .animate-quote-slide {
          animation: quote-slide 6s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 100%;
        }

        @media (max-width: 640px) {
          .animate-quote-slide {
            padding: 0 1rem;
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        /* Add smooth transition for all properties */
        .group {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Add hover effect for icons */
        .group:hover .transform {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Add glass effect */
        .bg-white\/90 {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 0.3;
          }
          80%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-gradient {
          background: linear-gradient(270deg, #818cf8, #6366f1, #4f46e5);
          background-size: 200% 200%;
          animation: gradient-shift 6s ease infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-pulse-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: inherit;
          background: inherit;
          animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
          z-index: -1;
        }

        .animate-shimmer {
          background: linear-gradient(
            90deg,
            rgba(99, 102, 241, 0) 0%,
            rgba(99, 102, 241, 0.1) 50%,
            rgba(99, 102, 241, 0) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;