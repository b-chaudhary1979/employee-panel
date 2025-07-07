import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import PricingComponent from "../components/pricing";
import NeuralNetwork from "../components/bg-animation"

export default function Home() {
  const router = useRouter();
  const [demoForm, setDemoForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeSection, setActiveSection] = useState('home');

  // Section refs
  const homeRef = React.useRef(null);
  const aboutRef = React.useRef(null);
  const pricingRef = React.useRef(null);
  const contactRef = React.useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const sectionOffsets = [
        { id: 'home', ref: homeRef },
        { id: 'about', ref: aboutRef },
        { id: 'pricing', ref: pricingRef },
        { id: 'contact', ref: contactRef },
      ].map(section => ({
        id: section.id,
        top: section.ref.current ? section.ref.current.getBoundingClientRect().top : Infinity,
      }));

      // Find the section closest to the top (but not above)
      const active = sectionOffsets.reduce((closest, section) => {
        if (section.top < window.innerHeight / 2 && section.top > -window.innerHeight / 2) {
          if (!closest || section.top > closest.top) {
            return section;
          }
        }
        return closest;
      }, null);

      setActiveSection(active ? active.id : 'home');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setNotification({
      show: true,
      message: "Demo request submitted successfully! We'll contact you soon.",
      type: "success"
    });
    
    setDemoForm({ name: "", email: "", company: "", phone: "", message: "" });
    setIsLoading(false);
    
    // Hide notification after 5 seconds
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 5000);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setNotification({
      show: true,
      message: "Message sent successfully! We'll get back to you soon.",
      type: "success"
    });
    
    setContactForm({ name: "", email: "", subject: "", message: "" });
    setIsLoading(false);
    
    // Hide notification after 5 seconds
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 5000);
  };

  const handlePlanSelect = (planName) => {
    setSelectedPlan(planName);
    setNotification({
      show: true,
      message: `${planName} plan selected! Redirecting to signup...`,
      type: "success"
    });
    
    // Redirect to signup after a short delay
    setTimeout(() => {
      router.push('/auth/signup');
    }, 2000);
  };

  return (
    <div className="bg-[#fbf9f4] min-h-screen relative">
      {/* Custom Notification */}
      {notification.show && (
        <div className={`fixed top-20 right-4 z-[9999] transform transition-all duration-500 ease-in-out ${
          notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`px-6 py-4 rounded-lg shadow-lg border-l-4 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">{notification.message}</span>
              <button 
                onClick={() => setNotification({ show: false, message: "", type: "" })}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-purple-50/95 backdrop-blur-md sticky top-0 z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center group cursor-pointer hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <Image 
                  src="/logo cyber clipper.png" 
                  alt="Cyber Clipper Logo" 
                  width={48} 
                  height={48} 
                  className="object-contain drop-shadow-sm"
                />
                <div className="absolute inset-0 bg-[#a259f7] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>
              <span className="ml-4 font-bold text-2xl text-gray-900 bg-gradient-to-r from-gray-900 to-[#a259f7] bg-clip-text text-transparent">Cyber Clipper</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              <a
                href="#home"
                onClick={e => {
                  e.preventDefault();
                  homeRef.current.scrollIntoView({ behavior: 'smooth' });
                  setActiveSection('home');
                }}
                className={`px-4 py-2 transition-all duration-300 font-medium relative group rounded-lg hover:bg-[#a259f7]/5 ${activeSection === 'home' ? 'text-[#a259f7] font-bold !text-[#a259f7]' : 'text-gray-700 hover:text-[#a259f7]'}`}
              >
                Home
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#a259f7] group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </a>
              <a
                href="#about"
                onClick={e => {
                  e.preventDefault();
                  aboutRef.current.scrollIntoView({ behavior: 'smooth' });
                  setActiveSection('about');
                }}
                className={`px-4 py-2 transition-all duration-300 font-medium relative group rounded-lg hover:bg-[#a259f7]/5 ${activeSection === 'about' ? 'text-[#a259f7] font-bold !text-[#a259f7]' : 'text-gray-700 hover:text-[#a259f7]'}`}
              >
                About Us
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#a259f7] group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </a>
              <a
                href="#pricing"
                onClick={e => {
                  e.preventDefault();
                  pricingRef.current.scrollIntoView({ behavior: 'smooth' });
                  setActiveSection('pricing');
                }}
                className={`px-4 py-2 transition-all duration-300 font-medium relative group rounded-lg hover:bg-[#a259f7]/5 ${activeSection === 'pricing' ? 'text-[#a259f7] font-bold !text-[#a259f7]' : 'text-gray-700 hover:text-[#a259f7]'}`}
              >
                Pricing
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#a259f7] group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </a>
              <a
                href="#contact"
                onClick={e => {
                  e.preventDefault();
                  contactRef.current.scrollIntoView({ behavior: 'smooth' });
                  setActiveSection('contact');
                }}
                className={`px-4 py-2 transition-all duration-300 font-medium relative group rounded-lg hover:bg-[#a259f7]/5 ${activeSection === 'contact' ? 'text-[#a259f7] font-bold !text-[#a259f7]' : 'text-gray-700 hover:text-[#a259f7]'}`}
              >
                Contact Us
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#a259f7] group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex space-x-3">
              <button 
                onClick={() => document.getElementById('demo-form').scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-[#a259f7] to-[#8b4fd8] text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#a259f7]/25 transition-all duration-300 transform hover:scale-105 shadow-md hover:from-[#8b4fd8] hover:to-[#7a3fc7]"
              >
                Request Demo
              </button>
              <button 
                onClick={() => router.push('/auth/login')}
                className="border-2 border-[#a259f7] text-[#a259f7] px-6 py-2.5 rounded-xl font-semibold hover:bg-[#a259f7] hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#a259f7]/25"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" ref={homeRef} className="py-20 px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slide-in-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Secure Your Digital
                <span className="text-[#a259f7] block">Future Today</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Advanced cybersecurity solutions that protect your business from evolving threats. 
                Our comprehensive platform ensures your data stays safe and your operations remain uninterrupted.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => router.push('/auth/login')}
                  className="bg-[#a259f7] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#8b4fd8] transition-colors shadow-lg"
                >
                  Get Started
                </button>
                <button 
                  onClick={() => document.getElementById('demo-form').scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-[#a259f7] text-[#a259f7] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#a259f7] hover:text-white transition-colors"
                >
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative animate-slide-in-right">
              <div className="bg-gradient-to-br from-[#a259f7] to-[#8b4fd8] rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-16 h-8 bg-[#a259f7] rounded"></div>
                      <div className="w-16 h-8 bg-gray-300 rounded"></div>
                      <div className="w-16 h-8 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to secure your digital infrastructure and protect your valuable data
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#fbf9f4] p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="w-12 h-12 bg-[#a259f7] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Security</h3>
              <p className="text-gray-600">
                Multi-layered security protocols with real-time threat detection and automated response systems.
              </p>
            </div>

            <div className="bg-[#fbf9f4] p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="w-12 h-12 bg-[#a259f7] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600">
                Optimized performance that doesn't compromise security. Experience seamless operations with minimal latency.
              </p>
            </div>

            <div className="bg-[#fbf9f4] p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="w-12 h-12 bg-[#a259f7] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
              <p className="text-gray-600">
                Comprehensive insights and reporting tools to monitor your security posture and track performance metrics.
              </p>
            </div>
          </div>
        </div>
      </section>


{/* Request Demo Form */}
<section id="demo-form" className="py-5 bg-white">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Request a Demo</h2>
            <p className="text-xl text-gray-600">
              See how Cyber Clipper can transform your security posture. Schedule a personalized demo today.
            </p>
          </div>

          <form onSubmit={handleDemoSubmit} className="bg-gradient-to-br from-white to-[#fbf9f4] p-8 rounded-2xl shadow-xl border-2 border-[#a259f7] hover:shadow-2xl transition-all duration-300">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                                  <input
                    type="text"
                    required
                    value={demoForm.name}
                    onChange={(e) => setDemoForm({...demoForm, name: e.target.value})}
                    className="w-full px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent transition-all duration-300 hover:border-[#a259f7] bg-white"
                    placeholder="Enter your full name"
                  />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email Address *</label>
                                  <input
                    type="email"
                    required
                    value={demoForm.email}
                    onChange={(e) => setDemoForm({...demoForm, email: e.target.value})}
                    className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent transition-all duration-300 hover:border-[#a259f7] bg-white"
                    placeholder="Enter your email"
                  />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Company Name</label>
                                  <input
                    type="text"
                    value={demoForm.company}
                    onChange={(e) => setDemoForm({...demoForm, company: e.target.value})}
                    className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent transition-all duration-300 hover:border-[#a259f7] bg-white"
                    placeholder="Enter your company name"
                  />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                                  <input
                    type="tel"
                    value={demoForm.phone}
                    onChange={(e) => setDemoForm({...demoForm, phone: e.target.value})}
                    className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent transition-all duration-300 hover:border-[#a259f7] bg-white"
                    placeholder="Enter your phone number"
                  />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Additional Requirements</label>
                              <textarea
                  value={demoForm.message}
                  onChange={(e) => setDemoForm({...demoForm, message: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent transition-all duration-300 hover:border-[#a259f7] bg-white resize-none"
                  placeholder="Tell us about your security needs..."
                />
            </div>
            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#a259f7] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#8b4fd8] transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Schedule Demo</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </section> 

      {/* About Us Section */}
      <section id="about" ref={aboutRef} className="py-20 bg-[#fbf9f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Cyber Clipper</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're a team of cybersecurity experts dedicated to protecting businesses in the digital age
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  To provide cutting-edge cybersecurity solutions that empower businesses to operate securely in an increasingly complex digital landscape. We believe that security should be accessible, effective, and seamless.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#a259f7] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Trust & Reliability</h4>
                    <p className="text-sm text-gray-600">Built on years of industry expertise</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  To create a world where businesses can focus on growth and innovation without worrying about cybersecurity threats. We envision a future where security is proactive, intelligent, and invisible.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#a259f7] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Innovation First</h4>
                    <p className="text-sm text-gray-600">Leading-edge technology solutions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-[#a259f7] to-[#8b4fd8] p-8 rounded-2xl text-white">
                <h3 className="text-2xl font-bold mb-6">Our Story</h3>
                <p className="text-lg leading-relaxed mb-6">
                  Founded by cybersecurity veterans who witnessed the growing complexity of digital threats, Cyber Clipper was born from a simple belief: security should protect, not hinder.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">500+</div>
                    <div className="text-sm opacity-90">Happy Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">99.9%</div>
                    <div className="text-sm opacity-90">Success Rate</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#a259f7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Excellence</h4>
                      <p className="text-sm text-gray-600">We strive for perfection in everything we do</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#a259f7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Innovation</h4>
                      <p className="text-sm text-gray-600">Constantly evolving with the latest technologies</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#a259f7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Integrity</h4>
                      <p className="text-sm text-gray-600">Honest, transparent, and trustworthy partnerships</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-[#fbf9f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Cyber Clipper?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another security solution. We're your trusted partner in digital protection.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#a259f7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Team</h3>
                  <p className="text-gray-600">
                    Our cybersecurity experts have decades of combined experience in protecting businesses of all sizes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#a259f7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
                  <p className="text-gray-600">
                    Round-the-clock monitoring and support to ensure your systems are always protected.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#a259f7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven Track Record</h3>
                  <p className="text-gray-600">
                    Trusted by thousands of businesses worldwide with a 99.9% security success rate.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Security Score</span>
                  <span className="text-2xl font-bold text-[#a259f7]">98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-[#a259f7] h-3 rounded-full" style={{ width: '98%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="text-2xl font-bold text-[#a259f7]">&lt;30s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-[#a259f7] h-3 rounded-full" style={{ width: '95%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="text-2xl font-bold text-[#a259f7]">99.9%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-[#a259f7] h-3 rounded-full" style={{ width: '99.9%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         
          
          <PricingComponent 
            onPlanSelect={handlePlanSelect}
            selectedPlan={selectedPlan}
          />
        </div>
      </section>

      {/* Contact Us Form */}
      <section id="contact" ref={contactRef} className="py-20 bg-[#fbf9f4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="bg-gradient-to-br from-white to-[#fbf9f4] p-8 rounded-2xl shadow-xl border-2 border-[#a259f7] hover:shadow-2xl transition-all duration-300">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Name *</label>
                                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent transition-all duration-300 hover:border-[#a259f7] bg-white"
                    placeholder="Enter your name"
                  />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email *</label>
                                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent transition-all duration-300 hover:border-[#a259f7] bg-white"
                    placeholder="Enter your email"
                  />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Subject *</label>
                              <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent transition-all duration-300 hover:border-[#a259f7] bg-white"
                  placeholder="Enter subject"
                />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Message *</label>
                              <textarea
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent transition-all duration-300 hover:border-[#a259f7] bg-white resize-none"
                  placeholder="Enter your message..."
                />
            </div>
            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#a259f7] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#8b4fd8] transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Message</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-[#a259f7]/5 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-6 group">
                <div className="relative">
                  <Image 
                    src="/logo cyber clipper.png" 
                    alt="Cyber Clipper Logo" 
                    width={48} 
                    height={48} 
                    className="object-contain drop-shadow-sm"
                  />
                  <div className="absolute inset-0 bg-[#a259f7] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                <span className="ml-4 font-bold text-2xl bg-gradient-to-r from-white to-[#a259f7] bg-clip-text text-transparent">Cyber Clipper</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                Protecting businesses worldwide with advanced cybersecurity solutions. 
                Your security is our priority.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#a259f7] transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-[#a259f7]/10">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#a259f7] transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-[#a259f7]/10">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#a259f7] transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-[#a259f7]/10">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#home" className="text-gray-300 hover:text-[#a259f7] transition-all duration-300 hover:translate-x-1 inline-block">Home</a></li>
                <li><a href="#about" className="text-gray-300 hover:text-[#a259f7] transition-all duration-300 hover:translate-x-1 inline-block">About Us</a></li>
                <li><a href="#pricing" className="text-gray-300 hover:text-[#a259f7] transition-all duration-300 hover:translate-x-1 inline-block">Pricing</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-[#a259f7] transition-all duration-300 hover:translate-x-1 inline-block">Contact</a></li>
                <li><a href="#demo-form" className="text-gray-300 hover:text-[#a259f7] transition-all duration-300 hover:translate-x-1 inline-block">Request Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Contact Info</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center space-x-2 hover:text-[#a259f7] transition-colors duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>contact@cyberclipper.com</span>
                </li>
                <li className="flex items-center space-x-2 hover:text-[#a259f7] transition-colors duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-2 hover:text-[#a259f7] transition-colors duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>123 Security St, Cyber City</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 Cyber Clipper. All rights reserved.</p>
            <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-[#a259f7] transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-[#a259f7] transition-colors duration-300">Terms of Service</a>
              <a href="#" className="hover:text-[#a259f7] transition-colors duration-300">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
