import React, { useState } from "react";

const INTEGRATION_SCRIPT = `<script>(function () {
  var ACCESS_KEY = 'DEMO-ACCESS-KEY'; // Change this to your actual key

  function createModal() {
    if (document.getElementById('cyberclipper-access-modal')) return;

    // Create the modal container
    var modal = document.createElement('div');
    modal.id = 'cyberclipper-access-modal';
    modal.innerHTML = '
      <div style="
        position:fixed;
        top:0; left:0;
        width:100vw; height:100vh;
        backdrop-filter: blur(8px);
        background: rgba(255, 255, 255, 0.1);
        z-index:9999;
        display:flex;
        align-items:center;
        justify-content:center;
        transition: all 0.3s ease-in-out;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(20px);
          padding: 2rem 2.5rem;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          min-width: 320px;
          max-width: 90vw;
          text-align: center;
          animation: fadeIn 0.5s ease-out;
        ">
          <h2 style=\"color:#28BD78;font-size:1.75rem;font-weight:700;margin-bottom:1rem;\">🔒 Enter Access Key</h2>
          <input id=\"cyberclipper-access-input\" type=\"text\" placeholder=\"Access Key\"
            style=\"
              padding: 0.75rem 1rem;
              border: 1px solid #ccc;
              border-radius: 8px;
              width: 85%;
              margin-bottom: 1rem;
              font-size: 1rem;
              color: #4B5563;
              background: rgba(255,255,255,0.8);
              backdrop-filter: blur(8px);
              transition: border 0.2s;
            \"
          />
          <br/>
          <button id=\"cyberclipper-access-btn\"
            style=\"
              background: #28BD78;
              color: white;
              padding: 0.6rem 1.8rem;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              cursor: pointer;
              font-weight: 600;
              box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
              transition: all 0.2s ease-in-out;
            \"
          >Submit</button>
          <div id=\"cyberclipper-access-msg\"
            style=\"margin-top:1rem;font-size:1rem;font-weight:500;transition: all 0.3s;\"
          ></div>
        </div>
      </div>
    ';

    document.body.appendChild(modal);

    // Style placeholder
    const style = document.createElement('style');
    style.innerHTML = '
      #cyberclipper-access-input::placeholder {
        color: #6B7280;
        opacity: 1;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    ';
    document.head.appendChild(style);

    // Access button logic
    document.getElementById('cyberclipper-access-btn').onclick = function () {
      var val = document.getElementById('cyberclipper-access-input').value;
      var msg = document.getElementById('cyberclipper-access-msg');

      if (val === ACCESS_KEY) {
        msg.textContent = '✅ Access Granted';
        msg.style.color = '#16a34a';
        msg.style.background = '#dcfce7';
        msg.style.borderRadius = '6px';
        msg.style.padding = '0.5rem';
        setTimeout(function() {
          document.getElementById('cyberclipper-access-modal').remove();
        }, 1500);
      } else {
        msg.textContent = '❌ Access Denied';
        msg.style.color = '#dc2626';
        msg.style.background = '#fee2e2';
        msg.style.borderRadius = '6px';
        msg.style.padding = '0.5rem';
      }
    };
  }

  window.addEventListener('DOMContentLoaded', createModal);
})();<\/script>`;


