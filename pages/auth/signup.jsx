import React, { useState } from "react";
import Link from "next/link";
import PricingComponent from "../../components/pricing";
import NeuralNetwork from "../../components/bg-animation";
import { useRouter } from "next/router";
import useFetchUser from "../../hooks/useFetchUser";
import { getNames, getCode } from 'country-list';

const steps = [1, 2, 3, 4];

const Step1 = ({ onChange, values }) => {
  const countryNames = getNames();
  return (
    <div className="flex flex-col gap-4">
      <label className="font-semibold text-[15px] text-[#22223b]">
        Full Name<span className="text-red-500 ml-1">*</span>
      </label>
      <input
        type="text"
        name="name"
        value={values.name || ""}
        onChange={onChange}
        placeholder="Enter your full name"
        className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
        required
      />
      <label className="font-semibold text-[15px] text-[#22223b]">
        Email<span className="text-red-500 ml-1">*</span>
      </label>
      <input
        type="email"
        name="email"
        value={values.email || ""}
        onChange={onChange}
        placeholder="Enter your email"
        className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
        required
      />
      <label className="font-semibold text-[15px] text-[#22223b]">
        Phone Number<span className="text-red-500 ml-1">*</span>
      </label>
      <input
        type="tel"
        name="phone"
        value={values.phone || ""}
        onChange={onChange}
        placeholder="Enter your phone number"
        className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
        required
      />
      <label className="font-semibold text-[15px] text-[#22223b]">
        Alternative Phone Number
      </label>
      <input
        type="tel"
        name="altPhone"
        value={values.altPhone || ""}
        onChange={onChange}
        placeholder="Enter alternative phone number (optional)"
        className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
      />
      <label className="font-semibold text-[15px] text-[#22223b]">
        Country<span className="text-red-500 ml-1">*</span>
      </label>
      <select
        name="country"
        value={values.country || ""}
        onChange={onChange}
        className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
        required
      >
        <option value="">Select your country</option>
        {countryNames.map((country) => (
          <option key={country} value={getCode(country) || country}>{country}</option>
        ))}
        <option value="Other">Other</option>
      </select>
      <label className="font-semibold text-[15px] text-[#22223b]">
        Designation<span className="text-red-500 ml-1">*</span>
      </label>
      <input
        type="text"
        name="designation"
        value={values.designation || ""}
        onChange={onChange}
        placeholder="Enter your designation/role"
        className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
        required
      />
      <label className="font-semibold text-[15px] text-[#22223b]">
        Date of Birth<span className="text-red-500 ml-1">*</span>
      </label>
      <input
        type="date"
        name="dob"
        value={values.dob || ""}
        onChange={onChange}
        className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
        required
      />
    </div>
  );
};

const Step2 = ({ onChange, values }) => (
  <div className="flex flex-col gap-4">
    <label className="font-semibold text-[15px] text-[#22223b]">
      Company Name<span className="text-red-500 ml-1">*</span>
    </label>
    <input
      type="text"
      name="company"
      value={values.company || ""}
      onChange={onChange}
      placeholder="Enter your company name"
      className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
      required
    />
    <label className="font-semibold text-[15px] text-[#22223b]">
      Company Size<span className="text-red-500 ml-1">*</span>
    </label>
    <select
      name="companySize"
      value={values.companySize || ""}
      onChange={onChange}
      className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
      required
    >
      <option value="">Select company size</option>
      <option value="1-10">1-10 employees</option>
      <option value="11-50">11-50 employees</option>
      <option value="51-200">51-200 employees</option>
      <option value="201-500">201-500 employees</option>
      <option value="501-1000">501-1000 employees</option>
      <option value="1000+">1000+ employees</option>
    </select>
    <label className="font-semibold text-[15px] text-[#22223b]">
      Company Location<span className="text-red-500 ml-1">*</span>
    </label>
    <input
      type="text"
      name="location"
      value={values.location || ""}
      onChange={onChange}
      placeholder="Enter company location/city"
      className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
      required
    />
    <label className="font-semibold text-[15px] text-[#22223b]">
      Where did you hear about us?<span className="text-red-500 ml-1">*</span>
    </label>
    <select
      name="hearAboutUs"
      value={values.hearAboutUs || ""}
      onChange={onChange}
      className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
      required
    >
      <option value="">Select an option</option>
      <option value="Google Search">Google Search</option>
      <option value="Social Media">Social Media (Facebook, Twitter, LinkedIn)</option>
      <option value="Online Advertisement">Online Advertisement</option>
      <option value="Email Marketing">Email Marketing</option>
      <option value="Word of Mouth">Word of Mouth</option>
      <option value="Industry Conference">Industry Conference/Event</option>
      <option value="Blog/Article">Blog or Article</option>
      <option value="YouTube">YouTube</option>
      <option value="Podcast">Podcast</option>
      <option value="Referral">Referral from Colleague/Friend</option>
      <option value="Trade Publication">Trade Publication</option>
      <option value="Webinar">Webinar</option>
      <option value="Partner Recommendation">Partner Recommendation</option>
      <option value="Other">Other</option>
    </select>
    <label className="font-semibold text-[15px] text-[#22223b]">
      Purpose of Use<span className="text-red-500 ml-1">*</span>
    </label>
    <select
      name="purpose"
      value={values.purpose || ""}
      onChange={onChange}
      className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
      required
    >
      <option value="">Select purpose of use</option>
      <option value="Employee Management">Employee Management</option>
      <option value="Product Management">Product Management</option>
      <option value="Security Monitoring">Security Monitoring</option>
      <option value="Data Analytics">Data Analytics & Reporting</option>
      <option value="Client Management">Client Management</option>
      <option value="Project Management">Project Management</option>
      <option value="Other">Other</option>
    </select>
  </div>
);

