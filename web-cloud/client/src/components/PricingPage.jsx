import { useState, useEffect } from 'react';
import dropin from 'braintree-web-drop-in';

// Get API URL from environment or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Pricing() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
  const [discountType, setDiscountType] = useState(null);
  const [dropinInstance, setDropinInstance] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const plans = {
    gold: "1001",
    premium: "1002"
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleUpgradeClick = (planName) => {
    setSelectedPlan(plans[planName]);
    setShowPaymentModal(true);
  };

  const handleLearnMoreClick = (planDetails) => {
    setSelectedPlanDetails(planDetails);
    setShowDetailsModal(true);
  };

  const handleDiscountClick = (type) => {
    setDiscountType(type);
    setShowDiscountModal(true);
  };

  const handleGiftClick = () => {
    setShowGiftModal(true);
  };

  useEffect(() => {
    if (showPaymentModal) {
      fetch(`${API_BASE_URL}/client_token`)
        .then(res => res.json())
        .then(data => {
          if (data.clientToken) {
            dropin.create({
              authorization: data.clientToken,
              container: '#dropin-container',
              card: {
                cardholderName: { required: true },
                cardNumber: { maskInput: true },
                cvv: { maskInput: true },
                expirationDate: { maskInput: true },
                pin: { maskInput: true }
              }
            }, (err, instance) => {
              if (err) {
                setMessage({ text: 'Error loading payment form.', type: 'error' });
                console.error(err);
                return;
              }
              setDropinInstance(instance);
              setMessage({ text: 'Payment form is ready.', type: 'info' });
            });
          } else {
            setMessage({ text: 'Failed to load payment form.', type: 'error' });
          }
        })
        .catch(error => {
          setMessage({ text: 'Network error.', type: 'error' });
          console.error('Error fetching client token:', error);
        });
    }
  }, [showPaymentModal]);

  const handlePaymentSubmit = () => {
    if (!dropinInstance) {
      setMessage({ text: 'Payment form is not ready.', type: 'error' });
      return;
    }
    setMessage({ text: 'Processing payment...', type: 'info' });

    dropinInstance.requestPaymentMethod((err, payload) => {
      if (err) {
        setMessage({ text: 'Payment failed. Please try again.', type: 'error' });
        console.error(err);
        return;
      }

      fetch(`${API_BASE_URL}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodNonce: payload.nonce,
          planId: selectedPlan
        }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage({ text: 'Subscription successful! 🎉', type: 'success' });
          setTimeout(() => {
            setShowPaymentModal(false);
            setMessage({ text: '', type: '' });
          }, 3000);
        } else {
          setMessage({ text: `Subscription failed: ${data.message}`, type: 'error' });
          console.error(data.message);
        }
      })
      .catch(error => {
        setMessage({ text: 'A network error occurred. Please try again.', type: 'error' });
        console.error('Network error:', error);
      });
    });
  };

  const subscriptionTiers = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "Basic features",
        "Limited storage",
        "Email support",
        "Community access"
      ],
      buttonText: "Get Started",
      popular: false,
      tier: "free",
      details: {
        title: "Free Plan Details",
        description: "The Free plan is designed for individuals and small teams who are just starting out. It provides essential features to get you up and running without any cost. It's a great way to experience the core functionalities of our platform.",
        keyFeatures: [
          "Access to basic project management tools",
          "Up to 1 GB of cloud storage",
          "Email support during business hours",
          "Access to our community forums for peer support and tips"
        ]
      }
    },
    {
      name: "Gold",
      price: "$19",
      period: "/month",
      description: "Most popular choice",
      features: [
        "All Free features",
        "Unlimited storage",
        "Priority support",
        "Advanced analytics",
        "Custom integrations"
      ],
      buttonText: "Upgrade Now",
      popular: true,
      tier: "gold",
      details: {
        title: "Gold Plan Details",
        description: "The Gold plan is our most popular choice, offering a significant upgrade for growing businesses and professionals. It includes everything in the Free plan plus enhanced features and dedicated support to help you scale your operations efficiently.",
        keyFeatures: [
          "All features from the Free plan",
          "Unlimited cloud storage for all your files and projects",
          "24/7 priority support via email and chat",
          "Comprehensive analytics and reporting tools",
          "Ability to integrate with third-party applications"
        ]
      }
    },
    {
      name: "Premium",
      price: "$49",
      period: "/month",
      description: "For power users",
      features: [
        "All Gold features",
        "White-label solution",
        "24/7 phone support",
        "Custom development",
        "Dedicated account manager"
      ],
      buttonText: "Go Premium",
      popular: false,
      tier: "premium",
      details: {
        title: "Premium Plan Details",
        description: "The Premium plan is the ultimate solution for large enterprises and power users who require a fully customized and highly supported environment. This plan provides all the advanced tools and a dedicated team to ensure your success.",
        keyFeatures: [
          "All features from the Gold plan",
          "White-labeling to brand the platform as your own",
          "24/7 phone support for immediate assistance",
          "Access to custom development for specific needs",
          "A dedicated account manager to assist with strategy and implementation"
        ]
      }
    }
  ];

  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards, including Visa, MasterCard, American Express, and Discover. All payments are securely processed through Braintree."
    },
    {
      question: "Can I change my plan later?",
      answer: "Yes, you can upgrade or downgrade your subscription at any time. Changes will be effective on your next billing cycle."
    },
    {
      question: "What is your refund policy?",
      answer: "We offer a 30-day money-back guarantee for all new subscriptions. If you are not satisfied, you can request a full refund within the first 30 days."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption and security protocols to protect your data. Our payment processing is handled by Braintree, a trusted and secure payment gateway."
    },
    {
      question: "Do you offer discounts for non-profits?",
      answer: "Yes, we have special pricing for non-profit organizations and educational institutions. Please contact our support team for more details."
    }
  ];

  return (
    <div className="landing-container max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Complete Your Subscription</h3>
              <div id="dropin-container"></div>
              {message.text && (
                <div className={`p-2 my-2 rounded text-sm text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {message.text}
                </div>
              )}
              <div className="items-center px-4 py-3">
                <button
                  id="payment-submit-button"
                  onClick={handlePaymentSubmit}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Pay Now
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Details Modal */}
      {showDetailsModal && selectedPlanDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3 text-left">
              <h3 className="text-3xl leading-8 font-extrabold text-gray-900 mb-4">{selectedPlanDetails.title}</h3>
              <p className="text-gray-600 mb-6">{selectedPlanDetails.description}</p>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Key Features:</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {selectedPlanDetails.keyFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <div className="items-center px-4 py-3 text-right">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="mt-4 px-6 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white text-center">
            <h3 className="text-2xl leading-6 font-medium text-gray-900 mb-4">
              {discountType === 'student' ? 'Student Discount' : 'Professional Discount'}
            </h3>
            <p className="text-gray-600 mb-4">
              {discountType === 'student'
                ? "We offer a special discount for students. To apply, please contact our support team with a valid student ID."
                : "Professional organizations can qualify for special pricing. Contact our sales team to discuss your specific needs."}
            </p>
            <div className="mt-4">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow-sm hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Modal */}
      {/* {showGiftModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white text-center">
            <h3 className="text-2xl leading-6 font-medium text-gray-900 mb-4">Gift a Subscription</h3>
            <p className="text-gray-600 mb-4">
              To gift a subscription, please enter the recipient's email address and select the desired plan. We will send them an email with instructions on how to redeem their gift.
            </p>
            <div className="mt-4">
              <input
                type="email"
                placeholder="Recipient's Email"
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
              />
              <select className="w-full p-2 border border-gray-300 rounded-md mb-4">
                <option>Select a Plan</option>
                <option value="gold">Gold</option>
                <option value="premium">Premium</option>
              </select>
              <button
                onClick={() => alert("Gift sent sucessfully!")}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-700"
              >
                Send Gift
              </button>
              <button
                onClick={() => setShowGiftModal(false)}
                className="mt-2 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Pricing Section */}
      <section className="hero-section text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="hero-subtitle text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Select the perfect subscription tier for your needs
        </p>
        <div className="subscription-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          {subscriptionTiers.map((tier, index) => (
            <div
              key={index}
              className={`subscription-card bg-white rounded-3xl border ${tier.popular ? 'border-4 border-yellow-500 scale-105' : 'border-gray-200'} shadow-2xl overflow-hidden relative transform transition-all duration-300 hover:scale-105 hover:shadow-3xl`}
            >
              {tier.popular && (
                <div className="popular-badge bg-gradient-to-r from-yellow-400 to-amber-500 text-white py-2 px-6 text-sm font-bold uppercase tracking-wider relative -top-px -left-px">
                  Most Popular
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-yellow-500"></div>
                </div>
              )}
              <div className={`tier-header p-8 sm:p-10 ${tier.tier === 'free' ? 'bg-gradient-to-br from-gray-50 to-white' : tier.tier === 'gold' ? 'bg-gradient-to-br from-yellow-50 to-white' : 'bg-gradient-to-br from-purple-50 to-white'}`}>
                <h3 className={`tier-name text-3xl font-bold mb-4 ${tier.tier === 'free' ? 'text-gray-700' : tier.tier === 'gold' ? 'text-yellow-600' : 'text-purple-600'}`}>{tier.name}</h3>
                <div className="tier-price flex justify-center items-center mb-4">
                  <span className="price text-6xl sm:text-7xl font-extrabold text-gray-900">{tier.price}</span>
                  <span className="period text-lg text-gray-500 ml-2 font-medium">{tier.period}</span>
                </div>
                <p className="tier-description text-gray-600 text-lg">{tier.description}</p>
              </div>
              <div className="tier-features p-8">
                <ul className="list-none space-y-4">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-800 text-base font-medium">
                      <span className="checkmark text-green-500 bg-green-50 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="tier-footer p-8 pt-0">
                <button
                  onClick={() => handleUpgradeClick(tier.tier)}
                  className={`tier-btn w-full py-4 px-6 mb-4 rounded-xl text-lg font-semibold text-white ${tier.tier === 'free' ? 'bg-gray-700 hover:bg-gray-800' : tier.tier === 'gold' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-md hover:shadow-lg' : 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-md hover:shadow-lg'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300 transform hover:-translate-y-1`}
                >
                  {tier.buttonText}
                </button>
                <button onClick={() => handleLearnMoreClick(tier.details)} className="read-more text-blue-600 text-base font-semibold hover:text-blue-800 transition-colors duration-200">Learn More</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Other Sections */}
      <section className="discounts-section text-center mb-16 p-10 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Check for Discounts!
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
          We offer special pricing for students, non-profits, and educational institutions. Contact our sales team to see if you qualify.
        </p>
        <div className="discount-buttons flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => handleDiscountClick('student')} className="discount-btn student py-3 px-6 rounded-md text-gray-900 font-semibold border-2 border-gray-900 bg-white hover:bg-gray-900 hover:text-white transition-colors duration-300">
            Student Discount
          </button>
          <button onClick={() => handleDiscountClick('professional')} className="discount-btn professional py-3 px-6 rounded-md text-gray-900 font-semibold border-2 border-gray-900 bg-white hover:bg-gray-900 hover:text-white transition-colors duration-300">
            Professional Discount
          </button>
        </div>
      </section>

      <section className="faq-section mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">FAQs</h2>
        <div className="faq-list space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item rounded-lg border border-gray-200 overflow-hidden">
              <button
                className="faq-question w-full flex justify-between items-center py-5 px-6 bg-white text-lg font-medium text-gray-800 hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleFaq(index)}
              >
                {faq.question}
                <span className={`faq-icon text-2xl transform transition-transform duration-300 ${expandedFaq === index ? 'rotate-45' : 'rotate-0'}`}>+</span>
              </button>
              {expandedFaq === index && (
                <div className="faq-answer p-6 text-gray-600 bg-gray-50 border-t border-gray-200">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* <section className="gift-section text-center mb-16 p-10 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Gift a Subscription
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
          Share the gift of productivity with a loved one, friend, or colleague. A subscription is the perfect gift for anyone looking to unlock their full potential.
        </p>
        <button onClick={handleGiftClick} className="get-now-btn py-3 px-8 rounded-md text-white font-semibold text-lg bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors duration-300">
          Get Now
        </button>
      </section> */}
    </div>
  );
}

export default Pricing;
