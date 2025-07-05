import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import PricingComponent from "../../components/pricing";

const Login = () => {
  const router = useRouter();
  const [uniqueId, setUniqueId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showUniqueId, setShowUniqueId] = useState(false);
  const [showCompanyId, setShowCompanyId] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        router.push("/playground");
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen w-screen flex flex-row bg-[#f5f0ff] font-manrope">
      {/* Custom Notification */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-right duration-300">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-medium">Logged in successfully!</span>
        </div>
      )}

      {/* Back Button - Top Left */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-3 left-6 z-50 flex items-center space-x-2 text-[#a259f7] hover:text-[#8b5cf6] transition-colors duration-200 "
      >
        <span className="text-lg">←</span>
        <span className="font-medium">Back</span>
      </button>

      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-start items-start py-[5vh] px-[4vw] relative">
        {/* Pricing Button - Top Left */}

        {/* Branding Info */}
        <div className="max-w-[500px]">
          <h1 className="text-[50px] mt-8 font-extrabold text-[#a259f7] mb-4">
            Welcome to Admin panel
          </h1>
          <p className="text-[18px] leading-relaxed text-[#4b5563]">
            Manage your company, employees, and products with ease. Cyber
            Clipper gives you a powerful admin panel that is fast, secure, and
            reliable.
          </p>
          <ul className="mt-5 pl-5 text-[#a259f7] font-semibold list-disc">
            <li>Easy user management</li>
            <li>Real-time analytics</li>
            <li>Advanced security</li>
          </ul>
          {/* Brief additional info */}

          <p className="mt-5 text-[15px] text-[#4b5563]">
            Get started in minutes and empower your team with tools designed for
            productivity and growth.
          </p>
        </div>

        <div className="mt-10">
          <button
            onClick={() => setShowPricingModal(true)}
            className="inline-block py-2 px-4 bg-[#a259f7] text-white rounded-md font-semibold text-sm tracking-wide hover:bg-[#7c3aed] transition-colors duration-200"
          >
            View Pricing
          </button>
        </div>
      </div>

      {/* Right Section (Sign In Form) */}
      <div className="flex-1 flex justify-center items-center py-[5vh] px-[4vw]">
        <form
          onSubmit={handleVerify}
          className="bg-white rounded-xl w-full max-w-[400px] p-10 flex flex-col gap-6"
        >
          <h2 className="text-[30px] font-extrabold text-[#a259f7] mb-1">
            Sign In
          </h2>
          <p className="text-[#6b7280] text-[15px] mb-2">
            Welcome back! Please login to your account.
          </p>

          {/* Unique ID Input */}
          <div className="relative">
            <label className="font-semibold text-[15px] text-[#22223b] mb-1 block">
              Unique ID
            </label>
            <input
              type={showUniqueId ? "text" : "password"}
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              placeholder="Enter your unique ID"
              autoComplete="username"
              required
              className="w-full py-3 px-4 pr-10 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f9f9fc] outline-none"
            />
            <span
              className="absolute right-3 top-12 transform -translate-y-1/2 cursor-pointer"
              onClick={() => setShowUniqueId((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showUniqueId ? "Hide Unique ID" : "Show Unique ID"}
            >
              {showUniqueId ? (
                // Eye-off SVG
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#a259f7"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M15 12a3 3 0 00-3-3m0 0a3 3 0 00-3 3m0 0a3 3 0 003 3m0 0a3 3 0 003-3m0 0a3 3 0 00-3-3m0 0a3 3 0 00-3 3m0 0a3 3 0 003 3m0 0a3 3 0 003-3m0 0a3 3 0 00-3-3m0 0a3 3 0 00-3 3"
                  />
                </svg>
              ) : (
                // Eye SVG
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#a259f7"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="#a259f7"
                    strokeWidth="1.5"
                  />
                </svg>
              )}
            </span>
          </div>

          {/* Company ID Input */}
          <div className="relative">
            <label className="font-semibold text-[15px] text-[#22223b] mb-1 block">
              Company ID
            </label>
            <input
              type={showCompanyId ? "text" : "password"}
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="Enter your company ID"
              autoComplete="organization"
              required
              className="w-full py-3 px-4 pr-10 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f9f9fc] outline-none"
            />
            <span
              className="absolute right-3 top-12 transform -translate-y-1/2 cursor-pointer"
              onClick={() => setShowCompanyId((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showCompanyId ? "Hide Company ID" : "Show Company ID"}
            >
              {showCompanyId ? (
                // Eye-off SVG
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#a259f7"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M15 12a3 3 0 00-3-3m0 0a3 3 0 00-3 3m0 0a3 3 0 003 3m0 0a3 3 0 003-3m0 0a3 3 0 00-3-3m0 0a3 3 0 00-3 3m0 0a3 3 0 003 3m0 0a3 3 0 003-3m0 0a3 3 0 00-3-3m0 0a3 3 0 00-3 3"
                  />
                </svg>
              ) : (
                // Eye SVG
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#a259f7"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="#a259f7"
                    strokeWidth="1.5"
                  />
                </svg>
              )}
            </span>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={verifying}
            className={`w-full py-[13px] rounded-lg text-[17px] font-bold transition-all duration-200 tracking-wider border-none ${
              verifying
                ? "bg-[#e0dfea] text-[#a259f7] cursor-not-allowed"
                : "bg-[#a259f7] text-white cursor-pointer"
            }`}
          >
            {verifying ? "Verifying ..." : "Verify"}
          </button>

          {/* Signup Link */}
          <div className="text-[15px] text-[#4b5563] text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-[#a259f7] font-bold underline"
            >
              Register now
            </Link>
          </div>
        </form>
      </div>

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowPricingModal(false)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Pricing Content */}
            <div className="p-8">
              <PricingComponent
                onPlanSelect={(planName) => {
                  console.log("Selected plan:", planName);
                  // You can add logic here to handle plan selection
                }}
                selectedPlan={null}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