const Step3 = ({ onChange, values, onPlanSelect }) => (
  <div className="flex flex-col gap-6">
    <div>
      <label className="font-semibold text-[15px] text-[#22223b] mb-4 block">
        Choose a Plan<span className="text-red-500 ml-1">*</span>
      </label>
      <PricingComponent
        onPlanSelect={onPlanSelect}
        selectedPlan={values.plan}
      />
    </div>
  </div>
);

const Step4 = ({ values, agreed, onAgree, uniqueId, companyId, onCopyUniqueId, onCopyCompanyId, onCopyBoth }) => (
  <div className="flex flex-col gap-6">
    <div>
      <div className="font-semibold text-[15px] text-[#22223b] mb-4">
        Review your information:
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#f9f9fc] p-4 rounded-lg">
          <h4 className="font-bold text-[#22223b] mb-3">Personal Information</h4>
          <div className="text-[14px] text-[#4b5563] space-y-2">
            <div><span className="font-semibold">Name:</span> {values.name}</div>
            <div><span className="font-semibold">Email:</span> {values.email}</div>
            <div><span className="font-semibold">Phone:</span> {values.phone}</div>
            {values.altPhone && <div><span className="font-semibold">Alt Phone:</span> {values.altPhone}</div>}
            <div><span className="font-semibold">Country:</span> {values.country}</div>
            <div><span className="font-semibold">Designation:</span> {values.designation}</div>
            <div><span className="font-semibold">Date of Birth:</span> {values.dob}</div>
          </div>
        </div>
        <div className="bg-[#f9f9fc] p-4 rounded-lg">
          <h4 className="font-bold text-[#22223b] mb-3">Company Information</h4>
          <div className="text-[14px] text-[#4b5563] space-y-2">
            <div><span className="font-semibold">Company:</span> {values.company}</div>
            <div><span className="font-semibold">Size:</span> {values.companySize}</div>
            <div><span className="font-semibold">Location:</span> {values.location}</div>
            <div><span className="font-semibold">Heard About Us:</span> {values.hearAboutUs}</div>
            <div><span className="font-semibold">Purpose:</span> {values.purpose}</div>
          </div>
        </div>
      </div>
      
      {/* Selected Plan Card */}
      <div className="mt-6">
        <h4 className="font-bold text-[#22223b] mb-3">Selected Plan</h4>
        <div className="bg-gradient-to-r from-[#a259f7] to-[#7c3aed] rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold mb-1">{values.plan}</h3>
              <p className="text-[#e0dfea] text-sm">Perfect for your needs</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {values.plan === "Basic" && "$29"}
                {values.plan === "Pro" && "$79"}
                {values.plan === "Enterprise" && "$199"}
              </div>
              <div className="text-[#e0dfea] text-sm">per month</div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            {values.plan === "Basic" && (
              <>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Up to 10 employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Basic security features</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Email support</span>
                </div>
              </>
            )}
            {values.plan === "Pro" && (
              <>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Up to 50 employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Advanced security & analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Priority support</span>
                </div>
              </>
            )}
            {values.plan === "Enterprise" && (
              <>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Unlimited employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Full security suite & custom features</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>24/7 dedicated support</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Unique IDs Section */}
    <div className="space-y-4">
      <div className="font-semibold text-[15px] text-[#22223b]">
        Your Unique Identifiers
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-[#4b5563] mb-2">
            Unique User ID
          </label>
          <div className="flex">
            <input
              type="text"
              value={uniqueId}
              readOnly
              className="flex-1 py-3 px-4 text-gray-700 rounded-l-lg border border-[#e0dfea] text-[15px] bg-white font-mono"
            />
            <button
              type="button"
              onClick={onCopyUniqueId}
              className="px-4 py-3 bg-[#a259f7] text-white rounded-r-lg hover:bg-[#7c3aed] transition-colors relative overflow-hidden"
              id="copyUniqueBtn"
            >
              <span className="copy-text">Copy</span>
              <span className="success-text hidden">✓</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-[#4b5563] mb-2">
            Company ID
          </label>
          <div className="flex">
            <input
              type="text"
              value={companyId}
              readOnly
              className="flex-1 py-3 px-4 text-gray-700 rounded-l-lg border border-[#e0dfea] text-[15px] bg-white font-mono"
            />
            <button
              type="button"
              onClick={onCopyCompanyId}
              className="px-4 py-3 bg-[#a259f7] text-white rounded-r-lg hover:bg-[#7c3aed] transition-colors relative overflow-hidden"
              id="copyCompanyBtn"
            >
              <span className="copy-text">Copy</span>
              <span className="success-text hidden">✓</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full flex flex-col items-center mb-2">
          <div className="bg-[#f8fafc] border border-[#a259f7] rounded-lg px-6 py-4 mb-4 text-center shadow-sm max-w-xl">
            <span className="font-bold text-[#a259f7] text-lg">Copy both IDs to access your admin panel!</span>
            <div className="text-[#4b5563] text-sm mt-1">These are your unique credentials. Keep them safe for secure access.</div>
          </div>
          <button
            type="button"
            onClick={onCopyBoth}
            className="px-6 py-3 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors font-semibold relative overflow-hidden"
            id="copyBothBtn"
          >
            <span className="copy-text">Copy Both IDs</span>
            <span className="success-text hidden">✓ Copied!</span>
          </button>
        </div>
      </div>
    </div>

    <label className="flex items-center gap-2 text-gray-500 text-[15px]">
      <input
        type="checkbox"
        checked={agreed}
        onChange={onAgree}
        className="accent-[#a259f7]"
        required
      />
      I agree to the
      <Link href="/terms" className="text-[#a259f7] underline" target="_blank">
        Terms &amp; Conditions
      </Link>
      and
      <Link
        href="/privacy"
        className="text-[#a259f7] underline"
        target="_blank"
      >
        Privacy Policy
      </Link>
    </label>
  </div>
);

const stepsContent = [Step1, Step2, Step3, Step4];

// Confetti burst from top edge of notification (left, center, right)
const confettiBurstCount = 24;
const confettiColors = [
  "#a259f7",
  "#22c55e",
  "#fbbf24",
  "#ef4444",
  "#3b82f6",
  "#f472b6",
  "#10b981",
  "#f59e42",
  "#6366f1",
  "#eab308",
  "#f43f5e",
  "#0ea5e9",
  "#a3e635",
  "#f87171",
  "#f472b6",
  "#fbbf24",
];
function makeBurst(cx, cy, angleStart, angleEnd) {
  return Array.from({ length: confettiBurstCount }).map((_, i) => {
    // Spread angles between angleStart and angleEnd (in radians)
    const angle =
      (angleStart + ((angleEnd - angleStart) * i) / (confettiBurstCount - 1)) *
      (Math.PI / 180);
    const distance = 90 + Math.random() * 40;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 30;
    return {
      dx,
      dy,
      color: confettiColors[i % confettiColors.length],
      delay: 0.08 + Math.random() * 0.18,
      r: Math.random() > 0.5 ? 6 : 4,
      cx,
      cy,
    };
  });
}
const confettiBursts = [
  // Left-top
  makeBurst(40, 20, -100, 60),
  // Center-top
  makeBurst(110, 20, -80, 80),
  // Right-top
  makeBurst(180, 20, 120, 280),
];
const allConfetti = confettiBursts.flat();

const SuccessNotification = () => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/10 backdrop-blur-md">
    <div className="relative bg-white rounded-xl p-16 min-w-[440px] flex flex-col items-center shadow-lg animate-fade-in overflow-visible">
      {/* Confetti Bursts: large SVG, not clipped to box */}
      <div className="pointer-events-none fixed left-0 top-0 w-full h-full z-50">
        <svg
          className="confetti-svg"
          width="100vw"
          height="100vh"
          viewBox="0 0 1000 600"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
          }}
        >
          {allConfetti.map((c, i) => (
            <circle
              key={i}
              className={`confetti confetti${i + 1}`}
              cx={(c.cx / 220) * 1000}
              cy={(c.cy / 120) * 200}
              r={c.r}
              fill={c.color}
              style={{ animationDelay: `${c.delay}s` }}
            />
          ))}
        </svg>
      </div>
      <svg className="w-24 h-24 mb-6 animate-tick" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r="25" fill="#e6f9ec" />
        <path
          fill="none"
          stroke="#22c55e"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27l7 7 16-16"
        />
      </svg>
      <div className="text-3xl font-extrabold text-[#22c55e] mb-2">
        Successfully submitted
      </div>
    </div>
    <style jsx>{`
      @keyframes tick {
        0% {
          stroke-dasharray: 0, 40;
        }
        100% {
          stroke-dasharray: 40, 0;
        }
      }
      .animate-tick path {
        stroke-dasharray: 40, 0;
        stroke-dashoffset: 0;
        animation: tick 0.7s ease forwards;
      }
      .animate-fade-in {
        animation: fadeIn 0.3s;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      /* Confetti burst keyframes for all pieces, slower and smooth */
      ${allConfetti
        .map(
          (c, i) => `@keyframes confetti${i + 1} {
        0% { opacity: 0; transform: translate(0,0) scale(1); }
        10% { opacity: 1; }
        80% { opacity: 1; }
        100% { opacity: 0; transform: translate(${c.dx * 4.5}px,${
            c.dy * 3
          }px) scale(1.2) rotate(${Math.random() * 360}deg); }
      }`
        )
        .join("\n")}
      .confetti-svg {
        position: absolute;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 50;
      }
      ${allConfetti
        .map(
          (_, i) =>
            `.confetti${i + 1} { animation: confetti${
              i + 1
            } 2.1s cubic-bezier(0.4,0,0.2,1) both; }`
        )
        .join("\n")}
    `}</style>
  </div>
);

