import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './MergePDF.css';

const MergePDF = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    setSelectedFiles(pdfFiles);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    setSelectedFiles(pdfFiles);
    setError(null);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append('files', file);
      });

      // Prepare headers - include Authorization only if user is logged in
      const headers = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/organize/merge`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to merge PDFs');
      }
    } catch (error) {
      console.error('Merge error:', error);
      setError('An error occurred while merging PDFs');
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
      
      // Make request to get the file
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get the file blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'merged-pdf.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  return (
    <div className="merge-pdf-page">
      <main className="merge-main">
        <div className="container">
          <div className="page-header">
            <h1>Merge PDF</h1>
            <p>Combine multiple PDF files into one document</p>
          </div>

          <div className="upload-section">
            <div className="upload-area" onDragOver={handleDragOver} onDrop={handleDrop}>
              <div className="upload-content">
                <div className="upload-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L12 16M12 2L8 6M12 2L16 6" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 12V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V12" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                <div className="upload-text">
                  <h4>Select PDF files to merge</h4>
                  <p>Drag and drop PDF files here or click to browse</p>
                </div>

                <div className="upload-actions">
                  <label className="upload-button">
                    <input 
                      type="file" 
                      multiple 
                      accept=".pdf"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    Choose Files
                  </label>
                </div>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="selected-files">
                <h4>Selected Files ({selectedFiles.length}):</h4>
                <ul className="file-list">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="file-item">
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <button 
                        className="remove-file"
                        onClick={() => removeFile(index)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {result && (
              <div className="success-message">
                <h4>✅ PDFs merged successfully!</h4>
                <p>Your merged PDF is ready for download.</p>
                <div className="download-section">
                  <button 
                    className="download-button primary"
                    onClick={() => downloadFile(result.downloadUrl, result.fileName)}
                  >
                    📥 Download Merged PDF
                  </button>
                  <div className="download-info">
                    <span className="file-name">File: {result.fileName}</span>
                    {user && result.jobId && (
                      <span className="job-id">Job ID: {result.jobId}</span>
                    )}
                    {!user && (
                      <span className="anonymous-notice">💡 <a href="/signup">Sign up</a> to save your job history</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button 
                className="merge-button"
                onClick={handleMerge}
                disabled={selectedFiles.length < 2 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Merging PDFs...
                  </>
                ) : (
                  'Merge PDFs'
                )}
              </button>
            </div>
          </div>

          <div className="info-section">
            <h3>How to merge PDFs:</h3>
            <ol>
              <li>Select multiple PDF files you want to merge</li>
              <li>Arrange them in the desired order (drag to reorder)</li>
              <li>Click "Merge PDFs" to combine them</li>
              <li>Download your merged PDF file</li>
            </ol>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MergePDF; 