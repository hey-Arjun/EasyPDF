import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './ScanToPDF.css';

const ScanToPDF = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      file.type === 'application/pdf'
    );
    setSelectedFiles(imageFiles);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      file.type === 'application/pdf'
    );
    setSelectedFiles(imageFiles);
    setError(null);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleScanToPDF = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image or PDF file');
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

      // Get token from localStorage (assuming user is logged in)
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/organize/scan-to-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to convert to PDF');
      }
    } catch (error) {
      console.error('Scan to PDF error:', error);
      setError('An error occurred while converting to PDF');
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
      link.download = fileName || 'scanned-pdf.pdf';
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

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) {
      return 'Image';
    } else if (file.type === 'application/pdf') {
      return 'PDF';
    }
    return 'Unknown';
  };

  return (
    <div className="scan-to-pdf-page">
      <main className="scan-main">
        <div className="container">
          <div className="page-header">
            <h1>Scan to PDF</h1>
            <p>Convert images and documents to PDF format</p>
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
                  <h4>Select images or documents to convert</h4>
                  <p>Drag and drop image files here or click to browse</p>
                  <p className="supported-formats">Supported formats: JPG, PNG, GIF, BMP, TIFF, PDF</p>
                </div>

                <div className="upload-actions">
                  <label className="upload-button">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,.pdf"
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
                        <span className="file-type">{getFileType(file)}</span>
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
                <h4>✅ PDF created successfully!</h4>
                <p>Your PDF is ready for download.</p>
                <div className="download-section">
                  <button 
                    className="download-button primary"
                    onClick={() => downloadFile(result.downloadUrl, result.fileName)}
                  >
                    📥 Download PDF
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
                className="scan-button"
                onClick={handleScanToPDF}
                disabled={selectedFiles.length === 0 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Converting to PDF...
                  </>
                ) : (
                  'Convert to PDF'
                )}
              </button>
            </div>
          </div>

          <div className="info-section">
            <h3>How to convert to PDF:</h3>
            <ol>
              <li>Select image files or documents you want to convert</li>
              <li>Supported formats: JPG, PNG, GIF, BMP, TIFF, PDF</li>
              <li>Arrange them in the desired order (drag to reorder)</li>
              <li>Click "Convert to PDF" to create a PDF document</li>
              <li>Download your converted PDF file</li>
            </ol>
            
            <div className="features">
              <h4>Features:</h4>
              <ul>
                <li>Convert multiple images to a single PDF</li>
                <li>Maintain image quality and resolution</li>
                <li>Support for various image formats</li>
                <li>Fast and secure conversion</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ScanToPDF; 