import React from 'react';
import './CompressionOptions.css';

const CompressionOptions = ({ compressionLevel, onCompressionLevelChange }) => {
  const options = [
    {
      id: 'extreme',
      title: 'Extreme Compression',
      description: 'Less quality, high compression',
      icon: '🗜️'
    },
    {
      id: 'recommended',
      title: 'Recommended Compression',
      description: 'Good quality, good compression',
      icon: '⚖️'
    },
    {
      id: 'less',
      title: 'Less compression',
      description: 'High quality, less compression',
      icon: '📄'
    }
  ];

  return (
    <div className="compression-options">
      <h3>Compression level</h3>
      
      <div className="options-grid">
        {options.map((option) => (
          <div
            key={option.id}
            className={`option-card ${compressionLevel === option.id ? 'selected' : ''}`}
            onClick={() => onCompressionLevelChange(option.id)}
          >
            <div className="option-icon">{option.icon}</div>
            <div className="option-content">
              <h4>{option.title}</h4>
              <p>{option.description}</p>
            </div>
            <div className="option-radio">
              <div className={`radio-button ${compressionLevel === option.id ? 'checked' : ''}`}>
                {compressionLevel === option.id && <div className="radio-dot"></div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompressionOptions; 