import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSidebar } from "../context/SidebarContext";
import CryptoJS from "crypto-js";
import { useUserInfo } from "../context/UserInfoContext";   // ← NEW
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
function encryptToken(ci, aid) {
  const data = JSON.stringify({ ci, aid });
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

const menuItems = [
  {
    label: "Dashboard",
    route: "/dashboard",
    icon: (isActive) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="2"
          fill="none"
          stroke={isActive ? "#16a34a" : "#222"}
          strokeWidth="2"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="2"
          fill="none"
          stroke={isActive ? "#16a34a" : "#222"}
          strokeWidth="2"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="2"
          fill="none"
          stroke={isActive ? "#16a34a" : "#222"}
          strokeWidth="2"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="2"
          fill="none"
          stroke={isActive ? "#16a34a" : "#222"}
          strokeWidth="2"
        />
      </svg>
    ),
  },
  // {
  //   label: "Products",
  //   route: "/products",
  //   icon: (isActive) => (
  //     <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
  //       <rect
  //         x="3"
  //         y="7"
  //         width="18"
  //         height="13"
  //         rx="2"
  //         fill="none"
  //         stroke={isActive ? "#16a34a" : "#222"}
  //         strokeWidth="2"
  //       />
  //       <rect
  //         x="7"
  //         y="3"
  //         width="10"
  //         height="4"
  //         rx="2"
  //         fill={isActive ? "#16a34a" : "#fff"}
  //         stroke={isActive ? "#16a34a" : "#222"}
  //         strokeWidth="2"
  //       />
  //     </svg>
  //   ),
  // },
  // Data menu item
  {
    label: "Data",
    route: "/data",
/*************  ✨ Windsurf Command 🌟  *************/
    icon: (isActive) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="7" width="18" height="10" rx="2" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2" fill="none" />
        <rect x="7" y="11" width="2" height="2" rx="1" fill={isActive ? "#16a34a" : "#222"} />
        <rect x="11" y="11" width="2" height="2" rx="1" fill={isActive ? "#16a34a" : "#222"} />
        <rect x="15" y="11" width="2" height="2" rx="1" fill={isActive ? "#16a34a" : "#222"} />
      </svg>
    ),
  },
  {
    label: "Interns",
    route: "/intern-management-system",
    icon: (isActive) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
  <rect x="2" y="3" width="20" height="18" rx="2" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2" />
  <circle cx="8" cy="9" r="2" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2" />
  <circle cx="16" cy="9" r="2" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2" />
  <path d="M6 17c0-2 4-3 4-3s4 1 4 3" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2" strokeLinecap="round" />
  <path d="M14 17c0-1.5 4-2.5 4-2.5s2 0.5 2 2.5" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2" strokeLinecap="round" />
</svg>

    ),
/*******  e34fd138-9904-443b-a691-237cc1146e8b  *******/
  },
   {
    label: "Employees",
    route: "/employees",
    icon: (isActive) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path
          d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"
          stroke={isActive ? "#16a34a" : "#222"}
          strokeWidth="2"
        />
        <circle
          cx="9"
          cy="7"
          r="4"
          stroke={isActive ? "#16a34a" : "#222"}
          strokeWidth="2"
        />
        <path
          d="M23 20v-2a4 4 0 0 0-3-3.87"
          stroke={isActive ? "#16a34a" : "#222"}
          strokeWidth="2"
        />
        <circle
          cx="17"
          cy="7"
          r="4"
          stroke={isActive ? "#16a34a" : "#222"}
          strokeWidth="2"
        />
      </svg>
    ),
  },
    {
    label: "Assign Tasks",
    route: "/assign-tasks",
    icon: (isActive) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
  <rect x="4" y="3" width="16" height="18" rx="2" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2"/>
  <path d="M9 3V5H15V3" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2"/>
  <path d="M8 9h8" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2" strokeLinecap="round"/>
  <path d="M8 13h5" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2" strokeLinecap="round"/>
  <path d="M8 17h3" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2" strokeLinecap="round"/>
  <path d="M16 12l2 2l4 -4" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>


    ),
