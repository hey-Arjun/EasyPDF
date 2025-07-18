import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import './JpgToPdf.css';

const JpgToPdf = () => {
  console.log('🎯 JpgToPdf component loaded');
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  // useAuth hook is used for authentication context
  useAuth();

  const handleFileSelect = (files) => {
    console.log('🎯 handleFileSelect called with', files.length, 'files');
    console.log('📋 Files details:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    // Check if files are actually File objects
    const validFiles = files.filter(file => file instanceof File);
    console.log('✅ Valid File objects:', validFiles.length);
    
    // Always update the state, even if empty (for file removal)
    setSelectedFiles(Array.from(validFiles));
    
    // Only show error if we're trying to add files but none are valid
    if (files.length > 0 && validFiles.length === 0) {
      console.error('❌ No valid files found!');
      setError('No valid files selected. Please try again.');
      return;
    }
    
    // Clear error when files are removed or valid files are selected
    setError(null);
    console.log('✅ Files set to state:', validFiles.length, 'files');
  };

  const handleConvert = async () => {
    console.log('🔄 Convert button clicked');
    console.log('📁 Selected files:', selectedFiles);
    
    if (selectedFiles.length === 0) {
      setError('Please select at least one image file');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        console.log('📎 Adding file to FormData:', file.name, file.type, file.size);
        formData.append('images', file);
      });

      // Prepare headers - include Authorization only if user is logged in
      const headers = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token found, adding Authorization header');
      } else {
        console.log('⚠️ No token found, proceeding without Authorization');
      }
      
      console.log('🌐 Making fetch request to /api/convert-to-pdf/jpg-to-pdf');
      const response = await fetch('/api/convert-to-pdf/jpg-to-pdf', {
        method: 'POST',
        headers,
        body: formData
      });

      console.log('📡 Response received:', response.status, response.statusText);
      const data = await response.json();
      console.log('📄 Response data:', data);

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Conversion failed');
      }
    } catch (error) {
      console.error('❌ JPG to PDF error:', error);
      setError('Error converting images to PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = async (downloadUrl, fileName) => {
    try {
      // Prepare headers - include Authorization only if user is logged in
      const headers = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Error downloading file. Please try again.');
    }
  };

  return (
    <div className="jpg-to-pdf-main">
      <div className="jpg-to-pdf-container">
        <div className="jpg-to-pdf-header">
          <h1>Convert Images to PDF</h1>
          <p>Convert JPG, PNG, and GIF images to a single PDF document</p>
        </div>

        <div className="upload-section">
          <FileUpload
            onFileSelect={handleFileSelect}
            selectedFiles={selectedFiles}
            accept="image/*"
            multiple={true}
            title="Upload your images and convert them to PDF"
            subtitle="Select JPG, PNG, or GIF images"
          />
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="convert-section">
          <button
            onClick={handleConvert}
            disabled={selectedFiles.length === 0 || isProcessing}
            className="convert-button"
          >
            {isProcessing ? 'Converting...' : 'Convert to PDF'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <div className="success-message">
              <h3>✅ Conversion Successful!</h3>
              <p>Your images have been converted to PDF successfully.</p>
              {result.jobId ? (
                <p className="job-info">Job ID: <span className="job-id">{result.jobId}</span></p>
              ) : (
                <p className="signup-prompt">
                  💡 <strong>Sign up</strong> to save your conversion history and access files anytime!
                </p>
              )}
            </div>
            
            <div className="file-info">
              <p><strong>File:</strong> {result.fileName}</p>
              <p><strong>Images processed:</strong> {result.imageCount}</p>
            </div>

            <div className="download-section">
              <button
                onClick={() => downloadFile(result.downloadUrl, result.fileName)}
                className="download-button"
              >
                📥 Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JpgToPdf; 
