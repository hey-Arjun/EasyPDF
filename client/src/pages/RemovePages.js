import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './RemovePages.css';

const RemovePages = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pagesToRemove, setPagesToRemove] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleRemovePages = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }

    if (!pagesToRemove.trim()) {
      setError('Please specify which pages to remove');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('pagesToRemove', pagesToRemove);

      // Prepare headers - include Authorization only if user is logged in
      const headers = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
        const response = await fetch('/api/organize/remove-pages', {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to remove pages');
      }
    } catch (error) {
      console.error('Remove pages error:', error);
      setError('An error occurred while removing pages');
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
      link.download = fileName || 'removed-pages-pdf.pdf';
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

  const handlePagesChange = (e) => {
    setPagesToRemove(e.target.value);
    setError(null);
  };

  return (
    <div className="remove-pages-page">
      <main className="remove-main">
        <div className="container">
          <div className="page-header">
            <h1>Remove Pages</h1>
            <p>Remove specific pages from your PDF document</p>
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
                  <h4>Select PDF file to remove pages from</h4>
                  <p>Drag and drop a PDF file here or click to browse</p>
                </div>

                <div className="upload-actions">
                  <label className="upload-button">
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    Choose File
                  </label>
                </div>
              </div>
            </div>

            {selectedFile && (
              <div className="selected-file">
                <h4>Selected File:</h4>
                <div className="file-item">
                  <div className="file-info">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button 
                    className="remove-file"
                    onClick={() => setSelectedFile(null)}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <div className="pages-section">
              <h4>Pages to Remove</h4>
              <p className="help-text">
                Specify which pages you want to remove from the PDF. Examples:
              </p>
              <ul className="examples">
                <li><code>1,3,5</code> - Remove pages 1, 3, and 5</li>
                <li><code>2-4</code> - Remove pages 2 through 4</li>
                <li><code>1,3-5,7</code> - Remove pages 1, 3-5, and 7</li>
              </ul>
              
              <div className="input-group">
                <label htmlFor="pagesToRemove">Pages to Remove:</label>
                <input
                  type="text"
                  id="pagesToRemove"
                  value={pagesToRemove}
                  onChange={handlePagesChange}
                  placeholder="e.g., 1,3,5 or 2-4"
                  className="pages-input"
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {result && (
              <div className="success-message">
                <h4>✅ Pages removed successfully!</h4>
                <p>Your PDF with pages removed is ready for download.</p>
                <div className="download-section">
                  <button 
                    className="download-button primary"
                    onClick={() => downloadFile(result.downloadUrl, result.fileName)}
                  >
                    📥 Download Modified PDF
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
                className="remove-button"
                onClick={handleRemovePages}
                disabled={!selectedFile || !pagesToRemove.trim() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Removing Pages...
                  </>
                ) : (
                  'Remove Pages'
                )}
              </button>
            </div>
          </div>

          <div className="info-section">
            <h3>How to remove pages:</h3>
            <ol>
              <li>Select a PDF file you want to modify</li>
              <li>Specify which pages to remove using page numbers</li>
              <li>Use commas to separate individual pages</li>
              <li>Use hyphens to specify page ranges (e.g., 2-4)</li>
              <li>Click "Remove Pages" to create the modified PDF</li>
              <li>Download your PDF with the specified pages removed</li>
            </ol>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RemovePages; 
