import React, { useState } from 'react';
import Link from 'next/link';

const steps = [1, 2, 3, 4];

const Step1 = ({ onChange, values }) => (
  <div className="flex flex-col gap-4">
    <label className="font-semibold text-[15px] text-[#22223b]">Full Name<span className="text-red-500 ml-1">*</span></label>
    <input
      type="text"
      name="name"
      value={values.name || ''}
      onChange={onChange}
      placeholder="Enter your full name"
      className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f9f9fc] outline-none"
      required
    />
    <label className="font-semibold text-[15px] text-[#22223b]">Email<span className="text-red-500 ml-1">*</span></label>
    <input
      type="email"
      name="email"
      value={values.email || ''}
      onChange={onChange}
      placeholder="Enter your email"
      className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f9f9fc] outline-none"
      required
    />
  </div>
);

const Step2 = ({ onChange, values }) => (
  <div className="flex flex-col gap-4">
    <label className="font-semibold text-[15px] text-[#22223b]">Phone Number<span className="text-red-500 ml-1">*</span></label>
    <input
      type="tel"
      name="phone"
      value={values.phone || ''}
      onChange={onChange}
      placeholder="Enter your phone number"
      className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f9f9fc] outline-none"
      required
    />
    <label className="font-semibold text-[15px] text-[#22223b]">Company Name<span className="text-red-500 ml-1">*</span></label>
    <input
      type="text"
      name="company"
      value={values.company || ''}
      onChange={onChange}
      placeholder="Enter your company name"
      className="w-full py-3 px-4 text-gray-500 rounded-lg border border-[#e0dfea] text-[15px] bg-[#f9f9fc] outline-none"
      required
    />
  </div>
);

const Step3 = ({ onChange, values }) => (
  <div className="flex flex-col gap-4">
    <label className="font-semibold text-[15px] text-[#22223b] mb-2">Choose a Plan<span className="text-red-500 ml-1">*</span></label>
    <div className="flex text-black flex-col gap-3">
      <label className="flex  items-center gap-2">
        <input
          type="radio"
          name="plan"
          value="Free"
          checked={values.plan === 'Free'}
          onChange={onChange}
          className="accent-[#a259f7]"
        />
        Free
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="plan"
          value="Pro"
          checked={values.plan === 'Pro'}
          onChange={onChange}
          className="accent-[#a259f7]"
        />
        Pro
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="plan"
          value="Enterprise"
          checked={values.plan === 'Enterprise'}
          onChange={onChange}
          className="accent-[#a259f7]"
        />
        Enterprise
      </label>
        </div>
        </div>
);

const Step4 = ({ values, agreed, onAgree }) => (
  <div className="flex flex-col gap-6">
    <div>
      <div className="font-semibold text-[15px] text-[#22223b] mb-2">Review your information:</div>
      <div className="text-[15px] text-[#4b5563]">
        <div><span className="font-bold">Name:</span> {values.name}</div>
        <div><span className="font-bold">Email:</span> {values.email}</div>
        <div><span className="font-bold">Phone:</span> {values.phone}</div>
        <div><span className="font-bold">Company:</span> {values.company}</div>
        <div><span className="font-bold">Plan:</span> {values.plan}</div>
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
      <Link href="/terms" className="text-[#a259f7] underline" target="_blank">Terms &amp; Conditions</Link>
      and
      <Link href="/privacy" className="text-[#a259f7] underline" target="_blank">Privacy Policy</Link>
    </label>
  </div>
);

const stepsContent = [Step1, Step2, Step3, Step4];

