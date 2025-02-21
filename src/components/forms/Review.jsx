import React, { useState, useEffect, useCallback } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import Cookies from 'js-cookie';

const Review = () => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
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

  useEffect(() => {
    generatePDF();
  }, [generatePDF]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/${userData.dept}/${userData._id}/submit-form`,  // Updated endpoint
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
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
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

      {/* Submit button moved outside the PDF container */}
      {pdfUrl && !loading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-lg font-semibold"
          >
            Submit Form
          </button>
        </div>
      )}
    </div>
  );
};

export default Review;