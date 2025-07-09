import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import CompressionOptions from '../components/CompressionOptions';
import CompressButton from '../components/CompressButton';
import Footer from '../components/Footer';
import './CompressPDF.css';

const CompressPDF = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [compressionLevel, setCompressionLevel] = useState('recommended');
  const [compressionValue, setCompressionValue] = useState(60);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionResult, setCompressionResult] = useState(null);

  // Debug effect to monitor compressionResult changes
  useEffect(() => {
    console.log('compressionResult state changed:', compressionResult);
  }, [compressionResult]);



  const handleFileUpload = (files) => {
    setSelectedFiles(files);
    setCompressionResult(null); // Reset result when new file is selected
  };

  const handleCompressionLevelChange = (level, value) => {
    setCompressionLevel(level);
    setCompressionValue(value);
  };

  const handleCompress = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    setCompressionResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);
      formData.append('compressionLevel', compressionLevel);
      formData.append('compressionValue', compressionValue);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/optimize/compress`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Compression failed');
      }

      const result = await response.json();
      console.log('Full response:', result);
      console.log('Response data:', result.data);
      
      if (result.success) {
        console.log('Setting compression result with:', result.data);
        setCompressionResult(result.data);
      } else {
        throw new Error(result.message || 'Compression failed');
      }
    } catch (error) {
      console.error('Compression error:', error);
      alert('Error compressing PDF: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressionResult) return;
    
    const downloadUrl = 'http://localhost:5001' + compressionResult.downloadUrl;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = compressionResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert bytes to KB/MB for display
  const formatFileSize = (bytes) => {
    console.log('formatFileSize called with:', bytes, typeof bytes);
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const result = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    console.log('formatFileSize result:', result);
    return result;
  };

  // Calculate compression percentage based on user's slider selection
  const getCompressionPercentage = () => {
    return compressionValue;
  };

  return (
    <div className="compress-pdf-page">
      <main className="main-content">
        <div className="container">
          <div className="page-header">
            <h1>Compress PDF files</h1>
            <p>Reduce file size while optimizing for maximal PDF quality.</p>
          </div>

          <div className="upload-section">
            <FileUpload 
              onFileUpload={handleFileUpload}
              selectedFiles={selectedFiles}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="options-section">
              <CompressionOptions 
                compressionLevel={compressionLevel}
                onCompressionLevelChange={handleCompressionLevelChange}
              />
              
              <CompressButton 
                onClick={handleCompress}
                isProcessing={isProcessing}
                disabled={selectedFiles.length === 0}
              />
            </div>
          )}

          {compressionResult && (
            <div className="result-section">
              <div className="result-card">
                <div className="result-header">
                  <h3>✅ Compression Complete!</h3>
                </div>
                <div className="result-details">
                  <div className="result-item">
                    <span className="result-label">Original Size:</span>
                    <span className="result-value">{formatFileSize(compressionResult.originalSizeBytes || 0)}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Compressed Size:</span>
                    <span className="result-value">{formatFileSize(compressionResult.compressedSizeBytes || 0)}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Size Reduction:</span>
                    <span className="result-value">{compressionResult.compressionRatio || 'N/A'}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Compression Requested:</span>
                    <span className="result-value">{compressionResult.compressionRatio || 'N/A'}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Actual Compression:</span>
                    <span className="result-value">{compressionResult.actualCompressionRatio || 'N/A'}</span>
                  </div>
                </div>
                <button 
                  className="download-button"
                  onClick={handleDownload}
                >
                  📥 Download Compressed PDF
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

export default CompressPDF; 