// Confetti burst from top edge of notification (left, center, right)
const confettiBurstCount = 24;
const confettiColors = [
  '#a259f7', '#22c55e', '#fbbf24', '#ef4444', '#3b82f6', '#f472b6', '#10b981', '#f59e42',
  '#6366f1', '#eab308', '#f43f5e', '#0ea5e9', '#a3e635', '#f87171', '#f472b6', '#fbbf24',
];
function makeBurst(cx, cy, angleStart, angleEnd) {
  return Array.from({ length: confettiBurstCount }).map((_, i) => {
    // Spread angles between angleStart and angleEnd (in radians)
    const angle = (angleStart + ((angleEnd - angleStart) * i) / (confettiBurstCount - 1)) * (Math.PI / 180);
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
        <svg className="confetti-svg" width="100vw" height="100vh" viewBox="0 0 1000 600" style={{position:'absolute',left:0,top:0,width:'100vw',height:'100vh'}}>
          {allConfetti.map((c, i) => (
            <circle
              key={i}
              className={`confetti confetti${i+1}`}
              cx={c.cx/220*1000}
              cy={c.cy/120*200}
              r={c.r}
              fill={c.color}
              style={{ animationDelay: `${c.delay}s` }}
            />
          ))}
        </svg>
      </div>
      <svg className="w-24 h-24 mb-6 animate-tick" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r="25" fill="#e6f9ec" />
        <path fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" d="M14 27l7 7 16-16" />
      </svg>
      <div className="text-3xl font-extrabold text-[#22c55e] mb-2">Successfully submitted</div>
    </div>
    <style jsx>{`
      @keyframes tick {
        0% { stroke-dasharray: 0, 40; }
        100% { stroke-dasharray: 40, 0; }
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
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      /* Confetti burst keyframes for all pieces, slower and smooth */
      ${allConfetti.map((c, i) => `@keyframes confetti${i+1} {
        0% { opacity: 0; transform: translate(0,0) scale(1); }
        10% { opacity: 1; }
        80% { opacity: 1; }
        100% { opacity: 0; transform: translate(${c.dx*4.5}px,${c.dy*3}px) scale(1.2) rotate(${Math.random() * 360}deg); }
      }`).join('\n')}
      .confetti-svg {
        position: absolute;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 50;
      }
      ${allConfetti.map((_, i) => `.confetti${i+1} { animation: confetti${i+1} 2.1s cubic-bezier(0.4,0,0.2,1) both; }`).join('\n')}
    `}</style>
  </div>
);

const Signup = () => {
  const [step, setStep] = useState(0);
  const [formValues, setFormValues] = useState({ plan: 'Free' });
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const StepComponent = stepsContent[step];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f5f0ff] font-manrope relative">
      {/* Heading and Subheading */}
      <div className="text-center mt-12 mb-6">
        <h1 className="text-[2.2rem] font-extrabold text-[#a259f7] mb-2">Create Your Account</h1>
        <p className="text-[#4b5563] text-[1.1rem] max-w-xl mx-auto">Sign up to get started with Cyber Clipper Admin Panel. Manage your company, employees, and products with ease.</p>
      </div>
      {/* Timeline */}
      <div className="flex items-center justify-center gap-6 mb-10 mt-2">
        {steps.map((s, idx) => (
          <React.Fragment key={s}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-lg font-bold transition-all duration-200 ${
              idx === step
                ? 'bg-[#a259f7] border-[#a259f7] text-white scale-110 shadow-lg breathe'
                : idx < step
                ? 'bg-[#e6f9ec] border-[#22c55e] text-[#22c55e]'
                : 'bg-white border-[#e0dfea] text-[#a259f7]'
            }`}>
              {s}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-16 h-1 rounded transition-all duration-200 ${
                idx < step ? 'bg-[#22c55e]' : 'bg-[#e0dfea]'
              }`}></div>
            )}
          </React.Fragment>
        ))}
          </div>
      {/* Form */}
      <form className="bg-white rounded-xl w-full max-w-lg p-10 flex flex-col gap-8 shadow-lg mb-10" onSubmit={step === steps.length - 1 ? handleSubmit : handleNext}>
        {step === 0 && <Step1 onChange={handleChange} values={formValues} />}
        {step === 1 && <Step2 onChange={handleChange} values={formValues} />}
        {step === 2 && <Step3 onChange={handleChange} values={formValues} />}
        {step === 3 && <Step4 values={formValues} agreed={agreed} onAgree={() => setAgreed((a) => !a)} />}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className={`py-2 px-6 rounded-lg font-semibold text-[15px] border transition-all duration-200 ${
              step === 0 ? 'bg-[#e0dfea] text-[#a259f7] cursor-not-allowed' : 'bg-white text-[#a259f7] border-[#a259f7] hover:bg-[#f5f0ff]'
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
              className={`py-2 px-6 rounded-lg font-semibold text-[15px] bg-[#22c55e] text-white hover:bg-[#16a34a] transition-all duration-200 ${!agreed ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              Submit
            </button>
          )}
          </div>
        </form>
      {submitted && <SuccessNotification />}
      <style jsx>{`
        @keyframes breathe {
          0% { transform: scale(1.08); }
          50% { transform: scale(1.22); }
          100% { transform: scale(1.08); }
        }
        .breathe {
          animation: breathe 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Signup;
