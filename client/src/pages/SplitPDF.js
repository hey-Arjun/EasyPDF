import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './SplitPDF.css';

const SplitPDF = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pageRanges, setPageRanges] = useState('');
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

  const handleSplit = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }

    if (!pageRanges.trim()) {
      setError('Please specify page ranges (e.g., 1-3,5,7-9)');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('pageRanges', pageRanges);

      // Prepare headers - include Authorization only if user is logged in
      const headers = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/organize/split', {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to split PDF');
      }
    } catch (error) {
      console.error('Split error:', error);
      setError('An error occurred while splitting PDF');
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
      link.download = fileName || 'split-pdf.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handlePageRangeChange = (e) => {
    setPageRanges(e.target.value);
    setError(null);
  };

  return (
    <div className="split-pdf-page">
      <main className="split-main">
        <div className="container">
          <div className="page-header">
            <h1>Split PDF</h1>
            <p>Split your PDF into multiple files by page ranges</p>
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
                  <h4>Select PDF file to split</h4>
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

            <div className="page-ranges-section">
              <h4>Page Ranges</h4>
              <p className="help-text">
                Specify which pages to include in each split file. Examples:
              </p>
              <ul className="examples">
                <li><code>1-3,5,7-9</code> - Pages 1-3, 5, and 7-9</li>
                <li><code>1,3,5</code> - Pages 1, 3, and 5</li>
                <li><code>1-10</code> - Pages 1 through 10</li>
              </ul>
              
              <div className="input-group">
                <label htmlFor="pageRanges">Page Ranges:</label>
                <input
                  type="text"
                  id="pageRanges"
                  value={pageRanges}
                  onChange={handlePageRangeChange}
                  placeholder="e.g., 1-3,5,7-9"
                  className="page-ranges-input"
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
                <h4>✅ PDF split successfully!</h4>
                <p>Your split PDF files are ready for download.</p>
                <div className="download-section">
                  <div className="download-files">
                    {result.files.map((file, index) => (
                      <button 
                        key={index}
                        className="download-button primary"
                        onClick={() => downloadFile(file.downloadUrl, file.fileName)}
                      >
                        📥 Download {file.fileName} (Pages {file.pages})
                      </button>
                    ))}
                  </div>
                  <div className="download-info">
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
                className="split-button"
                onClick={handleSplit}
                disabled={!selectedFile || !pageRanges.trim() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Splitting PDF...
                  </>
                ) : (
                  'Split PDF'
                )}
              </button>
            </div>
          </div>

          <div className="info-section">
            <h3>How to split PDFs:</h3>
            <ol>
              <li>Select a PDF file you want to split</li>
              <li>Specify the page ranges for each split file</li>
              <li>Use commas to separate different ranges</li>
              <li>Use hyphens to specify page ranges (e.g., 1-5)</li>
              <li>Click "Split PDF" to create separate files</li>
              <li>Download each split file individually</li>
            </ol>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SplitPDF; 
