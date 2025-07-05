import React from 'react';
import './CompressButton.css';

const CompressButton = ({ onClick, isProcessing, disabled }) => {
  return (
    <div className="compress-button-container">
      <button
        className={`compress-button ${isProcessing ? 'processing' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={onClick}
        disabled={disabled || isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="spinner"></div>
            <span>Compressing PDF...</span>
          </>
        ) : (
          <span>Click on COMPRESS PDF button</span>
        )}
      </button>
    </div>
  );
};

export default CompressButton; 