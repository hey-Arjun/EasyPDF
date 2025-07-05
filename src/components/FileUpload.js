import React, { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css';

const FileUpload = ({ 
  onFileUpload, 
  onFileSelect, 
  selectedFiles = [], 
  accept = '.pdf',
  multiple = true,
  title = "Upload your file and transform it.",
  subtitle = "Select PDF files"
}) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (onFileUpload) {
      // For PDF tools, filter to only PDF files
      if (accept === '.pdf') {
        const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
        onFileUpload(pdfFiles);
      } else {
        // For other file types, pass all accepted files
        onFileUpload(acceptedFiles);
      }
    } else if (onFileSelect) {
      onFileSelect(acceptedFiles);
    }
  }, [onFileUpload, onFileSelect, accept]);

  const acceptConfig = useMemo(() => {
    if (accept === '.pdf') {
      return {
        'application/pdf': ['.pdf']
      };
    } else if (accept === 'image/*' || accept.includes('image')) {
      return {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif']
      };
    } else if (accept === '.doc,.docx,.rtf' || accept.includes('doc')) {
      return {
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/rtf': ['.rtf']
      };
    } else if (accept === '.ppt,.pptx' || accept.includes('ppt')) {
      return {
        'application/vnd.ms-powerpoint': ['.ppt'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
      };
    } else if (accept === '.xls,.xlsx,.csv' || accept.includes('xls')) {
      return {
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'text/csv': ['.csv']
      };
    } else if (accept === '.html,.htm' || accept.includes('html')) {
      return {
        'text/html': ['.html', '.htm']
      };
    }
    return undefined;
  }, [accept]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: acceptConfig,
    multiple
  });

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (onFileUpload) {
      // For PDF tools, filter to only PDF files
      if (accept === '.pdf') {
        const pdfFiles = files.filter(file => file.type === 'application/pdf');
        onFileUpload(pdfFiles);
      } else {
        // For other file types, pass all accepted files
        onFileUpload(files);
      }
    } else if (onFileSelect) {
      onFileSelect(files);
    }
  };

  return (
    <div className="file-upload">
      <div className="upload-header">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      <div 
        {...getRootProps()} 
        className="upload-area"
      >
        <input {...getInputProps()} />
        
        <div className="upload-content">
          <div className="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L12 16M12 2L8 6M12 2L16 6" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 12V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V12" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className="upload-text">
            <h4>Upload from computer.</h4>
            <p>or drop files here</p>
          </div>

          <div className="upload-actions">
            <label className="upload-button">
              <input 
                type="file" 
                multiple={multiple}
                accept={accept}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              Choose Files
            </label>
          </div>
        </div>
      </div>

      {selectedFiles && selectedFiles.length > 0 && (
        <div className="selected-files">
          <h4>Selected Files:</h4>
          <ul className="file-list">
            {selectedFiles.map((file, index) => (
              <li key={index} className="file-item">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button 
                  className="remove-file"
                  onClick={() => {
                    const newFiles = selectedFiles.filter((_, i) => i !== index);
                    if (onFileUpload) {
                      onFileUpload(newFiles);
                    } else if (onFileSelect) {
                      onFileSelect(newFiles);
                    }
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 