import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import PricingComponent from "../../components/pricing";
import NeuralNetwork from "../../components/bg-animation";
import usefetchCredentials from "../../hooks/usefetchCredentials";
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const router = useRouter();
  const [uniqueId, setUniqueId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [showUniqueId, setShowUniqueId] = useState(false);
  const [showCompanyId, setShowCompanyId] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);

  // Use the authentication hook
  const { authenticate, loading, error, user } = usefetchCredentials();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("logoutSuccess")
    ) {
      setNotificationMessage("Logged out successfully!");
      setShowNotification(true);
      localStorage.removeItem("logoutSuccess");
      setTimeout(() => setShowNotification(false), 2000);
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!captchaValue) {
      setNotificationMessage("Please complete the captcha");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
      return;
    }
    // Use the authenticate function from the hook
    const result = await authenticate(companyId, uniqueId);
    if (result) {
      setNotificationMessage("Successfully logged in!");
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        router.push(`/playground?ci=${encodeURIComponent(companyId)}&aid=${encodeURIComponent(uniqueId)}`);
      }, 1500);
    } else {
      setNotificationMessage(error || "Invalid credentials");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-screen font-manrope relative overflow-hidden flex items-center justify-center">
      {/* Full-page blur background */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-xs z-0" />
      <NeuralNetwork />
      <div className="flex flex-col md:flex-row relative z-10 w-full h-full max-w-7xl mx-auto">
        {/* Custom Notification */}
        {showNotification && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 md:top-6 md:right-6 md:left-auto md:translate-x-0 z-50 px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-right duration-300 max-w-[90vw] md:max-w-none 
              ${notificationMessage && (notificationMessage.toLowerCase().includes('invalid credentials') || notificationMessage.toLowerCase().includes('please complete the captcha'))
                ? 'bg-red-400 text-white'
                : 'bg-green-500 text-white'}
            `}
          >
            {notificationMessage && notificationMessage.toLowerCase().includes('invalid credentials') ? (
              // Cross (X) SVG for error
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : notificationMessage && notificationMessage.toLowerCase().includes('please complete the captcha') ? (
              // Exclamation SVG for captcha warning
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 17a5 5 0 100-10 5 5 0 000 10z" />
              </svg>
            ) : (
              // Checkmark SVG for success
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className="font-medium text-sm md:text-base">{notificationMessage}</span>
          </div>
        )}
        {/* Back Button - Top Left */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-2 left-2 md:top-3 md:left-6 z-50 flex items-center space-x-2 text-[#a259f7] hover:text-gray-500 transition-colors duration-200 text-base md:text-lg"
        >
          <span className="text-lg">←</span>
          <span className="font-medium">Back</span>
        </button>
        {/* Left Section */}
        <div className="flex-1 flex flex-col justify-start items-start py-8 px-4 sm:px-8 md:py-[5vh] md:px-[4vw] relative bg-white/5 backdrop-blur-xs w-full md:w-auto">
          {/* Branding Info */}
          <div className="max-w-full md:max-w-[500px]">
            <h1 className="text-[32px] sm:text-[40px] md:text-[50px] mt-4 md:mt-8 font-extrabold text-[#a259f7] mb-3 md:mb-4">
              Welcome to Admin panel
            </h1>
            <p className="text-[15px] sm:text-[16px] md:text-[18px] leading-relaxed text-[#fff]">
              Manage your company, employees, and products with ease. Cyber
              Clipper gives you a powerful admin panel that is fast, secure, and
              reliable.
            </p>
            <ul className="mt-4 md:mt-5 pl-5 text-[#a259f7] font-semibold list-disc text-[14px] sm:text-[15px] md:text-[16px]">
              <li>Easy user management</li>
              <li>Real-time analytics</li>
              <li>Advanced security</li>
            </ul>
            {/* Brief additional info */}
            <p className="mt-4 md:mt-5 text-[13px] sm:text-[14px] md:text-[15px] text-[#fff]">
              Get started in minutes and empower your team with tools designed
              for productivity and growth.
            </p>
          </div>
          <div className="mt-8 md:mt-10 w-full flex justify-center md:justify-start">
            <button
              onClick={() => setShowPricingModal(true)}
              className="inline-block py-2 px-4 bg-[#a259f7] text-white rounded-md font-semibold text-sm no-underline tracking-wide hover:bg-[#8b4fd8] transition-colors duration-200"
            >
              View Pricing
            </button>
          </div>
        </div>
        {/* Right Section (Sign In Form) */}
        <div className="flex-1 flex justify-center items-center py-8 px-4 sm:px-8 md:py-[5vh] md:px-[4vw] w-full md:w-auto">
          <form
            onSubmit={handleVerify}
            className="bg-gray-300 rounded-xl w-full max-w-[95vw] sm:max-w-[400px] pt-2 pb-4 px-4 sm:pt-3 sm:pb-6 sm:px-6 md:pt-4 md:pb-8 md:px-8 flex flex-col gap-4 sm:gap-5"
          >
            <h2 className="text-[24px] sm:text-[28px] md:text-[30px] font-extrabold text-[#a259f7]">
              Sign In
            </h2>
            <p className="text-[#6b7280] text-[14px] sm:text-[15px]">
              Welcome back! Please login to your account.
            </p>
            {/* Unique ID Input */}
            <div className="relative">
              <label className="font-semibold text-[14px] sm:text-[15px] text-[#22223b] mb-1 block">
                Unique ID
              </label>
              <input
                type={showUniqueId ? "text" : "password"}
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
                placeholder="Enter your unique ID"
                autoComplete="username"
                required
                className="w-full py-3 px-4 pr-10 text-gray-700 rounded-lg border border-[#e0dfea] text-[14px] sm:text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
              />
              <span
                className="absolute right-3 top-10 sm:top-12 transform -translate-y-1/2 cursor-pointer"
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
              <label className="font-semibold text-[14px] sm:text-[15px] text-[#22223b] mb-1 block">
                Company ID
              </label>
              <input
                type={showCompanyId ? "text" : "password"}
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="Enter your company ID"
                autoComplete="organization"
                required
                className="w-full py-3 px-4 pr-10 text-gray-700 rounded-lg border border-[#e0dfea] text-[14px] sm:text-[15px] bg-[#f8f9fa] outline-none focus:border-[#a259f7] focus:ring-2 focus:ring-[#a259f7]"
              />
              <span
                className="absolute right-3 top-10 sm:top-12 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowCompanyId((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-label={
                  showCompanyId ? "Hide Company ID" : "Show Company ID"
                }
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
            {/* Google reCAPTCHA */}
            <div className="flex justify-center my-2">
              <ReCAPTCHA
                sitekey="6LdR-HsrAAAAAO6pQXWNROYbxE2F956skASebGNL"
                onChange={setCaptchaValue}
              />
            </div>
            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-[13px] rounded-lg text-[16px] sm:text-[17px] font-bold transition-all duration-200 tracking-wider border-none ${
                loading
                  ? "bg-[#e0dfea] text-[#a259f7] cursor-not-allowed"
                  : "bg-[#a259f7] text-white cursor-pointer"
              }`}
            >
              {loading ? "Verifying ..." : "Verify"}
            </button>
            {/* Signup Link */}
            <div className="text-[14px] sm:text-[15px] text-[#4b5563] text-center">
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
      </div>

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-[98vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowPricingModal(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors duration-200"
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
            <div className="p-4 sm:p-8">
              <PricingComponent
                onPlanSelect={(planName) => {
                  router.push("/auth/signup");
                  setShowPricingModal(false);
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
