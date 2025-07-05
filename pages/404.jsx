import React, { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="notfound-3d-bg">
      <div className="notfound-3d-content">
        <div className="notfound-3d-404">404</div>
        <div className="notfound-3d-title">Page Not Found</div>
        <div className="notfound-3d-desc">Sorry, we couldn't find the page you were looking for.</div>
        <button className="notfound-3d-btn" onClick={handleHome}>Go Home</button>
      </div>
      <style jsx>{`
        .notfound-3d-bg {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(120deg, #f8f7fa 0%, #f5edff 60%, #e0d7f8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notfound-3d-content {
          width: 100%;
          text-align: center;
        }
        .notfound-3d-404 {
          font-size: 12vw;
          font-weight: 900;
          color: #fff;
          letter-spacing: 0.1em;
          margin-bottom: 0.1em;
          text-shadow:
            0 2px 8px #e0d7f8cc,
            0 8px 32px #f5edffcc,
            0 0px 0 #fff,
            0 1px 0 #f8f7fa,
            0 2px 0 #e0d7f8,
            0 3px 0 #f5edff,
            0 4px 0 #e0d7f8,
            0 5px 0 #f8f7fa,
            0 6px 8px #e0d7f8cc;
          -webkit-text-stroke: 2px #a259f7aa;
          text-stroke: 2px #a259f7aa;
        }
        .notfound-3d-title {
          font-size: 2.5vw;
          font-weight: 700;
          color: #6b5ca5;
          margin-bottom: 0.5em;
          text-shadow: 0 2px 8px #fff8, 0 1px 0 #e0d7f8;
        }
        .notfound-3d-desc {
          color: #888;
          font-size: 1.3vw;
          margin-bottom: 2em;
        }
        .notfound-3d-btn {
          padding: 1em 3em;
          font-size: 1.5vw;
          font-weight: 700;
          background: linear-gradient(90deg, #e0d7f8 0%, #f5edff 100%);
          color: #6b5ca5;
          border: none;
          border-radius: 16px;
          box-shadow: 0 4px 24px #e0d7f833;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, transform 0.1s;
        }
        .notfound-3d-btn:hover {
          background: linear-gradient(90deg, #f5edff 0%, #e0d7f8 100%);
          color: #a259f7;
          transform: scale(1.05);
        }
        @media (max-width: 600px) {
          .notfound-3d-404 { font-size: 20vw; }
          .notfound-3d-title { font-size: 6vw; }
          .notfound-3d-desc { font-size: 3vw; }
          .notfound-3d-btn { font-size: 4vw; padding: 1em 2em; }
        }
      `}</style>
    </div>
  );
} 