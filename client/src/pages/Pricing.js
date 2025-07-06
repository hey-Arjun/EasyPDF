import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import './Pricing.css';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Free for All',
      price: { monthly: 0, yearly: 0 },
      features: [
        'Unlimited PDF conversions',
        'Advanced compression',
        'File size limit: 100MB',
        'Priority support',
        'Full OCR capabilities',
        'No watermarks',
        'Batch processing',
        'Advanced editing tools',
        'All premium features included'
      ],
      popular: true,
      cta: 'Get Started Free',
      link: '/signup'
    }
  ];

  const getPrice = (plan) => {
    const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
    if (price === 0) return 'Free';
    return `$${price}`;
  };

  const getPeriod = () => {
    return billingCycle === 'monthly' ? '/month' : '/year';
  };

  const getSavings = (plan) => {
    if (plan.price.monthly === 0) return null;
    const monthlyTotal = plan.price.monthly * 12;
    const yearlyPrice = plan.price.yearly;
    const savings = monthlyTotal - yearlyPrice;
    return savings > 0 ? `Save $${savings}/year` : null;
  };

  return (
    <div className="pricing-page">
      <main className="pricing-main">
        <div className="pricing-container">
          <div className="pricing-header">
            <h1>Free for Everyone!</h1>
            <p>All our PDF tools are completely free to use. Pricing plans coming soon after updates.</p>
            
            <div className="coming-soon-badge">
              <span>🚀 Pricing plans coming soon after updates!</span>
            </div>
          </div>

          <div className="pricing-grid">
            {plans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="price">
                    <span className="amount">{getPrice(plan)}</span>
                    {plan.price.monthly > 0 && <span className="period">{getPeriod()}</span>}
                  </div>
                  {getSavings(plan) && (
                    <div className="savings">{getSavings(plan)}</div>
                  )}
                </div>

                <ul className="features-list">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="feature-item">
                      <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to={plan.link} className={`plan-button ${plan.popular ? 'primary' : 'secondary'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="pricing-faq">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h4>Is EasyPDF really free?</h4>
                <p>Yes! All our PDF tools are completely free to use with no hidden costs or limitations.</p>
              </div>
              <div className="faq-item">
                <h4>When will pricing plans be available?</h4>
                <p>We're working on premium features and pricing plans. They'll be available after our next major update.</p>
              </div>
              <div className="faq-item">
                <h4>Will I lose access when pricing is introduced?</h4>
                <p>No, existing users will continue to have access to all current features. New premium features will be optional.</p>
              </div>
              <div className="faq-item">
                <h4>How can I stay updated?</h4>
                <p>Follow us on social media or sign up for our newsletter to get notified when new features and pricing plans are available.</p>
              </div>
            </div>
          </div>

          <div className="pricing-cta">
            <h2>Ready to get started?</h2>
            <p>Join thousands of users who trust EasyPDF for their document needs.</p>
            <Link to="/signup" className="cta-button">Get Started Free</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing; 