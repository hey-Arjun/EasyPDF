import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import './WordToPdf.css';

const WordToPdf = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  // useAuth hook is used for authentication context
  useAuth();

  const handleFileSelect = (files) => {
    // Files are already filtered by the FileUpload component based on accept prop
    setSelectedFiles([files[0]]);
    setError(null);
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select a Word document');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);

      // Prepare headers - include Authorization only if user is logged in
      const headers = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/convert-to-pdf/word-to-pdf`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Conversion failed');
      }
    } catch (error) {
      console.error('Word to PDF error:', error);
      setError('Error converting Word document to PDF. Please try again.');
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
    <div className="word-to-pdf-main">
      <div className="word-to-pdf-container">
        <div className="word-to-pdf-header">
          <h1>Convert Word to PDF</h1>
          <p>Convert Word documents (.doc, .docx, .rtf) to PDF format</p>
        </div>

        <div className="upload-section">
          <FileUpload
            onFileSelect={handleFileSelect}
            selectedFiles={selectedFiles}
            accept=".doc,.docx,.rtf"
            multiple={false}
            title="Upload your Word document and convert it to PDF"
            subtitle="Select .doc, .docx, or .rtf files"
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
              <p>Your Word document has been converted to PDF successfully.</p>
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
              <p><strong>PDF file:</strong> {result.fileName}</p>
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

export default WordToPdf; 