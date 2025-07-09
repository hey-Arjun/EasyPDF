import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './OrganizePDF.css';

const OrganizePDF = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pageOrder, setPageOrder] = useState('');
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

  const handleOrganize = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }

    if (!pageOrder.trim()) {
      setError('Please enter the new page order');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('pageOrder', pageOrder);

      // Get token from localStorage (assuming user is logged in)
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/organize/reorder`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'PDF organization failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Organize PDF error:', error);
      setError(error.message || 'Failed to organize PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = async (downloadUrl, fileName) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Make authenticated request to get the file
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      link.download = fileName || 'organized-pdf.pdf';
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

  const handlePageOrderChange = (e) => {
    setPageOrder(e.target.value);
    setError(null);
  };

  return (
    <div className="organize-pdf-page">
      <main className="organize-main">
        <div className="container">
          <div className="page-header">
            <h1>Organize PDF</h1>
            <p>Reorder pages in your PDF document</p>
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
                  <h4>Select PDF file to reorganize</h4>
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

            <div className="page-order-section">
              <h4>New Page Order</h4>
              <p className="help-text">
                Specify the new order of pages using page numbers. Examples:
              </p>
              <ul className="examples">
                <li><code>3,1,2</code> - Move page 3 to first, page 1 to second, page 2 to third</li>
                <li><code>5,1-4</code> - Move page 5 to first, then pages 1-4</li>
                <li><code>2,4,1,3</code> - Custom reordering of all pages</li>
              </ul>
              
              <div className="input-group">
                <label htmlFor="pageOrder">New Page Order:</label>
                <input
                  type="text"
                  id="pageOrder"
                  value={pageOrder}
                  onChange={handlePageOrderChange}
                  placeholder="e.g., 3,1,2 or 5,1-4"
                  className="page-order-input"
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
                <h4>✅ PDF organized successfully!</h4>
                <p>Your reorganized PDF is ready for download.</p>
                <div className="download-section">
                  <button 
                    className="download-button primary"
                    onClick={() => downloadFile(result.downloadUrl, result.fileName)}
                  >
                    📥 Download Organized PDF
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
                className="organize-button"
                onClick={handleOrganize}
                disabled={!selectedFile || !pageOrder.trim() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Organizing PDF...
                  </>
                ) : (
                  'Organize PDF'
                )}
              </button>
            </div>
          </div>

          <div className="info-section">
            <h3>How to organize PDFs:</h3>
            <ol>
              <li>Select a PDF file you want to reorganize</li>
              <li>Specify the new page order using page numbers</li>
              <li>Use commas to separate page numbers</li>
              <li>Use hyphens to specify page ranges (e.g., 1-4)</li>
              <li>Click "Organize PDF" to reorder the pages</li>
              <li>Download your PDF with the new page order</li>
            </ol>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrganizePDF; 