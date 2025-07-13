import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsAccountDropdownOpen(false);
  };

  // Mobile hamburger open/close
  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo (always extreme left, first element) */}
        <div className="logo">
          <Link to="/">
            <span className="logo-text">EasyPDF</span>
          </Link>
        </div>

        {/* Hamburger (mobile only, left) */}
        <button className={`mobile-hamburger${isMobileMenuOpen ? ' hide-when-open' : ''}`} onClick={openMobileMenu} aria-label="Open menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Desktop Navigation */}
        <nav className="nav desktop-nav">
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
                    <li><Link to="/pdf-to-jpg">PDF to JPG</Link></li>
                    <li><Link to="/pdf-to-word">PDF to WORD</Link></li>
                    <li><Link to="/pdf-to-powerpoint">PDF to POWERPOINT</Link></li>
                    <li><Link to="/pdf-to-excel">PDF to EXCEL</Link></li>
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

        {/* Desktop Header Actions: Account dropdown if logged in, else Sign up */}
        <div className="header-actions desktop-actions">
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
            <Link to="/signup" className="btn btn-primary">Sign up</Link>
          )}
        </div>
      </div>

      {/* Mobile Side Drawer (unchanged) */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-backdrop" onClick={closeMobileMenu}>
          <nav className="mobile-drawer" onClick={e => e.stopPropagation()}>
            <button className="mobile-drawer-close" onClick={closeMobileMenu}>&times;</button>
            <div className="mobile-drawer-section">
              <div className="mobile-drawer-title">Organize PDF</div>
              <Link to="/merge-pdf" onClick={closeMobileMenu}>Merge PDF</Link>
              <Link to="/split-pdf" onClick={closeMobileMenu}>Split PDF</Link>
              <Link to="/remove-pages" onClick={closeMobileMenu}>Remove pages</Link>
              <Link to="/extract-pages" onClick={closeMobileMenu}>Extract pages</Link>
              <Link to="/organize-pdf" onClick={closeMobileMenu}>Organize PDF</Link>
              <Link to="/scan-to-pdf" onClick={closeMobileMenu}>Scan to PDF</Link>
            </div>
            <div className="mobile-drawer-section">
              <div className="mobile-drawer-title">Optimize PDF</div>
              <Link to="/compress-pdf" onClick={closeMobileMenu}>Compress PDF</Link>
              <Link to="/repair-pdf" onClick={closeMobileMenu}>Repair PDF</Link>
              <Link to="/ocr-pdf" onClick={closeMobileMenu}>OCR PDF</Link>
            </div>
            <div className="mobile-drawer-section">
              <div className="mobile-drawer-title">Convert To PDF</div>
              <Link to="/jpg-to-pdf" onClick={closeMobileMenu}>JPG to PDF</Link>
              <Link to="/word-to-pdf" onClick={closeMobileMenu}>Word to PDF</Link>
              <Link to="/powerpoint-to-pdf" onClick={closeMobileMenu}>PowerPoint to PDF</Link>
              <Link to="/excel-to-pdf" onClick={closeMobileMenu}>Excel to PDF</Link>
              <Link to="/html-to-pdf" onClick={closeMobileMenu}>HTML to PDF</Link>
            </div>
            <div className="mobile-drawer-section">
              <div className="mobile-drawer-title">Convert From PDF</div>
              <Link to="/pdf-to-jpg" onClick={closeMobileMenu}>PDF to JPG</Link>
              <Link to="/pdf-to-word" onClick={closeMobileMenu}>PDF to Word</Link>
              <Link to="/pdf-to-powerpoint" onClick={closeMobileMenu}>PDF to PowerPoint</Link>
              <Link to="/pdf-to-excel" onClick={closeMobileMenu}>PDF to Excel</Link>
            </div>
            <div className="mobile-drawer-divider"></div>
            <div className="mobile-drawer-section">
              <Link to="/pricing" onClick={closeMobileMenu}>Pricing</Link>
              <Link to="/business" onClick={closeMobileMenu}>Business</Link>
              <Link to="/help" onClick={closeMobileMenu}>Help</Link>
            </div>
            <div className="mobile-drawer-divider"></div>
            <div className="mobile-drawer-section">
              {!user && (
                <Link to="/signup" className="mobile-drawer-signup" onClick={closeMobileMenu}>Sign up</Link>
              )}
              {user && (
                <>
                  <Link to="/profile" onClick={closeMobileMenu}>Profile</Link>
                  <Link to="/past-pdfs" onClick={closeMobileMenu}>Past PDFs</Link>
                  <button onClick={() => { logout(); closeMobileMenu(); }} className="mobile-drawer-logout">Logout</button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header; 