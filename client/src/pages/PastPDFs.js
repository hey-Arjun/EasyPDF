import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './PastPDFs.css';

const PastPDFs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/jobs`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
        } else {
          console.error('Failed to fetch files');
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  const handleDelete = async (fileId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/jobs/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setJobs(jobs.filter(file => file._id !== fileId));
      } else {
        console.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⏳';
      case 'failed':
        return '❌';
      default:
        return '⏸️';
    }
  };

  const getJobTypeDisplay = (type) => {
    const typeMap = {
      'merge': 'Merge PDF',
      'split': 'Split PDF',
      'remove_pages': 'Remove Pages',
      'extract_pages': 'Extract Pages',
      'organize': 'Organize PDF',
      'scan_to_pdf': 'Scan to PDF',
      'compress': 'Compress PDF',
      'repair': 'Repair PDF',
      'ocr': 'OCR PDF',
      'jpg_to_pdf': 'JPG to PDF',
      'word_to_pdf': 'Word to PDF',
      'powerpoint_to_pdf': 'PowerPoint to PDF',
      'excel_to_pdf': 'Excel to PDF',
      'html_to_pdf': 'HTML to PDF',
      'pdf_to_jpg': 'PDF to JPG',
      'pdf_to_word': 'PDF to Word',
      'pdf_to_powerpoint': 'PDF to PowerPoint',
      'pdf_to_excel': 'PDF to Excel',
      'pdf_to_pdfa': 'PDF to PDF/A'
    };
    return typeMap[type] || type.replace('_', ' ').toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadFile = async (downloadUrl, fileName) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const headers = {};
      
      // Add Authorization header only if token exists (for regular login users)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Make authenticated request to get the file
      const response = await fetch(downloadUrl, {
        method: 'GET',
        credentials: 'include', // Include cookies for session-based auth (Google users)
        headers
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get the file blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="past-pdfs-page">
        <main className="past-pdfs-main">
          <div className="past-pdfs-container">
            <div className="auth-required">
              <div className="auth-icon">🔒</div>
              <h2>Authentication Required</h2>
              <p>You need to be logged in to view your PDF processing history.</p>
              <div className="auth-actions">
                <a href="/login" className="login-button">Login</a>
                <a href="/signup" className="signup-button">Sign Up</a>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="past-pdfs-page">
      <main className="past-pdfs-main">
        <div className="past-pdfs-container">
          <div className="past-pdfs-header">
            <div className="header-content">
              <div>
                <h1>Past PDFs</h1>
                <p>View your PDF processing history and download previous files</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your PDF history...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchPastPDFs} className="retry-button">
                Try Again
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No PDFs processed yet</h3>
              <p>Start using our PDF tools to see your processing history here</p>
              <a href="/" className="start-button">
                Start Processing PDFs
              </a>
            </div>
          ) : (
            <div className="jobs-list">
              {jobs.map((job) => (
                <div key={job._id} className="job-card">
                  <div className="job-header">
                    <div className="job-type">
                      <span className="job-icon">📄</span>
                      <span className="job-title">{getJobTypeDisplay(job.type)}</span>
                    </div>
                    <div className={`job-status ${getStatusColor(job.status)}`}>
                      <span className="status-icon">{getStatusIcon(job.status)}</span>
                      <span className="status-text">{job.status}</span>
                    </div>
                  </div>

                  <div className="job-details">
                    <div className="detail-item">
                      <label>File:</label>
                      <span>{job.fileName || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Created:</label>
                      <span>{formatDate(job.createdAt)}</span>
                    </div>
                    {job.completedAt && (
                      <div className="detail-item">
                        <label>Completed:</label>
                        <span>{formatDate(job.completedAt)}</span>
                      </div>
                    )}
                    {job.jobId && (
                      <div className="detail-item">
                        <label>Job ID:</label>
                        <span className="job-id">{job.jobId}</span>
                      </div>
                    )}
                  </div>

                  {job.status === 'completed' && job.fileName && (
                    <div className="job-actions">
                      <button
                        onClick={() => downloadFile(`${process.env.REACT_APP_API_URL}/api/organize/download/${job.fileName}`, job.fileName)}
                        className="download-button"
                      >
                        📥 Download File
                      </button>
                    </div>
                  )}

                  {job.error && (
                    <div className="job-error">
                      <span className="error-icon">⚠️</span>
                      <span className="error-message">{job.error}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PastPDFs; 