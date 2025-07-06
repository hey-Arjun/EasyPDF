import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsAccountDropdownOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <span className="logo-text">EasyPDF</span>
          </Link>
        </div>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item dropdown">
              <button className="nav-link" type="button">
                All PDF tools
                <span className="dropdown-arrow">▼</span>
              </button>
              <div className="dropdown-menu">
                <div className="dropdown-section">
                  <h4>Organize PDF</h4>
                  <ul>
                    <li><Link to="/merge-pdf">Merge PDF</Link></li>
                    <li><Link to="/split-pdf">Split PDF</Link></li>
                    <li><Link to="/remove-pages">Remove pages</Link></li>
                    <li><Link to="/extract-pages">Extract pages</Link></li>
                    <li><Link to="/organize-pdf">Organize PDF</Link></li>
                    <li><Link to="/scan-to-pdf">Scan to PDF</Link></li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Optimize PDF</h4>
                  <ul>
                    <li><Link to="/compress-pdf">Compress PDF</Link></li>
                    <li><Link to="/repair-pdf">Repair PDF</Link></li>
                    <li><Link to="/ocr-pdf">OCR PDF</Link></li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Convert to PDF</h4>
                  <ul>
                    <li><Link to="/jpg-to-pdf">JPG to PDF</Link></li>
                    <li><Link to="/word-to-pdf">WORD to PDF</Link></li>
                    <li><Link to="/powerpoint-to-pdf">POWERPOINT to PDF</Link></li>
                    <li><Link to="/excel-to-pdf">EXCEL to PDF</Link></li>
                    <li><Link to="/html-to-pdf">HTML to PDF</Link></li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Convert from PDF</h4>
                  <ul>
                    <li><Link to="/pdf-to-jpg" className="dropdown-link">PDF to JPG</Link></li>
                    <li><Link to="/pdf-to-word" className="dropdown-link">PDF to WORD</Link></li>
                    <li><Link to="/pdf-to-powerpoint" className="dropdown-link">PDF to POWERPOINT</Link></li>
                    <li><Link to="/pdf-to-excel" className="dropdown-link">PDF to EXCEL</Link></li>
                  </ul>
                </div>
              </div>
            </li>
            <li className="nav-item">
              <Link to="/pricing" className="nav-link">Pricing</Link>
            </li>
            <li className="nav-item">
              <Link to="/business" className="nav-link">Business</Link>
            </li>
            <li className="nav-item">
              <Link to="/help" className="nav-link">Help</Link>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="account-dropdown">
              <button 
                className="account-button" 
                onClick={toggleAccountDropdown}
              >
                <span className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="account-text">Account</span>
                <span className={`dropdown-arrow ${isAccountDropdownOpen ? 'open' : ''}`}>▼</span>
              </button>
              {isAccountDropdownOpen && (
                <div className="account-dropdown-menu">
                  <div className="dropdown-header">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item">
                    <span className="dropdown-icon">👤</span>
                    Profile
                  </Link>
                  <Link to="/past-pdfs" className="dropdown-item">
                    <span className="dropdown-icon">📄</span>
                    Past PDFs
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header; 