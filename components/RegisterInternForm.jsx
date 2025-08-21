import React, { useState, useEffect, useRef } from "react";
import UploadDocuments from "./uploaddocuments";
import { useRouter } from "next/router";
import Loader from "../loader/Loader";

export default function RegisterInternForm({ onSubmit, initialData, isEmployeePanel }) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    department: "",
    role: "",
    internId: "",
    dateJoined: " ",
    duration: " ", // in months
    dateOfEnd: " ",
    photo: null, // will be base64 string
    company: "",
    
  });
  const [customQA, setCustomQA] = useState([{ question: "", answer: "" }]);
  const [internIdEditable, setInternIdEditable] = useState(false);
  const [lastClicked, setLastClicked] = useState(""); // "manual" or "generate"
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoFileName, setPhotoFileName] = useState("");
  const [documents, setDocuments] = useState([{ name: "", data: "" }]);
  const fileInputRef = useRef();
  const docInputRefs = useRef([]);
  const [slide, setSlide] = useState(1); // 1 = form, 2 = upload documents
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    color: "red",
  });

  useEffect(() => {
    if (initialData) {
      setForm({ ...form, ...initialData });
      setCustomQA(initialData.customQA || [{ question: "", answer: "" }]);
    }
    // eslint-disable-next-line
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && name === "photo") {
      e.preventDefault(); // Prevent accidental form submission
      if (files && files.length > 0) {
        const file = files[0];
        
        // Check file size (500 KB = 500 * 1024 bytes)
        const maxSize = 500 * 1024; // 500 KB in bytes
        if (file.size > maxSize) {
          // Show error notification
          setNotification({ 
            show: true, 
            message: "Image size must be 500 KB or less", 
            color: "red" 
          });
          setTimeout(() => setNotification({ show: false, message: "", color: "red" }), 2000);
          
          // Clear the file input
          e.target.value = "";
          setForm((prev) => ({ ...prev, photo: null }));
          setPhotoFileName("");
          return;
        }
        
        setLoading(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
          setForm((prev) => ({ ...prev, photo: ev.target.result }));
          setPhotoFileName(file.name);
          setLoading(false);
        };
        reader.readAsDataURL(file);
      } else {
        setForm((prev) => ({ ...prev, photo: null }));
        setPhotoFileName("");
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const handleDOJChange = (e) => {
    const { name, value } = e.target;

    // Update state
    setForm(prev => {
      const updated = { ...prev, [name]: value };

      // If dateJoined and duration are available, calculate dateOfEnd
      if ((name === "dateJoined" || name === "duration") && updated.dateJoined && updated.duration) {
        const startDate = new Date(updated.dateJoined);
        const monthsToAdd = parseInt(updated.duration, 10);
        if (!isNaN(monthsToAdd)) {
          const endDate = new Date(startDate.setMonth(startDate.getMonth() + monthsToAdd));
          updated.dateOfEnd = endDate.toISOString().split('T')[0]; // format to yyyy-mm-dd
        }
      }

      return updated;
    });
  };

  // Handle document upload
  const handleDocumentChange = (idx, e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // Check file size (500 KB = 500 * 1024 bytes)
    const maxSize = 500 * 1024; // 500 KB in bytes
    if (file.size > maxSize) {
      // Show error notification
      setNotification({ 
        show: true, 
        message: `Document "${file.name}" size must be 500 KB or less`, 
        color: "red" 
      });
      setTimeout(() => setNotification({ show: false, message: "", color: "red" }), 3000);
      
      // Clear the file input
      e.target.value = "";
      setDocuments((prev) => {
        const updated = [...prev];
        updated[idx] = { name: "", data: "" };
        return updated;
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDocuments((prev) => {
        const updated = [...prev];
        updated[idx] = { name: file.name, data: ev.target.result };
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  // Add new document input
  const addDocumentInput = () => {
    setDocuments((prev) => [...prev, { name: "", data: "" }]);
  };

  const handleCustomQAChange = (idx, field, value) => {
    setCustomQA((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const addCustomQA = () => {
    setCustomQA((prev) => [...prev, { question: "", answer: "" }]);
  };

  // Generate SHA-256 hash and return first 4 characters
  const generateSHA256Hash = async (data) => {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex.substring(0, 4).toUpperCase();
    } catch (error) {
      return '0000';
    }
  };

  // Convert date to DDMMYY format
  const formatDateToDDMMYY = (dateString) => {
    if (!dateString) return '000000';
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      return `${day}${month}${year}`;
    } catch (error) {
      return '000000';
    }
  };

  // Helper to generate intern ID
  const generateInternId = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.dob || !form.department) {
      return;
    }
    
    // Get department code (first 3 letters of department)
    const deptCode = (form.department.replace(/[^a-zA-Z]/g, "").toUpperCase() + "XXX").slice(0, 3);
    
    // Format date as DDMMYY (using dateJoined if available, otherwise dob)
    const joinDate = form.dateJoined || form.dob || "";
    const dateCode = formatDateToDDMMYY(joinDate);
    
    // Generate SHA-256 hash of firstName + lastName + email + phone + dob
    const hashData = `${form.firstName}${form.lastName}${form.email}${form.phone}${form.dob}`;
    const hashCode = await generateSHA256Hash(hashData);
    
    const internId = `IID-${deptCode}-${dateCode}-${hashCode}`;
    setForm((prev) => ({ ...prev, internId }));
    setInternIdEditable(false);
  };

  // Handler for first form submit
  const handleFirstFormSubmit = (e) => {
    e.preventDefault();
    if (validateSlide1()) {
      setFormError("");
      setSlide(2);
    } else {
      setFormError("Please fill all required fields before proceeding.");
    }
  };

  // Handler for second form submit (final submit)
  const handleSecondFormSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      setLoading(true);
      try {
        const payload = {
          ...form,
          photo: form.photo || null,
          documents,
          panelType: isEmployeePanel ? 'employee' : 'admin',
        };
        await onSubmit(payload, customQA);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } catch (error) {
        // Error handling is done in the parent component
      } finally {
        setLoading(false);
      }
    }
  };

  // Validation for required fields on slide 1
  const validateSlide1 = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.dob || !form.address || !form.city || !form.state || !form.country || !form.company || !form.zip || !form.department || !form.role || !form.internId || !form.dateJoined) {
      return false;
    }
    return true;
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
          <Loader />
          <div className="mt-4 text-white text-xl font-semibold">
            Registering Intern...
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all animate-fade-in-out">
          Intern registered successfully!
        </div>
      )}
      {notification.show && (
        <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${notification.color === 'green' ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-pink-500'} text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown`}>
          {notification.color === 'green' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {notification.message}
        </div>
      )}
      {/* Timeline/Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg border-2 ${slide === 1 ? 'bg-green-500 text-white border-green-500 shadow-lg' : 'bg-white text-green-500 border-green-300'}`}>1</div>
          <span className={`mt-2 text-sm font-semibold ${slide === 1 ? 'text-green-600' : 'text-gray-400'}`}>Intern Details</span>
        </div>
        {/* Line */}
        <div className={`w-16 h-1 mx-2 md:mx-4 rounded-full ${slide === 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg border-2 ${slide === 2 ? 'bg-green-500 text-white border-green-500 shadow-lg' : 'bg-white text-green-500 border-green-300'}`}>2</div>
          <span className={`mt-2 text-sm font-semibold ${slide === 2 ? 'text-green-600' : 'text-gray-400'}`}>Upload Documents</span>
        </div>
      </div>
      {slide === 1 && (
        <form className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-4 text-gray-800 border-2 border-green-500" onSubmit={handleFirstFormSubmit} autoComplete="off" aria-autocomplete="none">
          <h1 className="text-3xl md:text-5xl font-bold text-green-500 mb-6 text-center">Register Intern</h1>
          <p className="text-center text-gray-500 text-base md:text-lg mb-8">Fill in the details below to register a new intern.</p>
          {formError && (
            <div className="mb-4 text-red-600 font-semibold text-center">{formError}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name <span className='text-red-600'>*</span></label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="First Name" autoComplete="nope-firstName" spellCheck={false} aria-autocomplete="none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name <span className='text-red-600'>*</span></label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Last Name" autoComplete="nope-lastName" spellCheck={false} aria-autocomplete="none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email <span className='text-red-600'>*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Email" autoComplete="nope-email" spellCheck={false} aria-autocomplete="none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone <span className='text-red-600'>*</span></label>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Phone" autoComplete="nope-phone" spellCheck={false} aria-autocomplete="none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth <span className='text-red-600'>*</span></label>
              <input name="dob" type="date" value={form.dob} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Date of Birth" autoComplete="nope-dob" spellCheck={false} aria-autocomplete="none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded px-3 py-2 text-gray-800" autoComplete="nope-gender" spellCheck={false} aria-autocomplete="none">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address <span className='text-red-600'>*</span></label>
              <input name="address" value={form.address} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Address" autoComplete="nope-address" spellCheck={false} aria-autocomplete="none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City <span className='text-red-600'>*</span></label>
              <input name="city" value={form.city} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="City" autoComplete="nope-city" spellCheck={false} aria-autocomplete="none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State <span className='text-red-600'>*</span></label>
              <input name="state" value={form.state} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="State" autoComplete="nope-state" spellCheck={false} aria-autocomplete="none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country <span className='text-red-600'>*</span></label>
              <input name="country" value={form.country} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Country" autoComplete="nope-country" spellCheck={false} aria-autocomplete="none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Name <span className='text-red-600'>*</span></label>
              <input name="company" value={form.company || ""} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Company Name" autoComplete="nope-company" spellCheck={false} aria-autocomplete="none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ZIP Code <span className='text-red-600'>*</span></label>
              <input name="zip" value={form.zip} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="ZIP Code" autoComplete="nope-zip" spellCheck={false} aria-autocomplete="none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department <span className='text-red-600'>*</span></label>
              <input name="department" value={form.department} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Department" autoComplete="nope-department" spellCheck={false} aria-autocomplete="none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role <span className='text-red-600'>*</span></label>
              <input name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Role" autoComplete="nope-role" spellCheck={false} aria-autocomplete="none" />
            </div>
            <div>
        <label className="block text-sm font-medium mb-1">
          Date Joined <span className='text-red-600'>*</span>
        </label>
        <input
          name="dateJoined"
          type="date"
          value={form.dateJoined}
          onChange={handleDOJChange}
          className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800"
          required
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Duration (in months) <span className='text-red-600'>*</span>
        </label>
        <input
          name="duration"
          type="number"
          min="1"
          value={form.duration}
          onChange={handleDOJChange}
          className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800"
          required
          placeholder="Enter duration in months"
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Date of End <span className='text-red-600'>*</span>
        </label>
        <input
          name="dateOfEnd"
          type="date"
          value={form.dateOfEnd}
          readOnly
          className="w-full border rounded px-3 py-2 text-gray-800"
        />
      </div>
             <div>
               <label className="text-sm font-medium mb-1 flex items-center gap-1">
                 Intern ID <span className='text-red-600'>*</span>
                 <span className="relative group">
                   <button type="button" className=" focus:outline-none">
                     {/* Modern info icon: purple circle with white bold 'i', drop shadow */}
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                       <circle cx="12" cy="12" r="10" fill="#a259f7" filter="url(#shadow)" />
                       <text x="12" y="17" textAnchor="middle" fontSize="16" fill="white" fontFamily="Arial" fontWeight="bold">i</text>
                       <defs>
                         <filter id="shadow" x="0" y="0" width="24" height="24">
                           <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.18"/>
                         </filter>
                       </defs>
                     </svg>
                   </button>
                   <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 min-w-[280px] max-w-xs bg-black text-white text-xs rounded-xl px-4 py-3 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none space-y-2 border border-gray-700">
                     <div className="font-semibold text-base text-blue-200 mb-1">How Intern ID is generated</div>
                     <div><span className="font-semibold">Format:</span> IID-&lt;DEPT&gt;-&lt;DDMMYY&gt;-&lt;HASH&gt;</div>
                     <ul className="list-disc list-inside space-y-1 pl-2">
                       <li><b>IID</b>: Intern prefix</li>
                       <li><b>&lt;DEPT&gt;</b>: First 3 letters of department</li>
                       <li><b>&lt;DDMMYY&gt;</b>: Date joined (day, month, year)</li>
                       <li><b>&lt;HASH&gt;</b>: First 4 chars of SHA-256 hash</li>
                     </ul>
                     <div className="mt-2"><span className="font-semibold">Example:</span> <span className="font-mono bg-gray-800 px-2 py-1 rounded">IID-ADM-110825-7C2A</span></div>
                   </div>
                 </span>
               </label>
               {form.internId && (
                 <div className="mb-1 flex items-center gap-2">
                   <span className="text-red-600 font-bold">{form.internId}</span>
                   <button
                     type="button"
                     className="p-1 text-gray-400 hover:text-gray-700 focus:outline-none"
                     title={copied ? 'Copied!' : 'Copy'}
                     onClick={() => {
                       navigator.clipboard.writeText(form.internId);
                       setCopied(true);
                       setTimeout(() => setCopied(false), 1200);
                     }}
                   >
                     {copied ? (
                       <span className="text-green-600 text-xs font-semibold">Copied!</span>
                     ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                         <rect x="9" y="9" width="13" height="13" rx="2" className="stroke-current"/>
                         <rect x="3" y="3" width="13" height="13" rx="2" className="stroke-current"/>
                       </svg>
                     )}
                   </button>
                 </div>
               )}
               <div className="flex gap-2 items-center">
                 <input
                   name="internId"
                   value={form.internId}
                   onChange={handleChange}
                   className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800"
                   required
                   placeholder="Intern ID"
                   disabled={!internIdEditable}
                   onFocus={() => setInternIdEditable(true)}
                   autoComplete="nope-internId"
                   spellCheck={false}
                   aria-autocomplete="none"
                 />
                 <button
                   type="button"
                   className={`px-2 py-1 rounded text-xs font-semibold border transition-colors ${lastClicked === 'generate' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'}`}
                   onClick={async () => { await generateInternId(); setLastClicked('generate'); }}
                 >
                   Generate
                 </button>
                 <button
                   type="button"
                   className={`px-2 py-1 rounded text-xs font-semibold border transition-colors ${lastClicked === 'manual' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'}`}
                   onClick={() => { setInternIdEditable(true); setLastClicked('manual'); }}
                 >
                   Manual
                 </button>
               </div>
             </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Custom Questions & Answers</h3>
            {customQA.map((qa, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Question"
                  value={qa.question}
                  onChange={e => handleCustomQAChange(idx, "question", e.target.value)}
                  className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800"
                />
                <input
                  type="text"
                  placeholder="Answer"
                  value={qa.answer}
                  onChange={e => handleCustomQAChange(idx, "answer", e.target.value)}
                  className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800"
                />
              </div>
            ))}
            <button type="button" onClick={addCustomQA} className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Add Custom Q&A</button>
          </div>
          <div className="flex justify-between mt-6">
            <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-xl" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl">
              Next
            </button>
          </div>
        </form>
      )}
      {slide === 2 && (
        <form className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-4 text-gray-800 border-2 border-green-500" onSubmit={handleSecondFormSubmit} autoComplete="off" aria-autocomplete="none">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Upload Documents & Photo</h2>
          {/* General file size limit notice */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <strong>Important:</strong> All uploaded files (photos and documents) must be 500 KB or less. Larger files will be automatically rejected.
              </div>
            </div>
          </div>
          <UploadDocuments
            photo={form.photo}
            photoFileName={photoFileName}
            onPhotoChange={handleChange}
            documents={documents}
            onDocumentChange={handleDocumentChange}
            addDocumentInput={addDocumentInput}
            fileInputRef={fileInputRef}
            docInputRefs={docInputRefs}
            loading={loading}
          />
          <div className="flex justify-between mt-6">
            <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-xl" onClick={() => router.back()}>
              Back
            </button>
            <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-xl" onClick={() => { setForm({ firstName: "", lastName: "", email: "", phone: "", dob: "", gender: "", address: "", city: "", state: "", country: "", zip: "", department: "", role: "", internId: "", dateJoined: "", photo: null, company: "" }); setCustomQA([{ question: "", answer: "" }]); setSlide(1); setFormError(""); }}>Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className={`font-bold py-2 px-6 rounded-xl flex items-center gap-2 ${
                loading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading ? 'Registering...' : 'Register Intern'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
