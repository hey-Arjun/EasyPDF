import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import Footer from '../components/Footer';
import './RepairPDF.css';

const RepairPDF = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [repairResult, setRepairResult] = useState(null);

  const handleFileUpload = (files) => {
    setSelectedFiles(files);
    setRepairResult(null); // Reset result when new file is selected
  };

  const handleRepair = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    setRepairResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);

      const response = await fetch('/api/optimize/repair', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Repair failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setRepairResult(result.data);
      } else {
        throw new Error(result.message || 'Repair failed');
      }
    } catch (error) {
      console.error('Repair error:', error);
      alert('Error repairing PDF: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!repairResult) return;
    
    const downloadUrl = 'http://localhost:5001' + repairResult.downloadUrl;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = repairResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="repair-pdf-page">
      <main className="main-content">
        <div className="container">
          <div className="page-header">
            <h1>Repair PDF files</h1>
            <p>Fix corrupted or damaged PDF files to make them readable again.</p>
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
                className="repair-button"
                onClick={handleRepair}
                disabled={isProcessing}
              >
                {isProcessing ? '🔄 Repairing...' : '🔧 Repair PDF'}
              </button>
            </div>
          )}

          {repairResult && (
            <div className="result-section">
              <div className="result-card">
                <div className="result-header">
                  <h3>✅ PDF Repaired Successfully!</h3>
                </div>
                <div className="result-details">
                  <div className="result-item">
                    <span className="result-label">File Name:</span>
                    <span className="result-value">{repairResult.fileName}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Status:</span>
                    <span className="result-value">Repaired</span>
                  </div>
                </div>
                <button 
                  className="download-button"
                  onClick={handleDownload}
                >
                  📥 Download Repaired PDF
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

export default RepairPDF; 