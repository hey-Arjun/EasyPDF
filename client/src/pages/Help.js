import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import './Help.css';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');

  const categories = [
    { id: 'general', name: 'General', icon: '📋' },
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'tools', name: 'PDF Tools', icon: '🛠️' },
    { id: 'technical', name: 'Technical', icon: '⚙️' }
  ];

  const faqs = {
    general: [
      {
        question: 'What is EasyPDF?',
        answer: 'EasyPDF is a comprehensive online platform that provides various PDF tools for converting, editing, compressing, and managing PDF documents. Our tools are designed to be user-friendly and accessible from any device with an internet connection.'
      },
      {
        question: 'Is EasyPDF free to use?',
        answer: 'Yes, EasyPDF offers a free tier with basic features. You can convert up to 5 PDFs per month, use basic compression, and access standard support. For unlimited usage and advanced features, we offer Pro and Business plans.'
      },
      {
        question: 'What file formats are supported?',
        answer: 'We support a wide range of formats including PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG, HTML, and more. You can convert between these formats and perform various operations on PDF files.'
      },
      {
        question: 'How secure is my data?',
        answer: 'We take security seriously. All files are encrypted during upload and processing, and automatically deleted from our servers after 24 hours. We comply with GDPR, SOC 2, and other security standards.'
      }
    ],
    account: [
      {
        question: 'How do I create an account?',
        answer: 'You can create an account by clicking the "Sign up" button in the header. You can sign up with your email address or use Google/Facebook for quick registration. No credit card is required for the free tier.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'If you forgot your password, click on the "Forgot password?" link on the login page. Enter your email address and we\'ll send you a password reset link. Make sure to check your spam folder if you don\'t see the email.'
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes, you can delete your account at any time. Go to your Profile settings and click on "Delete Account". Please note that this action is irreversible and will permanently delete all your data and files.'
      },
      {
        question: 'How do I update my profile information?',
        answer: 'You can update your profile information by going to the Profile page. Click on the "Edit Profile" button to modify your name, email, or other account details. Changes are saved automatically.'
      }
    ],
    tools: [
      {
        question: 'How do I compress a PDF?',
        answer: 'To compress a PDF, go to the Compress PDF tool, upload your file, choose your compression settings, and click "Compress PDF". The tool will reduce the file size while maintaining quality.'
      },
      {
        question: 'Can I merge multiple PDFs?',
        answer: 'Yes! Use our Merge PDF tool to combine multiple PDF files into one. Simply upload all the PDFs you want to merge, arrange them in the desired order, and click "Merge PDFs".'
      },
      {
        question: 'How do I convert Word to PDF?',
        answer: 'Use our Word to PDF converter. Upload your Word document (.doc or .docx), and the tool will automatically convert it to PDF format while preserving formatting and layout.'
      },
      {
        question: 'What is OCR and how does it work?',
        answer: 'OCR (Optical Character Recognition) converts scanned documents or images into searchable and editable text. Upload a scanned PDF, and our OCR tool will extract the text, making it searchable and copyable.'
      }
    ],

    technical: [
      {
        question: 'What browsers are supported?',
        answer: 'EasyPDF works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser for the best experience.'
      },
      {
        question: 'What is the maximum file size?',
        answer: 'Free users can upload files up to 10MB, Pro users up to 100MB, and Business users up to 500MB. For larger files, consider compressing them first or upgrading your plan.'
      },
      {
        question: 'How long does processing take?',
        answer: 'Processing time depends on file size and complexity. Small files (under 10MB) typically process in 30-60 seconds. Larger files may take 2-5 minutes. You\'ll receive an email when processing is complete.'
      },
      {
        question: 'Do you have an API?',
        answer: 'Yes, we offer a REST API for Pro and Business users. The API allows you to integrate PDF tools directly into your applications. Contact our support team for API documentation and access.'
      }
    ]
  };

  const filteredFAQs = faqs[activeCategory].filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularArticles = [
    { title: 'How to compress PDF files', category: 'tools', link: '/compress-pdf' },
    { title: 'Converting Word documents to PDF', category: 'tools', link: '/word-to-pdf' },
    { title: 'Merging multiple PDFs', category: 'tools', link: '/merge-pdf' },
    { title: 'Understanding OCR technology', category: 'tools', link: '/ocr-pdf' },
    { title: 'Account security best practices', category: 'account', link: '/profile' },

  ];

  return (
    <div className="help-page">
      <main className="help-main">
        <div className="help-container">
          {/* Hero Section */}
          <section className="help-hero">
            <h1>How can we help you?</h1>
            <p>Find answers to common questions, learn how to use our tools, and get support when you need it.</p>
            
            <div className="search-container">
              <div className="search-box">
                <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section className="categories-section">
            <div className="categories-grid">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className="category-icon">{category.icon}</div>
                  <h3>{category.name}</h3>
                </button>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="faq-section">
            <div className="faq-header">
              <h2>Frequently Asked Questions</h2>
              <p>Find answers to the most common questions about {categories.find(c => c.id === activeCategory)?.name.toLowerCase()}.</p>
            </div>
            
            <div className="faq-list">
              {filteredFAQs.map((faq, index) => (
                <details key={index} className="faq-item">
                  <summary className="faq-question">
                    {faq.question}
                    <svg className="expand-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  </summary>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Popular Articles */}
          <section className="popular-section">
            <h2>Popular Help Articles</h2>
            <div className="popular-grid">
              {popularArticles.map((article, index) => (
                <Link key={index} to={article.link} className="popular-card">
                  <div className="article-category">{article.category}</div>
                  <h3>{article.title}</h3>
                  <svg className="arrow-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </Link>
              ))}
            </div>
          </section>

          {/* Contact Support */}
          <section className="contact-section">
            <div className="contact-content">
              <h2>Still need help?</h2>
              <p>Our support team is here to help you with any questions or issues you might have.</p>
              
              <div className="contact-options">
                <div className="contact-option">
                  <div className="contact-icon">📧</div>
                  <h3>Email Support</h3>
                  <p>Get help via email within 24 hours</p>
                  <a href="mailto:support@easypdf.com" className="contact-link">support@easypdf.com</a>
                </div>
                
                <div className="contact-option">
                  <div className="contact-icon">💬</div>
                  <h3>Live Chat</h3>
                  <p>Chat with our support team in real-time</p>
                  <button className="contact-link">Start Chat</button>
                </div>
                
                <div className="contact-option">
                  <div className="contact-icon">📞</div>
                  <h3>Phone Support</h3>
                  <p>Call us for immediate assistance</p>
                  <a href="tel:+1-800-EASYPDF" className="contact-link">+1 (800) EASYPDF</a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help; 