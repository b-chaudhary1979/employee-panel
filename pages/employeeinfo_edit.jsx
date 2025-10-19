import React, { useState, useEffect, useMemo } from "react";
import CryptoJS from "crypto-js";
import { useRouter } from "next/router";
import useStoreUserInfoEdit from "../hooks/useStoreUserInfoEdit";
import Loader from "../loader/Loader";

const ENCRYPTION_KEY = "cyberclipperSecretKey123!";
function decryptToken(token) {
  try {
    const bytes = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    const { ci, aid } = JSON.parse(decrypted);
    return { ci, aid };
  } catch {
    return { ci: null, aid: null };
  }
}

const DISPLAY_ORDER = [
  "id",
  "firstName",
  "lastName",
  "gender",
  "role",
  "department",
  "phone",
  "email",
  "photo",
  "customQA",
  "city",
  "dob",
  "address",
  "dateJoined",
  "employeeId",
  "state",
  "status",
  "company",
  "zip",
  "country",
  "documents"
];
const AdminInfoEdit = () => {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = useMemo(() => decryptToken(token), [token]);
  const [cid, setCid] = useState(ci || "");
  const [cidModalOpen, setCidModalOpen] = useState(!ci);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");
  const [editFields, setEditFields] = useState({});
  const [editing, setEditing] = useState({});

  const {
    user,
    setUser,
    loading,
    error,
    fetchUser,
    updateAllFields,
  } = useStoreUserInfoEdit(cid, aid);

  useEffect(() => {
    if (ci) {
      setCid(ci);
      setCidModalOpen(false);
    }
  }, [ci]);

  useEffect(() => {
    if (cid && aid) fetchUser();
  }, [cid, aid, fetchUser]);

  useEffect(() => {
    if (notifOpen) {
      const timer = setTimeout(() => setNotifOpen(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [notifOpen]);

  useEffect(() => {
    if (user) setEditFields(user);
  }, [user]);

  const handleFieldChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = async () => {
    await updateAllFields(editFields);
    setNotifMsg("All changes saved!");
    setNotifOpen(true);
    fetchUser();
  };

  const handleEditToggle = (field) => {
    setEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const NON_EDITABLE_FIELDS = [
    'id', 'uniqueId', 'companyId', 'companyName', 'plan', 'status', 'profilePhoto', 'employeeId', 'aid',
    'originalId',  'company', 'photo', 'dateJoined'
  ];

  const renderFields = () => {
    if (!editFields) return null;
    return DISPLAY_ORDER.filter(key => {
      const value = editFields[key];
      if ((key === 'customQA' || key === 'documents') && (!value || (Array.isArray(value) && value.length === 0))) {
        return false;
      }
      return key !== 'profilePhoto' && key !== 'updatedAt' && value !== undefined;
    }).map(key => {
      const value = editFields[key];
        const isNonEditable = NON_EDITABLE_FIELDS.includes(key);
        if (key === 'documents' && Array.isArray(value) && value.length > 0) {
          return (
            <div key={key} className="mb-6 w-full max-w-2xl">
              <label className="block text-black font-semibold mb-1 text-base capitalize tracking-wide">Documents</label>
              <div className="flex flex-col gap-2">
                {value.map((doc, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-[#f8f9fa]">
                    <div className="text-sm text-gray-700"><strong>Name:</strong> {doc.name || "-"}</div>
                    <div className="text-sm text-gray-700"><strong>Data:</strong> {doc.data || "-"}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (key === 'customQA' && Array.isArray(value) && value.length > 0) {
          return (
            <div key={key} className="mb-6 w-full max-w-2xl">
              <label className="block text-black font-semibold mb-1 text-base capitalize tracking-wide">Custom Q&A</label>
              <div className="flex flex-col gap-2">
                {value.map((qa, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-[#f8f9fa]">
                    <div className="text-sm text-gray-700"><strong>Question:</strong> {qa.question || "-"}</div>
                    <div className="text-sm text-gray-700"><strong>Answer:</strong> {qa.answer || "-"}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div key={key} className="mb-6 w-full max-w-2xl">
            <label className="block text-black font-semibold mb-1 text-base capitalize tracking-wide">{key.replace(/([A-Z])/g, ' $1')}</label>
            <div className="flex items-center gap-2">
              {isNonEditable ? (
                <input
                  type="text"
                  value={value || ""}
                  disabled
                  placeholder={`Enter ${key}`}
                  className="w-full py-2 px-3 rounded-lg border border-[#28BD78] bg-[#f8f9fa] text-black text-base outline-none cursor-not-allowed shadow-sm"
                  style={{ color: 'black' }}
                />
              ) : editing[key] ? (
                <input
                  type="text"
                  value={value || ""}
                  onChange={e => handleFieldChange(key, e.target.value)}
                  placeholder={`Enter ${key}`}
                  className="w-full py-2 px-3 rounded-lg border border-[#28BD78] bg-white text-black text-base outline-none shadow-sm"
                  style={{ color: 'black' }}
                  autoFocus
                />
              ) : (
                <input
                  type="text"
                  value={value || ""}
                  disabled
                  placeholder={`Enter ${key}`}
                  className="w-full py-2 px-3 rounded-lg border border-[#28BD78] bg-[#f8f9fa] text-black text-base outline-none cursor-pointer shadow-sm"
                  style={{ color: 'black' }}
                  onClick={() => handleEditToggle(key)}
                />
              )}
              {!isNonEditable && (
                <span onClick={() => handleEditToggle(key)} className="cursor-pointer ml-1">
                  {editing[key] ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#28BD78" className="w-5 h-5 inline hover:scale-125 transition-transform duration-150">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#28BD78" className="w-5 h-5 inline hover:scale-125 transition-transform duration-150">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.213l-4 1 1-4 13.362-13.726z" />
                    </svg>
                  )}
                </span>
              )}
            </div>
            {!isNonEditable && editing[key] && (
              <div className="text-xs text-[#28BD78] mt-1 ml-1">Type the new value and click the <span className="font-bold">tick</span> to save.</div>
            )}
          </div>
        );
      });
  };

  if (loading && !user) {
    return <div className="flex items-center justify-center min-h-screen w-full"><Loader /></div>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f5f6fa] py-0 px-0 font-sans relative">
      {/* Sticky Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 hover:bg-white/100 shadow text-[#28BD78] font-semibold text-lg transition-colors duration-150 border border-green-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#28BD78" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>
      </div>
      {notifOpen && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${notifOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="bg-gradient-to-r from-green-600 to-violet-600 text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            {notifMsg}
          </div>
        </div>
      )}
      {cidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative animate-fadeIn text-gray-500">
            <h3 className="text-2xl font-bold mb-6 text-[#28BD78] text-center">Enter User CID</h3>
            <input
              type="text"
              value={cid}
              onChange={e => setCid(e.target.value)}
              className="w-full py-3 px-4 rounded-lg border-2 border-[#28BD78] mb-6 focus:ring-2 focus:ring-[#28BD78] outline-none text-lg"
              autoFocus
              placeholder="Enter CID"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCidModalOpen(false)}
                disabled={!cid}
                className="px-5 py-2 rounded bg-gradient-to-r from-green-600 to-violet-600 text-white font-bold hover:from-green-700 hover:to-violet-700 shadow-md disabled:opacity-50"
              >
                Submit
              </button>
            </div>
            {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
          </div>
        </div>
      )}
      <div className="flex flex-col items-center w-full min-h-[70vh] pt-24 pb-12 px-4 animate-fadeIn md:flex-row md:items-start md:justify-center md:gap-8">
        {/* Main Form Section */}
        <div className="w-full max-w-4xl">
          <h2 className="text-4xl font-extrabold text-[#45CA8A] mb-10 tracking-tight w-full text-left max-w-6xl">Employee Info</h2>
          <form className="w-full max-w-6xl flex flex-col gap-6">
            {renderFields()}
            <button
              type="button"
              onClick={handleSaveAll}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-violet-600 text-white font-bold text-xl hover:from-green-700 hover:to-violet-700 transition-colors duration-200 mt-4 shadow-lg"
            >
              Save Changes
            </button>
          </form>
        </div>
        
        <div className="hidden md:flex md:flex-col md:justify-center md:items-center w-full max-w-sm ml-0 md:mr-12 mt-10 md:mt-10">
          <div className="rounded-3xl shadow-xl p-10 border-4 border-[#16a34a]/50 flex flex-col items-center w-full transition-all duration-300">
            <h3 className="text-3xl font-extrabold text-[#28BD78] mb-6 tracking-tight text-center">How to Edit</h3>
            <ul className="list-disc pl-6 text-gray-700 text-lg mb-8 w-full space-y-3">
              <li>Click the <span className="inline-block align-middle"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#28BD78" className="w-6 h-6 inline"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.213l-4 1 1-4 13.362-13.726z" /></svg></span> edit icon next to a field to enable editing.</li>
              <li>Type the new value in the input box.</li>
              <li>Click the <span className="inline-block align-middle"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#28BD78" className="w-6 h-6 inline"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span> tick icon to save the change.</li>
              <li>Click <span className="font-bold">Save Changes</span> at the bottom to save all edits.</li>
            </ul>
            <h4 className="text-xl font-semibold text-[#28BD78] mb-4 mt-2 text-center">Non-editable Sections</h4>
            <ul className="list-none w-full text-gray-700 text-lg space-y-3">
              <li className="flex items-center gap-3"><span className="inline-block"><svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2.5} stroke='#28BD78' className='w-6 h-6'><circle cx='12' cy='12' r='10' /></svg></span>ID</li>
              <li className="flex items-center gap-3"><span className="inline-block"><svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2.5} stroke='#28BD78' className='w-6 h-6'><circle cx='12' cy='12' r='10' /></svg></span>DATE OF JOINING</li>
              <li className="flex items-center gap-3"><span className="inline-block"><svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2.5} stroke='#28BD78' className='w-6 h-6'><circle cx='12' cy='12' r='10' /></svg></span>COMPANY ID</li>
              <li className="flex items-center gap-3"><span className="inline-block"><svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2.5} stroke='#28BD78' className='w-6 h-6'><circle cx='12' cy='12' r='10' /></svg></span>UNIQUE ID</li>
              <li className="flex items-center gap-3"><span className="inline-block"><svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2.5} stroke='#28BD78' className='w-6 h-6'><circle cx='12' cy='12' r='10' /></svg></span>STATUS</li>
            </ul>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s cubic-bezier(.4,0,.2,1); }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideDown { animation: slideDown 0.4s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
};

export default AdminInfoEdit;
