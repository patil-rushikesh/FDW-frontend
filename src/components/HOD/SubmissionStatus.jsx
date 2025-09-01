import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'; // Add useLocation

const SubmissionStatus = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  const [showContent, setShowContent] = useState(false);

  // Get state from location with default values
  const {
    status = 'success',
    message = 'Your data has been successfully submitted!',
    error = null,
    formName = 'form'
  } = location.state || {};

  useEffect(() => {
    // Trigger animation after component mount
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleTryAgain = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div 
        className={`max-w-lg w-full transform transition-all duration-500 ease-in-out ${
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}
      >
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Status Icon */}
          <div className={`px-4 py-8 sm:px-12 flex flex-col items-center justify-center ${
            status === 'success' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className={`transform transition-all duration-500 ${
              showContent ? 'scale-100' : 'scale-0'
            }`}>
              {status === 'success' ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <h2 className={`mt-4 text-2xl font-bold text-center ${
              status === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {status === 'success' ? 'Submission Successful!' : 'Submission Failed'}
            </h2>
          </div>

          {/* Message */}
          <div className="px-4 py-6 sm:px-12">
            <p className="text-gray-600 text-center text-lg">
              {status === 'success' ? (
                message // Use the passed message instead of constructing a new one
              ) : (
                <>
                  There was an error submitting your {formName}.
                  {error && (
                    <span className="block mt-2 text-red-600 text-sm">
                      Error: {error}
                    </span>
                  )}
                </>
              )}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleBackToDashboard}
                className="w-full flex items-center justify-center px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
              
              {status === 'error' && (
                <button
                  onClick={handleTryAgain}
                  className="w-full px-6 py-3 text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-300"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>

        {status === 'success' && (
          <div className={`mt-6 text-center transform transition-all duration-500 delay-300 ${
            showContent ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            <p className="text-gray-600">
              You can view and edit your submission from the dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionStatus;