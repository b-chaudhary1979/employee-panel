import React, { useState } from 'react';

function ModalNotification({ message, type, show }) {
  if (!show) return null;
  return (
    <div
      className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-xl text-lg font-semibold transition-all duration-300 animate-slideDown ${
        type === "success"
          ? "bg-green-500 text-white"
          : "bg-red-500 text-white"
      }`}
    >
      {message}
    </div>
  );
}

function BackButton({ onClick, className = "" }) {
  return (
    <button
      className={`flex items-center gap-2 px-5 py-2 bg-[#f8f6ff] hover:bg-[#ede9fe] text-[#a259f7] font-bold text-lg rounded-full shadow-lg border-2 border-[#a259f7] transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#a259f7]/50 ${className}`}
      onClick={onClick}
      aria-label="Back"
      type="button"
    >
      <span className="text-2xl">&#8592;</span>
      <span>Back</span>
    </button>
  );
}

export function SecurityModal({ open, onClose, onSubmit }) {
  const [accessKey, setAccessKey] = useState('');
  const [notif, setNotif] = useState({ show: false, message: '', type: 'error' });
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #fff 60%, #f8f6ff 100%)',
        borderRadius: 24,
        boxShadow: '0 12px 48px 0 rgba(162,89,247,0.15)',
        padding: 40,
        width: '100%',
        maxWidth: 440,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1.5px solid #a259f733'
      }}>
       
        {notif.show && (
          <div style={{
            position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', padding: '10px 28px', borderRadius: 12, fontWeight: 600, fontSize: 18, color: '#fff', background: notif.type === 'success' ? '#22c55e' : '#ef4444', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}>{notif.message}</div>
        )}
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#a259f7', marginBottom: 24, letterSpacing: '-1px' }}>Enter Access Key</h2>
        <input
          type='password'
          style={{ width: '100%', padding: 18, borderRadius: 14, border: '2px solid #a259f74d', fontSize: 20, marginBottom: 28, color: '#444', boxShadow: '0 1px 4px #a259f71a', outline: 'none' }}
          placeholder='Access Key'
          value={accessKey}
          onChange={e => setAccessKey(e.target.value)}
        />
        <button
          style={{ padding: '16px 40px', background: '#a259f7', color: '#fff', borderRadius: 14, fontWeight: 800, fontSize: 20, border: 'none', cursor: 'pointer', boxShadow: '0 2px 12px #a259f733', transition: 'background 0.2s' }}
          onClick={() => {
            if (!accessKey) {
              setNotif({ show: true, message: 'Access key required!', type: 'error' });
              setTimeout(() => setNotif({ show: false, message: '', type: 'error' }), 1800);
              return;
            }
            setNotif({ show: true, message: 'Access granted!', type: 'success' });
            setTimeout(() => {
              setNotif({ show: false, message: '', type: 'success' });
              onSubmit(accessKey);
            }, 1200);
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function AutoIntegration() {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const scriptCode = `import React, { useState } from 'react';\n\nexport function SecurityModal({ open, onClose, onSubmit }) {\n  const [accessKey, setAccessKey] = useState('');\n  const [notif, setNotif] = useState({ show: false, message: '', type: 'error' });\n  if (!open) return null;\n  return (\n    <div style={{\n      position: 'fixed',\n      inset: 0,\n      zIndex: 9999,\n      display: 'flex',\n      alignItems: 'center',\n      justifyContent: 'center',\n      background: 'rgba(0,0,0,0.4)',\n      backdropFilter: 'blur(4px)'\n    }}>\n      <div style={{\n        background: 'linear-gradient(135deg, #fff 60%, #f8f6ff 100%)',\n        borderRadius: 24,\n        boxShadow: '0 12px 48px 0 rgba(162,89,247,0.15)',\n        padding: 40,\n        width: '100%',\n        maxWidth: 440,\n        position: 'relative',\n        display: 'flex',\n        flexDirection: 'column',\n        alignItems: 'center',\n        border: '1.5px solid #a259f733'\n      }}>\n        <button\n          style={{ position: 'absolute', top: 18, left: 24, fontSize: 20, color: '#a259f7', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}\n          onClick={onClose}\n          aria-label='Back'\n        >\n          <span style={{ fontSize: 24, marginRight: 6 }}>&#8592;</span> Back\n        </button>\n        {notif.show && (\n          <div style={{\n            position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', padding: '10px 28px', borderRadius: 12, fontWeight: 600, fontSize: 18, color: '#fff', background: notif.type === 'success' ? '#22c55e' : '#ef4444', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'\n          }}>{notif.message}</div>\n        )\n        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#a259f7', marginBottom: 24, letterSpacing: '-1px' }}>Enter Access Key</h2>\n        <input\n          type='password'\n          style={{ width: '100%', padding: 18, borderRadius: 14, border: '2px solid #a259f74d', fontSize: 20, marginBottom: 28, color: '#444', boxShadow: '0 1px 4px #a259f71a', outline: 'none' }}\n          placeholder='Access Key'\n          value={accessKey}\n          onChange={e => setAccessKey(e.target.value)}\n        />\n        <button\n          style={{ padding: '16px 40px', background: '#a259f7', color: '#fff', borderRadius: 14, fontWeight: 800, fontSize: 20, border: 'none', cursor: 'pointer', boxShadow: '0 2px 12px #a259f733', transition: 'background 0.2s' }}\n          onClick={() => {\n            if (!accessKey) {\n              setNotif({ show: true, message: 'Access key required!', type: 'error' });\n              setTimeout(() => setNotif({ show: false, message: '', type: 'error' }), 1800);\n              return;\n            }\n            setNotif({ show: true, message: 'Access granted!', type: 'success' });\n            setTimeout(() => {\n              setNotif({ show: false, message: '', type: 'success' });\n              onSubmit(accessKey);\n            }, 1200);\n          }}\n        >\n          Submit\n        </button>\n      </div>\n    </div>\n  );\n}\n`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="w-full min-h-[70vh] flex flex-col gap-8 sm:gap-12 px-2 sm:px-8 py-8 sm:py-12 bg-gradient-to-br from-[#f8f6ff] via-[#f3f4f6] to-[#e9e4fa] relative">
      {/* Sticky/Floating Back Button */}
      <div className="fixed top-4 left-2 sm:top-6 sm:left-6 z-40">
        <BackButton onClick={() => window.history.back()} className="bg-[#f8f6ff] text-[#a259f7] border-2 border-[#a259f7] shadow hover:bg-[#ede9fe]" />
      </div>
      <header className="mb-4 sm:mb-6 mt-2 px-1">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#a259f7] mb-2 sm:mb-3 tracking-tight drop-shadow-sm">Auto Integration</h1>
        <p className="text-lg sm:text-2xl md:text-3xl text-gray-600 font-medium max-w-3xl">Integrate your product automatically by copying the script below. This script includes a security modal for access key entry, which you can use anywhere in your codebase.</p>
      </header>
      <section className="flex flex-col gap-8 sm:gap-10 w-full max-w-5xl mx-auto">
        <div className="rounded-2xl border-2 border-[#a259f7]/20 bg-white/80 shadow-xl p-4 sm:p-8 mb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">Integration Script</h2>
          <p className="text-gray-600 mb-2 sm:mb-3">Copy and paste this React component into your codebase. Use the <code className="bg-[#f8f6ff] px-2 py-1 rounded text-[#a259f7] font-semibold">SecurityModal</code> wherever you want the security layer to appear.</p>
          <div className="bg-[#23272f] text-white rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-base overflow-x-auto select-all mb-2 sm:mb-3 border border-[#a259f7]/10 relative">
            <pre>{scriptCode}</pre>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
            <button
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#a259f7] shadow ${copied ? 'bg-green-500 text-white' : 'bg-[#a259f7] text-white hover:bg-[#7c3aed]'}`}
              onClick={handleCopy}
              aria-label="Copy integration script"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2"/></svg>
              {copied ? 'Copied!' : 'Copy Script'}
            </button>
            <button className="px-4 py-2 sm:px-6 sm:py-3 bg-[#f3f4f6] hover:bg-[#ede9fe] text-[#a259f7] font-semibold rounded-lg text-sm sm:text-lg border border-[#a259f7] transition" onClick={() => setShowPreview(true)}>
              Preview Security Modal
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 sm:pt-10 flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
          <div className="flex-1 flex flex-col gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">Need Help?</h2>
            <p className="text-gray-600">Check our <a href="#" className="text-[#a259f7] underline">integration docs</a> or <a href="#" className="text-[#a259f7] underline">contact support</a> for assistance.</p>
          </div>
        </div>
      </section>
      <SecurityModal open={showPreview} onClose={() => setShowPreview(false)} onSubmit={() => setShowPreview(false)} />
    </div>
  );
}

export default AutoIntegration;
