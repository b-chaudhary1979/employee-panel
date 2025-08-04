import React, { useState } from "react";
import RegisterEmployeeForm from "../components/RegisterEmployeeForm";
import useStoreEmployees from "../hooks/useStoreEmployees";
import { useRouter } from "next/router";
import BgAnimation from "../components/bg-animation";

export default function RegisterEmployeePage() {
  const router = useRouter();
  // Get cid from query param or allow manual entry for demo
  const [cidInput, setCidInput] = useState("");
  const cid = router.query.cid || cidInput;
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState("");
  const { addEmployee, loading, error } = useStoreEmployees(cid);

  const handleSubmit = async (form, customQA) => {
    if (!cid) {
      setShowError("Please provide a company ID (cid)");
      return;
    }
    try {
      await addEmployee({ ...form, customQA, companyId: cid }); // <-- Add companyId here
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1200);
    } catch (err) {
      setShowError(err.message || "Failed to register employee");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-8 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <BgAnimation />
      </div>
      <div className="w-full max-w-2xl z-10 relative">
        <h1 className="text-3xl md:text-4xl font-bold text-purple-500 mb-6 text-center">Employee Registration Portal - Admin Panel</h1>
        {/* CID input if not provided in query */}
        {!router.query.cid && (
          <div className="mb-4 flex flex-col items-center">
            <label className="mb-1 text-gray-700 font-semibold">Company ID (cid):</label>
            <input
              type="text"
              value={cidInput}
              onChange={e => setCidInput(e.target.value)}
              className="border rounded px-3 py-2 text-gray-800 w-64"
              placeholder="Enter company ID"
            />
          </div>
        )}
        {showSuccess && (
          <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded text-center font-semibold">Employee registered successfully!</div>
        )}
        {showError && (
          <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded text-center font-semibold">{showError}</div>
        )}
        <RegisterEmployeeForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}