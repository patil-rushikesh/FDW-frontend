import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Building2, GraduationCap, User, CheckSquare } from 'lucide-react';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
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
    }
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userData'));
    if (user) {
      setUserData(user);
    }

    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % quotes.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 p-8 pt-20 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Welcome back, {userData?.name || 'Faculty'}
                </h1>
                <p className="text-gray-600 mt-2">
                    {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </p>
            </div>
            <div className="w-40 h-40 bg-white p-3 rounded-lg shadow-md animate-bounce-subtle">
                <img src={logo} alt="Logo" className="w-full h-full object-contain rounded-md" />
            </div>
        </div>

        {/* Main Content with Animated Quote */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-900 to-indigo-700 text-white shadow-xl">
          <div className="absolute top-6 right-6">
            <BookOpen className="w-12 h-12 opacity-20" />
          </div>
          
          <div className="p-12">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="h-48 flex items-center justify-center">
                <div className="space-y-6 animate-quote-change">
                  <p className="text-3xl font-serif italic leading-relaxed">
                    "{quotes[currentQuote].text}"
                  </p>
                  <p className="text-xl text-indigo-200">
                    — {quotes[currentQuote].author}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/profile" className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Profile</h3>
                <p className="text-sm text-gray-600">View and update your profile</p>
              </div>
            </div>
          </Link>

          <Link to="/teaching" className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Academic Involvement</h3>
                <p className="text-sm text-gray-600">Manage teaching activities</p>
              </div>
            </div>
          </Link>

          <Link to="/research" className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Research</h3>
                <p className="text-sm text-gray-600">Track research activities</p>
              </div>
            </div>
          </Link>

          <Link to="/selfdevelopment" className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Self Development</h3>
                <p className="text-sm text-gray-600">Monitor personal growth</p>
              </div>
            </div>
          </Link>

          <Link to="/portfolio" className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Portfolio</h3>
                <p className="text-sm text-gray-600">View departmental activities</p>
              </div>
            </div>
          </Link>

          <Link to="/review" className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <CheckSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Final Review</h3>
                <p className="text-sm text-gray-600">Complete your evaluation</p>
              </div>
            </div>
          </Link>
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
      `}</style>
    </div>
  );
};

export default Dashboard;