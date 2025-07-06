import React from 'react';
import './CompressionOptions.css';

const CompressionOptions = ({ compressionLevel, onCompressionLevelChange }) => {
  // Convert compression level to slider value (1-100) with uniform mapping
  const getSliderValue = (level) => {
    const levelMap = {
      'extreme': 10,
      'high': 30,
      'recommended': 50,
      'low': 70,
      'minimal': 90
    };
    return levelMap[level] || 50;
  };

  // Convert slider value to compression level with uniform ranges
  const getCompressionLevel = (value) => {
    if (value <= 20) return 'extreme';
    if (value <= 40) return 'high';
    if (value <= 60) return 'recommended';
    if (value <= 80) return 'low';
    return 'minimal';
  };

  // Get compression percentage (higher value = higher compression)
  const getCompressionPercentage = (value) => {
    return Math.round(value);
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    const level = getCompressionLevel(value);
    onCompressionLevelChange(level, value);
  };

  // Handle mouse wheel events for smooth scrolling
  const handleWheel = (e) => {
    e.preventDefault();
    const slider = e.target;
    const currentValue = parseInt(slider.value);
    const delta = e.deltaY > 0 ? -1 : 1;
    const newValue = Math.max(1, Math.min(100, currentValue + delta));
    
    slider.value = newValue;
    const level = getCompressionLevel(newValue);
    onCompressionLevelChange(level, newValue);
  };

  const currentValue = getSliderValue(compressionLevel);
  const compressionPercentage = getCompressionPercentage(currentValue);

  return (
    <div className="compression-options">
      <h3>Compression Level</h3>
      <div className="slider-container">
        <div className="slider-header">
          <span className="slider-label">Compression: {compressionPercentage}%</span>
        </div>
        <div className="slider-wrapper">
          <input
            type="range"
            min="1"
            max="100"
            value={currentValue}
            onChange={handleSliderChange}
            onWheel={handleWheel}
            className="compression-slider"
            step="1"
          />
          <div className="slider-labels">
            <span>1%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompressionOptions; 