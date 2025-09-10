import React, { useState } from "react";
import RegisterInternForm from "../components/RegisterInternForm";
import useStoreInterns from "../hooks/useStoreInterns";
import { useRouter } from "next/router";
import BgAnimation from "../components/bg-animation";
import { useAuth } from "../context/AuthContext";

export default function RegisterInternPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  // Get companyId from secure auth context instead of URL
  const companyId = user?.companyId;

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState("");
  const { addIntern, loading: internLoading, error } = useStoreInterns(companyId);

  const handleSubmit = async (form, customQA) => {
    if (!companyId) {
      setShowError("Company ID not found. Please ensure you are logged in.");
      return;
    }
    try {
      const panelType = user?.role === "employee" ? "employee" : "admin";
      
      // Prepare employee info for email notification
      const employeeInfo = {
        email: user?.email,
        name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
      };
      
      await addIntern({ ...form, customQA, panelType }, employeeInfo);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1200);
    } catch (err) {
      setShowError(err.message || "Failed to register intern");
    }
  };

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (!isAuthenticated || !companyId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to register interns.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-8 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <BgAnimation />
      </div>
      <div className="w-full max-w-2xl z-10 relative">
        <h1 className="text-3xl md:text-4xl font-bold text-green-500 mb-6 text-center">Intern Registration Portal</h1>
        {showSuccess && (
          <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded text-center font-semibold">Intern registered successfully!</div>
        )}
        {showError && (
          <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded text-center font-semibold">{showError}</div>
        )}
        <RegisterInternForm onSubmit={handleSubmit} isEmployeePanel={user?.role === "employee"} />
      </div>
    </div>
  );
}