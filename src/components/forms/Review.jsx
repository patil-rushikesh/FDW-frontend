import React, { useState, useEffect, useCallback } from 'react';
import { Download, RefreshCw, ShieldAlert, AlertTriangle } from 'lucide-react';
import Cookies from 'js-cookie';

const Review = () => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [isFormFrozen, setIsFormFrozen] = useState(false);
  const [formStatus, setFormStatus] = useState('pending'); // Default status
  const userData = JSON.parse(localStorage.getItem("userData"));
  
  const generatePDF = useCallback(async (forceUpdate = false) => {
    if (!forceUpdate) {
      const cachedPdf = Cookies.get('pdfData');
      if (cachedPdf) {
        setPdfUrl(cachedPdf);
        return;
      }
    }

    setLoading(true);
    setLoadingProgress(0);

    try {
      // Simulate progress while API generates PDF
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 5000);

      const response = await fetch(
        `http://127.0.0.1:5000/${userData.dept}/${userData._id}/generate-doc`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Clear interval and set final progress
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      // Cache the PDF URL in cookie (24 hour expiry)
      Cookies.set('pdfData', url, { expires: 1 });
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
      setLoadingProgress(0);
    }
  }, [userData.dept, userData._id]);

  // Fetch form status from API
  const fetchFormStatus = useCallback(async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/${userData.dept}/${userData._id}/get-status`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) throw new Error('Failed to fetch status');

      const data = await response.json();
      setFormStatus(data.status);
      
      // If status is not pending, the form is considered frozen
      if (data.status !== 'pending') {
        setIsFormFrozen(true);
      }
    } catch (error) {
      console.error('Error fetching form status:', error);
    }
  }, [userData.dept, userData._id]);

  useEffect(() => {
    generatePDF();
    fetchFormStatus();
  }, [generatePDF, fetchFormStatus]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/${userData.dept}/${userData._id}/submit-form`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      const result = await response.json();
      alert('Form submitted successfully!');
      
      // Refresh status after submission
      fetchFormStatus();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  const handleFreezeForm = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/${userData.dept}/${userData._id}/submit-form`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to freeze form');
      }

      const result = await response.json();
      alert('Form frozen successfully! It can no longer be edited without permission.');
      
      setIsFormFrozen(true);
      setShowFreezeModal(false);
      
      // Refresh status after freezing
      fetchFormStatus();
      
    } catch (error) {
      console.error('Error freezing form:', error);
      alert('Failed to freeze form. Please try again.');
      setShowFreezeModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-l-4 border-l-indigo-500">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Faculty Data Review</h1>
          <div className="flex gap-2">
            {pdfUrl && (
              <a
                href={pdfUrl}
                download={`${userData._id}.pdf`}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download size={20} />
                Download PDF
              </a>
            )}
            <button
              onClick={() => generatePDF(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              Generate Updated Data PDF
            </button>
          </div>
        </div>

        {loading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-center mt-2 text-gray-600">
              Generating PDF... {loadingProgress}%
            </p>
          </div>
        )}

        {pdfUrl && !loading && (
          <div className="w-full h-[800px] border border-gray-300 rounded-lg mb-4">
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-lg"
              title="Faculty Data PDF"
            />
          </div>
        )}
      </div>

      {/* Status Indicator if Form is Frozen */}
      {isFormFrozen && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold">
            <ShieldAlert size={24} />
            Form is {formStatus.charAt(0).toUpperCase() + formStatus.slice(1)} - Editing Locked
          </div>
        </div>
      )}

      {/* Floating Freeze Button - only visible when status is pending */}
      {formStatus === 'pending' && (
        <div className="fixed bottom-12 right-12 z-50">
          <button
            onClick={() => setShowFreezeModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full 
            hover:bg-red-700 transition-all duration-300 shadow-xl transform hover:scale-110
            animate-pulse hover:animate-none text-lg font-semibold border-2 border-white"
          >
            <ShieldAlert size={24} className="stroke-2" />
            Freeze Form
          </button>
        </div>
      )}

      {/* Freeze Confirmation Modal */}
      {showFreezeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full m-4 animate-modal-appear">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Freeze Action</h3>
              <p className="text-sm text-gray-600 mb-6">
                Once frozen, this form cannot be edited until permission is granted by higher authority. Are you sure you want to proceed?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowFreezeModal(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFreezeForm}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Confirm Freeze
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;