import React, { useState, useEffect, useCallback } from 'react';
import { Download, RefreshCw, ShieldAlert, AlertTriangle, FileText, User, Calendar, Award, Save, Trash2, Eye, Archive, X } from 'lucide-react';
import Cookies from 'js-cookie';

const Review = () => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [isFormFrozen, setIsFormFrozen] = useState(false);
  const [formStatus, setFormStatus] = useState('pending'); // Default status
  const [pdfMetadata, setPdfMetadata] = useState(null);
  const [pdfExists, setPdfExists] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);
  const [deletingPdf, setDeletingPdf] = useState(false);
  const [showSavedPdfsModal, setShowSavedPdfsModal] = useState(false);
  const [savedPdfs, setSavedPdfs] = useState([]);
  const [loadingSavedPdfs, setLoadingSavedPdfs] = useState(false);
  const [selectedPdfForDelete, setSelectedPdfForDelete] = useState(null);
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

      // First, try to get existing PDF from faculty profile
      const pdfResponse = await fetch(
        `${import.meta.env.VITE_BASE_URL}/${userData.dept}/${userData._id}/faculty-pdf`,
        {
          method: 'GET',
        }
      );

      if (pdfResponse.ok) {
        // PDF exists in faculty profile
        const blob = await pdfResponse.blob();
        const url = URL.createObjectURL(blob);

        clearInterval(progressInterval);
        setLoadingProgress(100);

        // Cache the PDF URL in cookie (24 hour expiry)
        Cookies.set('pdfData', url, { expires: 1 });
        setPdfUrl(url);
        setPdfExists(true);
      } else {
        // PDF doesn't exist, generate new one
        const generateResponse = await fetch(
          `${import.meta.env.VITE_BASE_URL}/${userData.dept}/${userData._id}/generate-doc`,
          {
            method: 'GET',
          }
        );

        if (!generateResponse.ok) throw new Error('Failed to generate PDF');

        const blob = await generateResponse.blob();
        const url = URL.createObjectURL(blob);

        clearInterval(progressInterval);
        setLoadingProgress(100);

        // Cache the PDF URL in cookie (24 hour expiry)
        Cookies.set('pdfData', url, { expires: 1 });
        setPdfUrl(url);
        setPdfExists(true);
        
        // Refresh metadata after generating new PDF
        fetchPdfMetadata();
      }
    } catch (error) {
      console.error('Error generating/retrieving PDF:', error);
      setPdfExists(false);
    } finally {
      setLoading(false);
      setLoadingProgress(0);
    }
  }, [userData.dept, userData._id]);

  // Fetch PDF metadata
  const fetchPdfMetadata = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/${userData.dept}/${userData._id}/pdf-metadata`,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        const metadata = await response.json();
        setPdfMetadata(metadata);
        setPdfExists(true);
      } else {
        setPdfMetadata(null);
        setPdfExists(false);
      }
    } catch (error) {
      console.error('Error fetching PDF metadata:', error);
      setPdfMetadata(null);
      setPdfExists(false);
    }
  }, [userData.dept, userData._id]);

  // Fetch all saved PDFs
  const fetchSavedPdfs = useCallback(async () => {
    setLoadingSavedPdfs(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/${userData.dept}/${userData._id}/saved-pdfs`,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSavedPdfs(data.pdfs || []);
      } else {
        setSavedPdfs([]);
      }
    } catch (error) {
      console.error('Error fetching saved PDFs:', error);
      setSavedPdfs([]);
    } finally {
      setLoadingSavedPdfs(false);
    }
  }, [userData.dept, userData._id]);

  // Save PDF to faculty profile
  const handleSavePdf = useCallback(async () => {
    setSavingPdf(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/${userData.dept}/${userData._id}/save-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save PDF');
      }

      const result = await response.json();
      
      if (result.already_exists) {
        alert('PDF is already saved to your profile!');
      } else {
        alert('PDF saved to your profile successfully!');
      }
      
      // Refresh metadata and PDF status
      fetchPdfMetadata();
      generatePDF();
      
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Failed to save PDF. Please try again.');
    } finally {
      setSavingPdf(false);
    }
  }, [userData.dept, userData._id, fetchPdfMetadata, generatePDF]);

  // View saved PDF from faculty profile
  const handleViewSavedPdf = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/${userData.dept}/${userData._id}/faculty-pdf`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          alert('No saved PDF found in your profile. Please generate and save a PDF first.');
        } else {
          throw new Error('Failed to load saved PDF');
        }
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Cache the PDF URL in cookie (24 hour expiry)
      Cookies.set('pdfData', url, { expires: 1 });
      setPdfUrl(url);
      setPdfExists(true);

      // Refresh metadata to ensure it's up to date
      fetchPdfMetadata();

      alert('Saved PDF loaded successfully!');

    } catch (error) {
      console.error('Error loading saved PDF:', error);
      alert('Failed to load saved PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userData.dept, userData._id, fetchPdfMetadata]);

  // View specific saved PDF by ID
  const handleViewSpecificPdf = useCallback(async (pdfId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/${userData.dept}/${userData._id}/view-saved-pdf/${pdfId}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Open PDF in new tab
      window.open(url, '_blank');

    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userData.dept, userData._id]);

  // Delete specific saved PDF
  const handleDeleteSpecificPdf = useCallback(async (pdfId) => {
    setDeletingPdf(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/${userData.dept}/${userData._id}/delete-saved-pdf/${pdfId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete PDF');
      }

      alert('PDF deleted successfully!');
      setSelectedPdfForDelete(null);
      
      // Refresh saved PDFs list
      fetchSavedPdfs();
      
    } catch (error) {
      console.error('Error deleting PDF:', error);
      alert('Failed to delete PDF. Please try again.');
    } finally {
      setDeletingPdf(false);
    }
  }, [userData.dept, userData._id, fetchSavedPdfs]);

  // Fetch form status from API
  const fetchFormStatus = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/${userData.dept}/${userData._id}/get-status`,
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
    fetchPdfMetadata();
    fetchSavedPdfs();
  }, [generatePDF, fetchFormStatus, fetchPdfMetadata, fetchSavedPdfs]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/${userData.dept}/${userData._id}/submit-form`,
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
        `${import.meta.env.VITE_BASE_URL}/${userData.dept}/${userData._id}/submit-form`,
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
            {pdfUrl && pdfExists && (
              <a
                href={pdfUrl}
                download={`${userData._id}_appraisal_${pdfMetadata?.appraisal_year || new Date().getFullYear()}.pdf`}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download size={20} />
                Download PDF
              </a>
            )}
            <button
              onClick={() => {
                setShowSavedPdfsModal(true);
                fetchSavedPdfs();
              }}
              className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
              disabled={loadingSavedPdfs}
            >
              <Archive size={20} className={loadingSavedPdfs ? 'animate-spin' : ''} />
              {loadingSavedPdfs ? 'Loading...' : 'Saved PDFs'}
            </button>
            <button
              onClick={() => generatePDF(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              {pdfExists ? 'Regenerate PDF' : 'Generate PDF'}
            </button>
            {pdfUrl && (
              <button
                onClick={handleSavePdf}
                className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                disabled={savingPdf}
              >
                <Save size={20} className={savingPdf ? 'animate-pulse' : ''} />
                {savingPdf ? 'Saving...' : 'Save to Profile'}
              </button>
            )}
          </div>
        </div>

        {/* PDF Metadata Display */}
        {pdfMetadata && pdfExists && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={20} />
                Faculty Appraisal Document
              </h3>
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <ShieldAlert size={12} />
                Secure Access
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              This document is securely stored in your faculty profile and can only be accessed by you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User size={16} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Faculty Name</p>
                  <p className="font-medium">{pdfMetadata.faculty_name || 'Not Available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-medium">{pdfMetadata.faculty_designation || 'Not Available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Appraisal Year</p>
                  <p className="font-medium">{pdfMetadata.appraisal_year || new Date().getFullYear()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium capitalize">{pdfMetadata.status?.replace('_', ' ') || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {pdfMetadata.upload_date ? new Date(pdfMetadata.upload_date).toLocaleDateString() : 'Not Available'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Not Available Message */}
        {!pdfExists && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-yellow-600" />
              <p className="text-yellow-800 font-medium">PDF Document Not Available</p>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Your appraisal document has not been generated yet. Click "Generate PDF" to create your faculty appraisal document.
            </p>
          </div>
        )}

        {/* Saved PDF Status */}
        {pdfExists && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-green-800 font-medium">PDF Saved to Profile</p>
                  <p className="text-green-700 text-sm">
                    Your appraisal document is securely stored in your faculty profile
                  </p>
                </div>
              </div>
              {!pdfUrl && (
                <button
                  onClick={handleViewSavedPdf}
                  className="flex items-center gap-2 bg-purple-500 text-white px-3 py-1.5 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                  disabled={loading}
                >
                  <Eye size={16} />
                  View Saved PDF
                </button>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-center mt-2 text-gray-600">
              {pdfExists ? 'Regenerating PDF...' : 'Generating PDF...'} {loadingProgress}%
            </p>
          </div>
        )}

        {pdfUrl && pdfExists && !loading && (
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

      {/* Saved PDFs Modal */}
      {showSavedPdfsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-3xl w-full m-4 animate-modal-appear max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Archive size={24} className="text-indigo-600" />
                <h3 className="text-2xl font-semibold text-gray-900">Saved PDFs</h3>
              </div>
              <button
                onClick={() => setShowSavedPdfsModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {loadingSavedPdfs ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin">
                  <RefreshCw size={32} className="text-indigo-600" />
                </div>
                <p className="mt-2 text-gray-600">Loading saved PDFs...</p>
              </div>
            ) : savedPdfs.length > 0 ? (
              <div className="space-y-3">
                {savedPdfs.map((pdf, index) => (
                  <div
                    key={pdf._id || index}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <FileText size={20} className="text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{pdf.filename || `PDF ${index + 1}`}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Faculty: {pdf.faculty_name || 'Not Available'}</p>
                          <p>Year: {pdf.appraisal_year || 'Not Available'}</p>
                          <p>
                            Saved: {pdf.upload_date ? new Date(pdf.upload_date).toLocaleDateString() : 'Not Available'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewSpecificPdf(pdf._id)}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                      >
                        <Eye size={18} />
                        View
                      </button>
                      <button
                        onClick={() => setSelectedPdfForDelete(pdf._id)}
                        disabled={deletingPdf}
                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300"
                      >
                        <Trash2 size={18} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Archive size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg">No saved PDFs yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Generate and save a PDF to see it here
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSavedPdfsModal(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Specific PDF Confirmation Modal */}
      {selectedPdfForDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-[60]">
          <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full m-4 animate-modal-appear">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Saved PDF</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this PDF? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setSelectedPdfForDelete(null)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  disabled={deletingPdf}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteSpecificPdf(selectedPdfForDelete)}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  disabled={deletingPdf}
                >
                  {deletingPdf ? 'Deleting...' : 'Delete PDF'}
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