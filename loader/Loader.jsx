import React from "react";

export default function Loader() {
  return (
    <div className="loader-center">
      <div className="cube-spinner">
        <div className="cube cube1"></div>
        <div className="cube cube2"></div>
        <div className="cube cube3"></div>
        <div className="cube cube4"></div>
      </div>
      <style jsx>{`
        .loader-center {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 9999;
          background: #fff;
        }
        .cube-spinner {
          width: 60px;
          height: 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 8px;
          transform: rotate(45deg);
        }
        .cube {
          width: 24px;
          height: 24px;
          background: #16a34a;
          border-radius: 6px;
          animation: cube-bounce 1.2s infinite ease-in-out;
        }
        .cube1 { animation-delay: 0s; }
        .cube2 { animation-delay: 0.2s; }
        .cube3 { animation-delay: 0.4s; }
        .cube4 { animation-delay: 0.6s; }
        @keyframes cube-bounce {
          0%, 100% { transform: scale(1) translateY(0); background: #16a34a; }
          30% { transform: scale(1.2) translateY(-12px); background: #fff; box-shadow: 0 4px 16px #16a34a; }
          60% { transform: scale(1) translateY(0); background: #16a34a; }
        }
      `}</style>
    </div>
  );
} 