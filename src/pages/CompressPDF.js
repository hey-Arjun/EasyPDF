import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import CompressionOptions from '../components/CompressionOptions';
import CompressButton from '../components/CompressButton';
import Footer from '../components/Footer';
import './CompressPDF.css';

const CompressPDF = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [compressionLevel, setCompressionLevel] = useState('recommended');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (files) => {
    setSelectedFiles(files);
  };

  const handleCompressionLevelChange = (level) => {
    setCompressionLevel(level);
  };

  const handleCompress = () => {
    if (selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      // Handle download logic here
    }, 3000);
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompressPDF; 