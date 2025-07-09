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

  const onDrop = useCallback((acceptedFiles) => {
    console.log('📥 Files dropped:', acceptedFiles.length, 'files');
    console.log('📋 Accepted files:', acceptedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));
    console.log('🔍 Accept config:', acceptConfig);
    console.log('🎯 Accept prop:', accept);
    
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
      console.log('📤 Calling onFileSelect with', acceptedFiles.length, 'files');
      onFileSelect(acceptedFiles);
    }
  }, [onFileUpload, onFileSelect, accept, acceptConfig]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: acceptConfig,
    multiple
  });

  const handleFileSelect = (event) => {
    console.log('📁 Files selected via input:', event.target.files.length, 'files');
    console.log('📋 Event target files:', event.target.files);
    console.log('🎯 Accept prop:', accept);
    console.log('🔍 Event target accept:', event.target.accept);
    
    const files = Array.from(event.target.files);
    console.log('📋 Selected files:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
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
      console.log('📤 Calling onFileSelect with', files.length, 'files');
      onFileSelect(files);
    }
  };

  const handleClick = () => {
    console.log('🖱️ Upload area clicked');
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.filename;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
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
        onClick={handleClick}
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
            {selectedFiles.filter(file => file && file.name).map((file, index) => (
              <li key={index} className="file-item">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button 
                  className="remove-file"
                  onClick={() => {
                    const newFiles = selectedFiles.filter((_, i) => i !== index);
                    console.log('🗑️ Removing file at index:', index);
                    console.log('📁 Remaining files:', newFiles.length);
                    
                    if (onFileUpload) {
                      onFileUpload(newFiles);
                    } else if (onFileSelect) {
                      // Only call onFileSelect if there are remaining files, or pass empty array without triggering error
                      if (newFiles.length > 0) {
                        onFileSelect(newFiles);
                      } else {
                        // For empty array, we need to update the parent component's state
                        onFileSelect([]);
                      }
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