const getFirstThree = (str = "") => {
  const clean = (str || "XXX").replace(/[^a-zA-Z]/g, "").toUpperCase();
  return (clean + "XXX").slice(0, 3);
};

const getSecretCode = () => {
  // 4 random alphanumeric chars
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

const getJumbledDobDigits = (dob = "") => {
  // Extract digits from dob (YYYY-MM-DD), pick 3, shuffle
  const digits = (dob.match(/\d/g) || []).join("");
  if (digits.length < 3) return "000";
  // Pick 3 random digits and shuffle
  let arr = digits.split("");
  let selected = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * arr.length);
    selected.push(arr[idx]);
    arr.splice(idx, 1);
  }
  // Shuffle selected digits
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }
  return selected.join("");
};

const Signup = () => {
  const [step, setStep] = useState(0);
  const [formValues, setFormValues] = useState({ plan: "Basic" });
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [uniqueId, setUniqueId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const router = useRouter();
  const { storeUser, loading: storingUser, error: storeError, success: storeSuccess } = useFetchUser();

  // Generate unique IDs when component mounts
  React.useEffect(() => {
    // Generate Company ID
    const company = formValues.company || "";
    const location = formValues.location || "";
    const companyCode = getFirstThree(company);
    const locationCode = getFirstThree(location);
    const companySecret = getSecretCode();
    const companyId = `CID-${companyCode}-${companySecret}-${locationCode}`;

    // Generate Unique User ID
    const name = formValues.name || "";
    const dob = formValues.dob || "";
    const userCode = getFirstThree(name);
    const userSecret = getSecretCode();
    const dobDigits = getJumbledDobDigits(dob);
    const uniqueId = `EID-${userCode}-${userSecret}-${dobDigits}`;

    setUniqueId(uniqueId);
    setCompanyId(companyId);
    // eslint-disable-next-line
  }, [formValues.company, formValues.location, formValues.name, formValues.dob]);

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handlePlanSelect = (planName) => {
    setFormValues({ ...formValues, plan: planName });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 2 && !formValues.plan) return;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = (e) => {
    e.preventDefault();
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;
    setSubmitted(true);
    // Store user info in Firestore
    await storeUser({ ...formValues, uniqueId }, companyId);
    setTimeout(() => {
      setSubmitted(false);
      router.push("/auth/login");
    }, 2000);
  };

  const showCopySuccess = (buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      const copyText = button.querySelector('.copy-text');
      const successText = button.querySelector('.success-text');
      
      copyText.classList.add('hidden');
      successText.classList.remove('hidden');
      button.style.backgroundColor = '#22c55e';
      
      setTimeout(() => {
        copyText.classList.remove('hidden');
        successText.classList.add('hidden');
        button.style.backgroundColor = buttonId === 'copyBothBtn' ? '#22c55e' : '#a259f7';
      }, 2000);
    }
  };

  const copyToClipboard = async (text, buttonId) => {
    try {
      await navigator.clipboard.writeText(text);
      showCopySuccess(buttonId);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCopyUniqueId = () => copyToClipboard(uniqueId, 'copyUniqueBtn');
  const handleCopyCompanyId = () => copyToClipboard(companyId, 'copyCompanyBtn');
  const handleCopyBoth = () => copyToClipboard(`User ID: ${uniqueId}\nCompany ID: ${companyId}`, 'copyBothBtn');

  const StepComponent = stepsContent[step];

  return (
    <div className="min-h-screen w-full font-manrope relative overflow-hidden">
      <NeuralNetwork />
      <div className="flex flex-col items-center justify-center relative z-10">
        {/* Heading and Subheading */}
        <div className="text-center mt-12 mb-6">
          <h1 className="text-[2.2rem] font-extrabold text-[#a259f7] mb-2">
            Create Your Account
          </h1>
          <p className="text-[#4b5563] text-[1.1rem] max-w-xl mx-auto">
            Sign up to get started with Cyber Clipper Admin Panel. Manage your
            company, employees, and products with ease.
          </p>
        </div>
        {/* Timeline */}
        <div className="flex items-center justify-center gap-6 mb-10 mt-2">
          {steps.map((s, idx) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-lg font-bold transition-all duration-200 ${
                  idx === step
                    ? "bg-[#a259f7] border-[#a259f7] text-white scale-110 shadow-lg breathe"
                    : idx < step
                    ? "bg-[#e6f9ec] border-[#22c55e] text-[#22c55e]"
                    : "bg-white border-[#e0dfea] text-[#a259f7]"
                }`}
              >
                {s}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-16 h-1 rounded transition-all duration-200 ${
                    idx < step ? "bg-[#22c55e]" : "bg-[#e0dfea]"
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Form */}
        <form
          className={`bg-[#d1d5db] rounded-xl w-full ${
            step === 2 ? "max-w-6xl" : "max-w-2xl"
          } p-10 flex flex-col gap-8 shadow-lg mb-10`}
          onSubmit={step === steps.length - 1 ? handleSubmit : handleNext}
        >
          {step === 0 && <Step1 onChange={handleChange} values={formValues} />}
          {step === 1 && <Step2 onChange={handleChange} values={formValues} />}
          {step === 2 && (
            <Step3
              onChange={handleChange}
              values={formValues}
              onPlanSelect={handlePlanSelect}
            />
          )}
          {step === 3 && (
            <Step4
              values={formValues}
              agreed={agreed}
              onAgree={() => setAgreed((a) => !a)}
              uniqueId={uniqueId}
              companyId={companyId}
              onCopyUniqueId={handleCopyUniqueId}
              onCopyCompanyId={handleCopyCompanyId}
              onCopyBoth={handleCopyBoth}
            />
          )}
          {storeError && (
            <div className="text-red-500 text-center font-semibold">{storeError}</div>
          )}
          {storingUser && (
            <div className="text-blue-500 text-center font-semibold">Storing user info...</div>
          )}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              className={`py-2 px-6 rounded-lg font-semibold text-[15px] border transition-all duration-200 ${
                step === 0
                  ? "bg-[#e0dfea] text-[#a259f7] cursor-not-allowed"
                  : "bg-white text-[#a259f7] border-[#a259f7] hover:bg-[#f5f0ff]"
              }`}
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                type="submit"
                className="py-2 px-6 rounded-lg font-semibold text-[15px] bg-[#a259f7] text-white hover:bg-[#7c3aed] transition-all duration-200"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!agreed}
                className={`py-2 px-6 rounded-lg font-semibold text-[15px] bg-[#22c55e] text-white hover:bg-[#16a34a] transition-all duration-200 ${
                  !agreed ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                Submit
              </button>
            )}
          </div>
        </form>
        {submitted && <SuccessNotification />}
        <style jsx>{`
          @keyframes breathe {
            0% {
              transform: scale(1.08);
            }
            50% {
              transform: scale(1.22);
            }
            100% {
              transform: scale(1.08);
            }
          }
          .breathe {
            animation: breathe 1.6s ease-in-out infinite;
          }
          .hidden {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Signup;