const AutoIntegration = ({ sharedFormData, updateSharedFormData, clearFormData }) => {
  const [showPreview, setShowPreview] = useState(false);
  const ACCESS_KEY = 'DEMO-ACCESS-KEY';
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [msgColor, setMsgColor] = useState("");
  const [copied, setCopied] = useState(false);

  const handlePreview = () => {
    setShowPreview(true);
    setInput("");
    setMsg("");
    setMsgColor("");
  };

  const handleSubmit = () => {
    if (input === ACCESS_KEY) {
      setMsg("Access Granted");
      setMsgColor("#16a34a");
    } else {
      setMsg("Access Not Found");
      setMsgColor("#dc2626");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INTEGRATION_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      
      const textarea = document.createElement('textarea');
      textarea.value = INTEGRATION_SCRIPT;
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold text-[#28BD78] mb-4">Auto Integration</h2>
      <p className="text-lg text-gray-700 mb-2">
        Easily connect your product with our platform using automatic integration. This method is fast, secure, and requires minimal setup.
      </p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li>One-click integration with popular platforms</li>
        <li>Automatic syncing of product data</li>
        <li>Real-time updates and monitoring</li>
      </ul>
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <label className="block text-green-400 font-semibold mr-2">Integration Script:</label>
          <button
            onClick={handleCopy}
            className="relative flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-200 hover:bg-gray-300 transition focus:outline-none"
            style={{minWidth: '32px', minHeight: '28px'}}
            aria-label="Copy script"
          >
            {copied ? (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="10" fill="#16a34a"/>
                <path d="M6 10.5L9 13.5L14 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="5" width="10" height="12" rx="2" fill="#28BD78"/>
                <rect x="7" y="3" width="8" height="12" rx="2" fill="#a78bfa"/>
              </svg>
            )}
          </button>
        </div>
        <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto select-all text-gray-800" style={{whiteSpace:'pre-wrap'}}>
          {INTEGRATION_SCRIPT}
        </pre>
      </div>
      <button
        className="bg-[#28BD78] text-white px-4 py-2 rounded hover:bg-[#5b21b6] transition mb-2"
        onClick={handlePreview}
      >
        Preview Modal
      </button>
      <button
        className="bg-[#28BD78] text-white px-4 ml-6 py-2 rounded hover:bg-[#5b21b6] transition mb-2"
        onClick={handleCopy}
      >
        {copied ? (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline',verticalAlign:'middle'}}>
            <circle cx="10" cy="10" r="10" fill="#16a34a"/>
            <path d="M6 10.5L9 13.5L14 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          'Copy code'
        )}
      </button>
      {showPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backdropFilter: 'blur(8px)',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease-in-out',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(20px)',
            padding: '2rem 2.5rem',
            borderRadius: 20,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            minWidth: 320,
            maxWidth: '90vw',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-out',
            position: 'relative',
          }}>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
              #cyberclipper-access-input-preview::placeholder {
                color: #6B7280 !important;
                opacity: 1;
              }
            `}</style>
            <button onClick={()=>setShowPreview(false)} style={{position:'absolute',top:10,right:10,fontSize:'1.2rem',background:'none',border:'none',cursor:'pointer'}}>&times;</button>
            <h2 style={{color:'#28BD78',fontSize:'1.75rem',fontWeight:700,marginBottom:'1rem'}}>🔒 Enter Access Key</h2>
            <input
              id="cyberclipper-access-input-preview"
              type="text"
              placeholder="Access Key"
              value={input}
              onChange={e=>setInput(e.target.value)}
              style={{
                padding:'0.75rem 1rem',
                border:'1px solid #ccc',
                borderRadius:8,
                width:'85%',
                marginBottom:'1rem',
                fontSize:'1rem',
                color:'#4B5563',
                background:'rgba(255,255,255,0.8)',
                backdropFilter:'blur(8px)',
                transition:'border 0.2s',
              }}
            />
            <br/>
            <button
              onClick={handleSubmit}
              style={{
                background:'#28BD78',
                color:'#fff',
                padding:'0.6rem 1.8rem',
                border:'none',
                borderRadius:8,
                fontSize:'1rem',
                cursor:'pointer',
                fontWeight:600,
                boxShadow:'0 4px 12px rgba(124, 58, 237, 0.4)',
                transition:'all 0.2s ease-in-out',
              }}
            >
              Submit
            </button>
            <div style={{
              marginTop:'1rem',
              fontSize:'1rem',
              fontWeight:500,
              color:msgColor,
              background: msg ? (msgColor === '#16a34a' ? '#dcfce7' : '#fee2e2') : undefined,
              borderRadius: msg ? 6 : undefined,
              padding: msg ? '0.5rem' : undefined,
              transition:'all 0.3s',
            }}>{msg}</div>
          </div>
        </div>
      )}
      {/* Instructions Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-500 mb-2">How to Use</h3>
        <ul className="list-decimal pl-6 space-y-2 text-gray-400 text-base">
          <li>Add the above integration script to your website's <span className="font-semibold">&lt;head&gt;</span> or just before the closing <span className="font-semibold">&lt;/body&gt;</span> tag.</li>
          <li>This script adds a security layer by requiring an access key before allowing access to protected content or features.</li>
          <li>No one can proceed without entering the correct access key, keeping your product or page secure from unauthorized users.</li>
          <li>You can customize the <span className="font-semibold">ACCESS_KEY</span> in the script to your own secret key for enhanced security.</li>
          <li>The modal is user-friendly, visually appealing, and easy to integrate—no extra dependencies required.</li>
        </ul>
      </div>
    </div>
  );
};

export default AutoIntegration;

