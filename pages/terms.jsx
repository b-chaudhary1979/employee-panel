import React from "react";

const Terms = () => (
  <div className="min-h-screen bg-[#f8f9fa] text-gray-400 py-12 px-4 font-manrope">
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-extrabold text-[#a259f7] mb-4">Terms & Conditions</h1>
      <div className="text-gray-500 text-sm mb-8">Last updated: July 8, 2024</div>
      <section className="mb-6">
        <h2 className="text-xl font-bold text-[#22223b] mb-2">1. Introduction</h2>
        <p>Welcome to Cyber Clipper Admin Panel. By accessing or using our services, you agree to be bound by these Terms & Conditions. Please read them carefully.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-bold text-[#22223b] mb-2">2. User Obligations</h2>
        <p>You agree to use the platform responsibly and not to misuse any features. You are responsible for maintaining the confidentiality of your account information.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-bold text-[#22223b] mb-2">3. Limitation of Liability</h2>
        <p>We are not liable for any damages or losses resulting from your use of the platform. The service is provided "as is" without warranties of any kind.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-bold text-[#22223b] mb-2">4. Changes to Terms</h2>
        <p>We reserve the right to update these Terms & Conditions at any time. Changes will be posted on this page with an updated date.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-[#22223b] mb-2">5. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at <a href="mailto:contact@cyberclipper.com" className="text-[#a259f7] underline">contact@cyberclipper.com</a>.</p>
      </section>
    </div>
  </div>
);

export default Terms; 