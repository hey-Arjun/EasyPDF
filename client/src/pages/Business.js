import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import './Business.css';

const Business = () => {
  const [activeTab, setActiveTab] = useState('enterprise');

  const features = [
    {
      icon: '👥',
      title: 'Team Collaboration',
      description: 'Work together seamlessly with shared workspaces and real-time collaboration tools.'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'Bank-level security with SSO, 2FA, and compliance with SOC 2, GDPR, and HIPAA.'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Track usage, monitor performance, and get insights into your team\'s productivity.'
    },
    {
      icon: '🔗',
      title: 'API Integration',
      description: 'Integrate PDF tools directly into your existing workflows and applications.'
    },
    {
      icon: '🎨',
      title: 'Custom Branding',
      description: 'White-label solutions with your company logo, colors, and domain.'
    },
    {
      icon: '📞',
      title: 'Dedicated Support',
      description: '24/7 priority support with dedicated account managers and technical experts.'
    }
  ];



  return (
    <div className="business-page">
      <main className="business-main">
        <div className="business-container">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <h1>Enterprise PDF Solutions</h1>
              <p>Transform your business workflows with powerful PDF tools designed for teams and organizations.</p>
              <div className="hero-buttons">
                <Link to="/pricing" className="btn-primary">View Pricing</Link>
                <Link to="#contact" className="btn-secondary">Contact Sales</Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-graphic">
                <div className="floating-card card-1">📄</div>
                <div className="floating-card card-2">🔒</div>
                <div className="floating-card card-3">👥</div>
                <div className="floating-card card-4">📊</div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <div className="section-header">
              <h2>Built for Business</h2>
              <p>Everything you need to scale your PDF operations across your organization</p>
            </div>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </section>



          {/* CTA Section */}
          <section className="cta-section" id="contact">
            <div className="cta-content">
              <h2>Ready to Transform Your Business?</h2>
              <p>Get in touch with our sales team to discuss your specific needs and find the perfect solution.</p>
              <div className="cta-buttons">
                <Link to="/signup" className="btn-primary">Start Free Trial</Link>
                <a href="mailto:sales@easypdf.com" className="btn-secondary">Contact Sales</a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Business; 