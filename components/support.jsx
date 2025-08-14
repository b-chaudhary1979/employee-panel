import React from "react";

export default function Support() {
  return (
    <div className="rounded-xl shadow-md p-6 mt-8 bg-white border border-gray-100 flex flex-col items-center text-center w-full">
      <h2 className="text-xl font-bold mb-2" style={{ color: "#16a34a" }}>Need Help or Support?</h2>
      <p className="text-gray-700 mb-4">
        If you have any questions, issues, or need assistance, our team is here to help you. Reach out to us anytime!
      </p>
      <a
        href="mailto:info@cyberclipper.com"
        className="inline-block px-5 py-2 rounded-full font-semibold text-white"
        style={{ background: "linear-gradient(90deg, #16a34a 0%, #28BD78 100%)", boxShadow: "0 2px 8px 0 rgba(162,89,247,0.10)" }}
      >
        Email Support
      </a>
    </div>
  );
} 