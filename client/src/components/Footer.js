import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">EasyPDF</span>
            <span className="footer-tagline">- Your PDF Editor</span>
          </div>
          <div className="footer-copyright">
            © EasyPDF 2025 ® - Your PDF Editor
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 