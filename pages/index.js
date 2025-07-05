import React, { useState } from "react";
import Image from "next/image";

export default function Home() {
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

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    // Handle demo form submission
    console.log("Demo form submitted:", demoForm);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle contact form submission
    console.log("Contact form submitted:", contactForm);
  };

  return (
    <div className="bg-[#fbf9f4] min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image 
                src="/logo cyber clipper.png" 
                alt="Cyber Clipper Logo" 
                width={40} 
                height={40} 
                className="object-contain"
              />
              <span className="ml-3 font-bold text-xl text-gray-900">Cyber Clipper</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-[#a259f7] transition-colors font-medium">Home</a>
              <a href="#about" className="text-gray-700 hover:text-[#a259f7] transition-colors font-medium">About Us</a>
              <a href="#contact" className="text-gray-700 hover:text-[#a259f7] transition-colors font-medium">Contact Us</a>
            </nav>

            {/* CTA Button */}
            <button 
              onClick={() => document.getElementById('demo-form').scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#a259f7] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#8b4fd8] transition-colors shadow-md"
            >
              Request Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Secure Your Digital
                <span className="text-[#a259f7] block">Future Today</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Advanced cybersecurity solutions that protect your business from evolving threats. 
                Our comprehensive platform ensures your data stays safe and your operations remain uninterrupted.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-[#a259f7] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#8b4fd8] transition-colors shadow-lg">
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
            <div className="relative">
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
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to secure your digital infrastructure and protect your valuable data
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#fbf9f4] p-8 rounded-xl border border-gray-100">
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

            <div className="bg-[#fbf9f4] p-8 rounded-xl border border-gray-100">
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

            <div className="bg-[#fbf9f4] p-8 rounded-xl border border-gray-100">
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

      {/* Request Demo Form */}
      <section id="demo-form" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Request a Demo</h2>
            <p className="text-xl text-gray-600">
              See how Cyber Clipper can transform your security posture. Schedule a personalized demo today.
            </p>
          </div>

          <form onSubmit={handleDemoSubmit} className="bg-[#fbf9f4] p-8 rounded-2xl shadow-lg">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={demoForm.name}
                  onChange={(e) => setDemoForm({...demoForm, name: e.target.value})}
                  className="w-full px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent"
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
                  className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={demoForm.company}
                  onChange={(e) => setDemoForm({...demoForm, company: e.target.value})}
                  className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent"
                  placeholder="Enter your company name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={demoForm.phone}
                  onChange={(e) => setDemoForm({...demoForm, phone: e.target.value})}
                  className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent"
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
                className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent"
                placeholder="Tell us about your security needs..."
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="bg-[#a259f7] text-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#8b4fd8] transition-colors shadow-lg"
              >
                Schedule Demo
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Contact Us Form */}
      <section id="contact" className="py-20 bg-[#fbf9f4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent"
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
                  className="w-full px-4 text-gray-600 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent"
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
                className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent"
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
                className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a259f7] focus:border-transparent"
                placeholder="Enter your message..."
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="bg-[#a259f7] text-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#8b4fd8] transition-colors shadow-lg"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <Image 
                  src="/logo cyber clipper.png" 
                  alt="Cyber Clipper Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain"
                />
                <span className="ml-3 font-bold text-xl">Cyber Clipper</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Protecting businesses worldwide with advanced cybersecurity solutions. 
                Your security is our priority.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#a259f7] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#a259f7] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#a259f7] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-[#a259f7] transition-colors">Home</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-[#a259f7] transition-colors">About Us</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-[#a259f7] transition-colors">Contact</a></li>
                <li><a href="#demo-form" className="text-gray-400 hover:text-[#a259f7] transition-colors">Request Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li>contact@cyberclipper.com</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Security St, Cyber City</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Cyber Clipper. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
