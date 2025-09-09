import React, { useMemo, useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DwrModal from '../components/DwrModal';
import CryptoJS from 'crypto-js';
import SideMenu from '../components/sidemenu';
import Header from '../components/header';
import { useSidebar } from '../context/SidebarContext';
import Loader from '../loader/Loader';
import { useUserInfo } from '../context/UserInfoContext';

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

export default function DwrPage() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = useMemo(() => decryptToken(token), [token]);

  const [loading, setLoading] = useState(false);
  const [dwrDoc, setDwrDoc] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', color: 'green' });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(72);
  const { user, loading: userLoading, error: userError } = useUserInfo();

  // date key YYYY-MM-DD based on user's local date
  const getDateKey = () => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const dateKey = getDateKey();

  const fetchToday = async () => {
    if (!ci || !aid) return;
    setLoading(true);
    try {
      const resp = await fetch('/api/DWR/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: ci, employeeId: aid, date: dateKey })
      });
      if (!resp.ok) {
        setDwrDoc(null);
        return;
      }
      const data = await resp.json();
      setDwrDoc(data.doc || null);
    } catch (err) {
      console.error('Failed to fetch DWR', err);
      setDwrDoc(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ci && aid) fetchToday();
  }, [ci, aid]);

  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      router.replace('/auth/login');
    }
  }, [router.isReady, ci, aid]);

  // update header height
  useEffect(() => {
    function updateHeaderHeight() {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    }
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  const getContentMarginLeft = () => {
    if (!isHydrated) return 270;
    if (isMobile) return 0;
    return isOpen ? 270 : 64;
  };

  const isEditable = () => {
    if (!dwrDoc || !dwrDoc.createdAt) return true;
    const created = new Date(dwrDoc.createdAt);
    const hours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
    return hours <= 48;
  };

  return (
    <>
      <Head>
        <title>Daily Work Report</title>
      </Head>

      <div className="bg-[#fbf9f4] min-h-screen flex relative">
        {/* Sidebar for desktop */}
        <div className="hidden sm:block fixed top-0 left-0 h-full z-40" style={{ width: 270 }}>
          <SideMenu />
        </div>

        {/* Sidebar for mobile (overlay) */}
        {mobileSidebarOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-white">
            <button className="absolute top-4 right-4 z-60 text-3xl text-gray-500" aria-label="Close sidebar" onClick={() => setMobileSidebarOpen(false)}>&times;</button>
            <SideMenu mobileOverlay={true} />
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen transition-all duration-300" style={{ marginLeft: getContentMarginLeft() }}>
          <Header ref={headerRef} onMobileSidebarToggle={() => setMobileSidebarOpen(v => !v)} mobileSidebarOpen={mobileSidebarOpen} />

          <main className="transition-all duration-300 px-2 sm:px-8 py-12 md:py-6" style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}>
            <div className="max-w-6xl mx-auto">
              {/* Page content */}
              <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl text-[#16a34a] font-extrabold leading-tight">Intern Management</h1>
                    <p className="mt-1 text-lg text-gray-700 font-semibold">Daily Work Report — {dateKey}</p>
                    <p className="mt-2 text-sm text-gray-500">Submit a brief list of things you completed today.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow"
                      onClick={() => setShowModal(true)}
                    >
                      {dwrDoc ? (isEditable() ? 'Edit DWR' : 'View DWR') : 'Add DWR'}
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="p-8 bg-white rounded-2xl shadow text-center">Loading...</div>
                ) : dwrDoc ? (
                  <div className="bg-white rounded-2xl shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-500">Submitted: {dwrDoc.createdAt ? new Date(dwrDoc.createdAt).toLocaleString() : '-'}</div>
                      {!isEditable() && (
                        <div className="text-sm px-3 py-1 bg-yellow-50 text-yellow-800 rounded">Locked (48+ hrs)</div>
                      )}
                    </div>
                    <ul className="space-y-3">
                      {(dwrDoc.points || []).map((pt, i) => {
                        const item = (typeof pt === 'string') ? { text: pt, link: '' } : pt || { text: '', link: '' };
                        return (
                          <li key={i} className="flex items-start gap-3 bg-white border-l-4 border-green-200 p-4 rounded-md shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-green-50 text-green-700 flex items-center justify-center font-semibold">{i + 1}</div>
                            <div className="flex-1">
                              <div className="text-gray-900 text-base leading-relaxed font-medium">{item.text}</div>
                              {item.link && (
                                <div className="mt-2">
                                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-sm">Open link</a>
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow p-8 text-center">
                    <p className="text-gray-800 mb-3 text-lg">You haven't submitted your Daily Work Report for today yet.</p>
                    <p className="text-sm text-gray-500 mb-6">Click the button above to add your DWR. Keep each item short — one-line tasks work best.</p>
                    <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow">Add DWR</button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <DwrModal open={showModal} onClose={() => { setShowModal(false); fetchToday(); }} companyId={ci} employeeId={aid} onSaved={() => { fetchToday(); }} setNotification={setNotification} />

      {notification.show && (
        <div className={`fixed top-6 right-6 px-4 py-2 rounded text-white ${notification.color === 'green' ? 'bg-green-600' : 'bg-red-600'}`}>{notification.message}</div>
      )}
    </>
  );
}
