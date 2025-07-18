import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import Footer from '../components/Footer';
import './OCRPDF.css';

const OCRPDF = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  const handleFileUpload = (files) => {
    setSelectedFiles(files);
    setOcrResult(null); // Reset result when new file is selected
  };

  const handleOCR = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    setOcrResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);

      const response = await fetch('/api/optimize/ocr', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'OCR processing failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setOcrResult(result.data);
      } else {
        throw new Error(result.message || 'OCR processing failed');
      }
    } catch (error) {
      console.error('OCR error:', error);
      alert('Error processing OCR: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!ocrResult) return;
    const downloadUrl = process.env.REACT_APP_API_URL + ocrResult.downloadUrl;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = ocrResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="ocr-pdf-page">
      <main className="main-content">
        <div className="container">
          <div className="page-header">
            <h1>OCR PDF files</h1>
            <p>Extract text from scanned PDF documents and make them searchable.</p>
          </div>

          <div className="upload-section">
            <FileUpload 
              onFileUpload={handleFileUpload}
              selectedFiles={selectedFiles}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="options-section">
              <button 
                className="ocr-button"
                onClick={handleOCR}
                disabled={isProcessing}
              >
                {isProcessing ? '🔄 Processing OCR...' : '🔍 Extract Text with OCR'}
              </button>
            </div>
          )}

          {ocrResult && (
            <div className="result-section">
              <div className="result-card">
                <div className="result-header">
                  <h3>✅ OCR Processing Complete!</h3>
                </div>
                <div className="result-details">
                  <div className="result-item">
                    <span className="result-label">File Name:</span>
                    <span className="result-value">{ocrResult.fileName}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Pages Processed:</span>
                    <span className="result-value">{ocrResult.pageCount}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Language:</span>
                    <span className="result-value">{ocrResult.language}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Status:</span>
                    <span className="result-value">Text Extracted</span>
                  </div>
                </div>
                <button 
                  className="download-button"
                  onClick={handleDownload}
                >
                  📥 Download OCR PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OCRPDF; 