/*******  e34fd138-9904-443b-a691-237cc1146e8b  *******/
  },
   {
    label: "My Tasks",
    route: "/my-tasks",
    icon: (isActive) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2" />
        <path d="M8 8h8M8 12h8M8 16h5" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2" strokeLinecap="round" />
        <path d="M16 12l2 2l4 -4" stroke={isActive ? "#16a34a" : "#222"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  // {
  //   label: "Users",
  //   route: "/users-permissions",
  //   icon: (isActive) => (
  //     <svg
  //       width="22"
  //       height="22"
  //       viewBox="0 0 20 20"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <path
  //         fill="#16a34a"
  //         fillOpacity={isActive ? 1 : 0.1}
  //         d="M9.99296258,10.5729355 C12.478244,10.5729355 14.4929626,8.55821687 14.4929626,6.0729355 C14.4929626,3.58765413 12.478244,1.5729355 9.99296258,1.5729355 C7.5076812,1.5729355 5.49296258,3.58765413 5.49296258,6.0729355 C5.49296258,8.55821687 7.5076812,10.5729355 9.99296258,10.5729355 Z"
  //       />
  //       <path
  //         d="M10,0 C13.3137085,0 16,2.6862915 16,6 C16,8.20431134 14.8113051,10.1309881 13.0399615,11.173984 C16.7275333,12.2833441 19.4976819,15.3924771 19.9947005,19.2523727 C20.0418583,19.6186047 19.7690435,19.9519836 19.3853517,19.9969955 C19.0016598,20.0420074 18.6523872,19.7816071 18.6052294,19.4153751 C18.0656064,15.2246108 14.4363723,12.0699838 10.034634,12.0699838 C5.6099956,12.0699838 1.93381693,15.231487 1.39476476,19.4154211 C1.34758036,19.7816499 0.998288773,20.0420271 0.614600177,19.9969899 C0.230911582,19.9519526 -0.0418789616,19.6185555 0.00530544566,19.2523267 C0.500630192,15.4077896 3.28612316,12.3043229 6.97954305,11.1838052 C5.19718955,10.1447285 4,8.21217353 4,6 C4,2.6862915 6.6862915,0 10,0 Z"
  //         stroke={isActive ? "#16a34a" : "#222"}
  //         strokeWidth="1.5"
  //       />
  //     </svg>
  //   ),
  // },
  {
    label: "API Keys",
    route: "/api-keys",
    icon: (isActive) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 511 511"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M492.168,309.579l-17.626-10.177c2.96-14.723,4.458-29.466,4.458-43.902c0-14.646-1.474-29.403-4.384-43.946l17.552-10.134c5.436-3.138,9.325-8.206,10.949-14.269s0.791-12.396-2.348-17.832l-48-83.139c-3.139-5.436-8.206-9.325-14.269-10.949c-6.064-1.624-12.396-0.791-17.833,2.348l-17.566,10.142C380.912,68.2,354.798,53.092,327,43.692V23.5C327,10.542,316.458,0,303.5,0h-96C194.542,0,184,10.542,184,23.5v20.193c-27.65,9.362-53.728,24.49-75.999,44.088L90.332,77.579c-5.437-3.139-11.77-3.973-17.833-2.348c-6.063,1.625-11.13,5.513-14.269,10.949l-48,83.139c-3.139,5.436-3.972,11.769-2.348,17.832s5.513,11.131,10.949,14.269l17.626,10.177C33.499,226.32,32,241.063,32,255.5c0,14.644,1.474,29.401,4.384,43.945l-17.552,10.134c-11.222,6.479-15.08,20.879-8.602,32.102l48,83.139c6.479,11.221,20.879,15.08,32.102,8.601l17.565-10.142c22.19,19.521,48.303,34.629,76.103,44.03V487.5c0,12.958,10.542,23.5,23.5,23.5h96c12.958,0,23.5-10.542,23.5-23.5v-20.193c27.651-9.362,53.729-24.49,76-44.087l17.668,10.201c11.221,6.479,25.623,2.62,32.102-8.601l48-83.139C507.248,330.458,503.39,316.058,492.168,309.579z"
            stroke={isActive ? "#16a34a" : "#222"}
            strokeWidth="16"
            fill="none"
          />
          <path
            d="M255.5,104C171.962,104,104,171.963,104,255.5S171.962,407,255.5,407S407,339.037,407,255.5S339.038,104,255.5,104z M255.5,392C180.234,392,119,330.766,119,255.5S180.234,119,255.5,119S392,180.234,392,255.5S330.766,392,255.5,392z"
            stroke={isActive ? "#16a34a" : "#222"}
            strokeWidth="16"
            fill="none"
          />
          <path
            d="M283.5,216h-28c-4.142,0-7.5,3.358-7.5,7.5v64c0,4.142,3.358,7.5,7.5,7.5s7.5-3.358,7.5-7.5V271h20.5c15.164,0,27.5-12.336,27.5-27.5S298.664,216,283.5,216z M283.5,256H263v-25h20.5c6.893,0,12.5,5.607,12.5,12.5S290.393,256,283.5,256z"
            fill="#fff"
          />
          <path
            d="M214.522,220.867c-1.098-2.927-3.896-4.867-7.022-4.867h-8c-3.126,0-5.925,1.939-7.022,4.867l-24,64c-1.455,3.878,0.511,8.201,4.389,9.656c3.878,1.455,8.201-0.511,9.656-4.389L186.697,279h33.605l4.175,11.133c1.129,3.011,3.987,4.869,7.023,4.869c0.875,0,1.765-0.154,2.632-0.479c3.878-1.454,5.844-5.778,4.389-9.656L214.522,220.867z M192.322,264l11.178-29.807L214.678,264H192.322z"
            fill="#fff"
          />
          <path
            d="M327.5,216c-4.142,0-7.5,3.358-7.5,7.5v64c0,4.142,3.358,7.5,7.5,7.5s7.5-3.358,7.5-7.5v-64C335,219.358,331.642,216,327.5,216z"
            fill="#fff"
          />
          <path
            d="M309.152,87.3c5.205,1.659,10.394,3.586,15.421,5.726c0.958,0.408,1.954,0.601,2.934,0.601c2.916,0,5.69-1.712,6.904-4.564c1.622-3.811-0.152-8.216-3.963-9.838c-5.458-2.323-11.09-4.415-16.742-6.216c-3.945-1.258-8.165,0.922-9.423,4.868C303.026,81.823,305.206,86.042,309.152,87.3z"
            fill="#fff"
          />
          <path
            d="M100.45,339.904c-1.984-3.636-6.541-4.976-10.176-2.992c-3.636,1.984-4.976,6.54-2.992,10.176c3.112,5.704,6.557,11.315,10.239,16.677c1.454,2.117,3.801,3.255,6.189,3.255c1.463,0,2.941-0.427,4.239-1.318c3.415-2.345,4.282-7.014,1.937-10.428C106.493,350.332,103.318,345.161,100.45,339.904z"
            fill="#fff"
          />
          <path
            d="M240.14,431.341c-40.189-3.463-78.337-20.879-107.416-49.041c-2.976-2.882-7.724-2.805-10.605,0.17c-2.881,2.976-2.806,7.724,0.17,10.605c31.55,30.555,72.947,49.452,116.563,53.21c0.219,0.019,0.436,0.028,0.652,0.028c3.851,0,7.127-2.949,7.464-6.856C247.323,435.331,244.266,431.697,240.14,431.341z"
            fill="#fff"
          />
          <path
            d="M363.425,97.287c-3.42-2.337-8.087-1.459-10.424,1.96c-2.337,3.42-1.459,8.087,1.96,10.424c34.844,23.813,60.049,59.248,70.972,99.776c0.902,3.346,3.93,5.55,7.237,5.55c0.646,0,1.303-0.084,1.956-0.26c4-1.078,6.368-5.194,5.29-9.193C428.564,161.564,401.221,123.118,363.425,97.287z"
            fill="#fff"
          />
        </g>
      </svg>
    ),
  },
  {
    label: "Passwords & Security",
    route: "/security",
    icon: (isActive) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <rect
          x="3"
          y="11"
          width="18"
          height="10"
          rx="2"
          stroke={isActive ? "#16a34a" : "#222"}
          strokeWidth="2"
        />
        <path d="M7 11V7a5 5 0 0110 0v4" stroke="#16a34a" strokeWidth="2" />
        <circle cx="12" cy="16" r="2" fill="#16a34a" />
      </svg>
    ),
  },
  {
    label: "Announcements",
    route: "/announcements",
    icon: (isActive) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path
          d="M3 17V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          stroke={isActive ? "#16a34a" : "#222"}
          strokeWidth="2"
        />
        <path d="M7 7v10" stroke="#16a34a" strokeWidth="2" />
        <path d="M17 7v10" stroke="#16a34a" strokeWidth="2" />
        <path d="M12 7v10" stroke="#16a34a" strokeWidth="2" />
      </svg>
    ),
  },
  {
    label: "Notepad",
    route: "/notes-tasks",
    icon: (isActive) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2"
          stroke={isActive ? "#16a34a" : "#222"}
          strokeWidth="2"
        />
        <path
          d="M8 10h8M8 14h4"
          stroke="#16a34a"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="8" cy="8" r="1" fill="#16a34a" />
        <circle cx="8" cy="12" r="1" fill="#16a34a" />
      </svg>
    ),
  },
];

