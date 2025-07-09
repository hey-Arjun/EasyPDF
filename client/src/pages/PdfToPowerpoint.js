import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import './PdfToPowerpoint.css';

const PdfToPowerpoint = () => {
  console.log('🎯 PdfToPowerpoint component loaded');
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
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
      setError('Please select a PDF file');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);
      console.log('📎 Adding file to FormData:', selectedFiles[0].name, selectedFiles[0].type, selectedFiles[0].size);

      // Prepare headers - include Authorization only if user is logged in
      const headers = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token found, adding Authorization header');
      } else {
        console.log('⚠️ No token found, proceeding without Authorization');
      }
      
      console.log('🌐 Making fetch request to /api/convert-from-pdf/pdf-to-powerpoint');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/convert-from-pdf/pdf-to-powerpoint`, {
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
      console.error('❌ PDF to PowerPoint error:', error);
      setError('Error converting PDF to PowerPoint. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = async (downloadUrl, fileName) => {
    try {
      setIsDownloading(true);
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
      
      console.log(`✅ Downloaded: ${fileName}`);
    } catch (error) {
      console.error('Download error:', error);
      setError('Error downloading file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="pdf-to-powerpoint-main">
      <div className="pdf-to-powerpoint-container">
        <div className="pdf-to-powerpoint-header">
          <h1>Convert PDF to PowerPoint</h1>
          <p>Convert PDF documents to editable PowerPoint format (.pptx)</p>
        </div>

        <div className="upload-section">
          <FileUpload
            onFileSelect={handleFileSelect}
            selectedFiles={selectedFiles}
            accept="application/pdf"
            multiple={false}
            title="Upload your PDF and convert it to PowerPoint"
            subtitle="Select a PDF file"
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
            {isProcessing ? 'Converting...' : 'Convert to PowerPoint'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <div className="success-message">
              <h3>✅ Conversion Successful!</h3>
              <p>Your PDF has been converted to PowerPoint successfully.</p>
              {result.jobId ? (
                <p className="job-info">Job ID: <span className="job-id">{result.jobId}</span></p>
              ) : (
                <p className="signup-prompt">
                  💡 <strong>Sign up</strong> to save your conversion history and access files anytime!
                </p>
              )}
            </div>
            
            <div className="file-info">
              <p><strong>Original file:</strong> {result.originalFile}</p>
              <p><strong>PowerPoint file:</strong> {result.fileName}</p>
            </div>

            <div className="download-section">
              <button
                onClick={() => downloadFile(result.downloadUrl, result.fileName)}
                disabled={isDownloading}
                className="download-button"
              >
                {isDownloading ? '⏳ Downloading...' : '📥 Download PowerPoint Presentation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfToPowerpoint; 