// Custom bounce animation for Tailwind
const bounceKeyframes = `
@keyframes bounce-custom {
  0%, 100% { transform: translateY(0); }
  20% { transform: translateY(-8px); }
  40% { transform: translateY(0); }
  60% { transform: translateY(-4px); }
  80% { transform: translateY(0); }
}
`;

// Animated underline for heading
const underlineKeyframes = `
@keyframes underline-move {
  0% { left: 0; width: 0; opacity: 1; }
  40% { left: 0; width: 100%; opacity: 1; }
  80% { left: 100%; width: 0; opacity: 0; }
  100% { left: 0; width: 0; opacity: 0; }
}
`;

export default function SideMenu({ mobileOverlay = false }) {
  const { isOpen, toggleSidebar } = useSidebar();
  const router = useRouter();
  const { user } = useUserInfo();          // ← NEW: current user info (has user.role)
  // Get token from current query and decrypt
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);

  // Determine sidebar width class
  const sidebarWidthClass = mobileOverlay
    ? "w-full"
    : isOpen
    ? "w-[270px]"
    : "w-16";

  return (
    <>
      <style>{bounceKeyframes + underlineKeyframes + `
  nav::-webkit-scrollbar {
    width: 8px;
    background: transparent;
  }
  nav::-webkit-scrollbar-thumb {
    background:#28DB78; /* Tailwind green-500 */
    border-radius: 6px;
  }
  nav {
    scrollbar-color:#28DB78 transparent;
    scrollbar-width: thin;
  }
`}</style>

      <aside
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 bg-white shadow flex flex-col ${sidebarWidthClass} border-r border-gray-100`}
        style={{
          boxShadow: "2px 0 16px 0 rgba(162,89,247,0.15), 4px 0 0 0 #e0d7f8",
        }}
      >
        {/* Logo and toggle */}
        <div
          className={`flex items-center justify-between px-6 py-6 border-b border-gray-200 ${
            mobileOverlay ? "" : isOpen ? "" : "px-2 justify-center"
          }`}
        >
          <div
            className={`flex items-center gap-3 min-w-0 ${
              mobileOverlay ? "" : isOpen ? "" : "justify-center w-full"
            }`}
          >
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center"
            >
              <Image
                src="/logo cyber clipper.png"
                alt="Cyber Clipper Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </span>
            {(mobileOverlay || isOpen) && (
              <span
                className="font-extrabold text-thin text-gray-900 text-lg whitespace-nowrap relative overflow-visible cursor-pointer"
                style={{ lineHeight: 1.2 }}
                onClick={() => {
                  if (ci && aid) {
                    const newToken = encryptToken(ci, aid);
                    router.push(`/dashboard?token=${encodeURIComponent(newToken)}`);
                  } else {
                    router.push("/dashboard");
                  }
                }}
              >
                EMPLOYEE &nbsp;PANEL
                <span
                  className="absolute left-0 -bottom-1 h-1 rounded-full bg-[#16a34a]"
                  style={{
                    width: "100%",
                    height: "3px",
                    display: "block",
                    pointerEvents: "none",
                    animation:
                      "underline-move 2.2s cubic-bezier(0.4,0,0.2,1) infinite",
                    background:
                      "linear-gradient(90deg, #16a34a 0%, #16a34a 60%, transparent 100%)",
                    opacity: 1,
                  }}
                />
              </span>
            )}
          </div>
          {/* Only show arrow/collapse button on desktop (not mobile overlay) */}
          {!mobileOverlay && (
            <button
              className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              onClick={toggleSidebar}
            >
              {isOpen ? (
                <svg
                  className="transition-transform duration-300"
                  width="28"
                  height="28"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15 19l-7-7 7-7"
                    stroke="#222"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  className="transition-transform duration-300"
                  width="28"
                  height="28"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="#222"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
        {/* Menu items */}
        <nav
          className={`flex-1 flex flex-col ${
            mobileOverlay
              ? ""
              : isOpen
              ? "gap-1 mt-3 px-2"
              : "gap-0 mt-2 px-0 items-center"
          }`}
          style={{
            overflowY: "auto",
            overflowX: "hidden", // Prevent horizontal scrollbar
            scrollbarWidth: "thin",
            maxHeight: "100vh"
          }}
        >
          {menuItems.map((item, idx) => {
            const isActive = router.pathname === item.route;
            return (
              <>
                <button
                  key={item.label}
                  onClick={() => {
                    if (ci && aid) {
                      const newToken = encryptToken(ci, aid);
                      router.push(`${item.route}?token=${encodeURIComponent(newToken)}`);
                    } else {
                      router.push(item.route);
                    }
                  }}
                  className={`flex items-center ${
                    mobileOverlay
                      ? "justify-start px-6 py-4 text-lg font-semibold text-gray-900 w-full"
                      : isOpen
                      ? "gap-3 px-5"
                      : "justify-center px-0"
                  } rounded-xl transition-all duration-150 my-0.5
                    ${
                      isActive
                        ? "bg-[#f5edff] text-[#16a34a] shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }
                    relative w-full text-left`}
                  style={{
                    boxShadow: isActive
                      ? "0 2px 8px 0 rgba(162,89,247,0.08)"
                      : undefined,
                    minHeight: 48,
                  }}
                >
                  {/* Only show icon on desktop, always for collapsed, with text if open */}
                  {!mobileOverlay && (
                    <span
                      className={`text-xl flex-shrink-0 flex items-center justify-center ${
                        isActive ? "animate-bounce-custom" : ""
                      }`}
                      style={
                        isActive ? { animation: "bounce-custom 0.8s" } : {}
                      }
                    >
                      {item.icon(isActive)}
                    </span>
                  )}
                  {/* Show text: always on mobile overlay, or on desktop if open */}
                  {(mobileOverlay || isOpen) && <span>{item.label}</span>}
                  {/* Only show active indicator on desktop */}
                  {!mobileOverlay && isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-[#16a34a]" />
                  )}
                </button>
                {/* Only show divider on desktop */}
                {!mobileOverlay && idx !== menuItems.length - 1 && (
                  <div
                    className={`w-full ${
                      isOpen ? "ml-5" : "ml-0"
                    } border-t border-gray-100`}
                    style={{ height: 1 }}
                  />
                )}
              </>
            );
          })}
        </nav>
        {/* Footer */}
        {(!mobileOverlay && isOpen) || mobileOverlay ? (
          <div
            className={`px-4 py-3 text-xs text-gray-500 flex flex-col items-center justify-center ${mobileOverlay ? '' : isOpen ? '' : 'px-0'}`}
            style={{ borderTop: '1px solid #f3e8ff', marginTop: 'auto' }}
          >
            <span className="font-semibold" style={{ color: '#16a34a' }}>
              <a href="https://cyberclipper.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a', textDecoration: 'underline', cursor: 'pointer' }}>
                Powered by CyberClipper InfoTech LLP.
              </a>
            </span>
            <span className="flex items-center gap-1 mt-1">
              Made with
              <span style={{ color: 'red', fontSize: '1.1em', margin: '0 2px' }} role="img" aria-label="love">❤️</span>
              in India
            </span>
          </div>
        ) : null}
      </aside>
    </>
  );
}
