import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState, useEffect, useRef } from "react";
import { useSidebar } from "../context/SidebarContext";
import CryptoJS from "crypto-js";
import { useRouter } from "next/router";
import { useUserInfo } from "../context/UserInfoContext";
import Loader from "../loader/Loader";
import LeadsModal from '../components/LeadsModal';
import { useCallback } from 'react';

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

export default function LeadsContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(72);
  const { user, loading, error } = useUserInfo();

  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user && !user.role?.toLowerCase().includes('sales')) {
      // not sales -> redirect or show no access
      // keep it simple: redirect to dashboard
      router.replace('/dashboard');
      return;
    }
  }, [user]);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!user) return;
      setLoadingLeads(true);
      try {
  // Prefer companyId from the link token (ci) when present
  const companyId = ci || user?.companyId || user?.company || null;
        const employeeId = user?.id || user?.employeeId || aid || null;
        let q;
        if (companyId) {
          q = `/api/leads?companyId=${encodeURIComponent(companyId)}` + (employeeId ? `&employeeId=${encodeURIComponent(employeeId)}` : '');
        } else {
          q = `/api/leads?companyId=${encodeURIComponent(ci || '')}` + (employeeId ? `&employeeId=${encodeURIComponent(employeeId)}` : '');
        }
        const res = await fetch(q);
        const data = await res.json();
        console.debug('Fetched leads', { query: q, status: res.status, ok: res.ok, count: (data?.leads || []).length, sample: (data?.leads || []).slice(0,3) });
        if (res.ok) {
          setLeads(data.leads || []);
        }
      } catch (err) {
        console.error('Failed to fetch leads', err);
      } finally {
        setLoadingLeads(false);
      }
    };
    fetchLeads();
  }, [user, ci]);

  const refetchLeads = useCallback(async () => {
    if (!user) return;
    setLoadingLeads(true);
    try {
  // Prefer companyId from the link token (ci) when present
  const companyId = ci || user?.companyId || user?.company || null;
      const employeeId = user?.id || user?.employeeId || aid || null;
      let q;
      if (companyId) {
        q = `/api/leads?companyId=${encodeURIComponent(companyId)}` + (employeeId ? `&employeeId=${encodeURIComponent(employeeId)}` : '');
      } else {
        q = `/api/leads?companyId=${encodeURIComponent(ci || '')}` + (employeeId ? `&employeeId=${encodeURIComponent(employeeId)}` : '');
      }
  const res = await fetch(q);
  const data = await res.json();
  console.debug('Refetched leads', { query: q, status: res.status, ok: res.ok, count: (data?.leads || []).length, sample: (data?.leads || []).slice(0,3) });
  if (res.ok) setLeads(data.leads || []);
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setLoadingLeads(false);
    }
  }, [user, ci]);

  // open a custom delete confirmation popup (do not use browser confirm)
  const handleDelete = async (lead) => {
    setDeleteCandidate(lead);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const lead = deleteCandidate;
    if (!lead) return;
    try {
      const companyId = user?.companyId || user?.company || null;
      const employeeId = lead.employeeId || lead.assignedTo || lead.assigned || null;
      const res = await fetch(`/api/leads?id=${encodeURIComponent(lead.id)}&companyId=${encodeURIComponent(companyId)}&employeeId=${encodeURIComponent(employeeId)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setLeads(prev => prev.filter(p => p.id !== lead.id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete lead');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteCandidate(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteCandidate(null);
  };

  // Responsive marginLeft for content (matches header)
  const getContentMarginLeft = () => {
    if (!isHydrated) return 270;
    if (isMobile) return 0;
    return isOpen ? 270 : 64;
  };

  useEffect(() => {
    function updateHeaderHeight() {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    }
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  if (!ci || !aid) return null;
  if (loading) return <div className="flex items-center justify-center min-h-screen w-full"><Loader /></div>;

  return (
    <>
      <div className="bg-[#fbf9f4] min-h-screen flex relative">
        <div className="hidden sm:block fixed top-0 left-0 h-full z-40" style={{ width: 270 }}>
          <SideMenu />
        </div>
        {mobileSidebarOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-white">
            <button className="absolute top-4 right-4 z-60 text-3xl text-gray-500" aria-label="Close sidebar" onClick={() => setMobileSidebarOpen(false)}>&times;</button>
            <SideMenu mobileOverlay={true} />
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-screen transition-all duration-300" style={{ marginLeft: getContentMarginLeft() }}>
          <Header ref={headerRef} onMobileSidebarToggle={() => setMobileSidebarOpen(v => !v)} mobileSidebarOpen={mobileSidebarOpen} />
          <main className="transition-all duration-300 px-2 sm:px-8 py-12 md:py-6" style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}>
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-extrabold" style={{ color: '#45CA8A' }}>Leads</h1>
                  <p className="text-sm text-gray-500">Manage leads captured from various sources.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-[#16a34a] text-white rounded shadow" onClick={() => setOpenModal(true)}>Add Lead</button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
                {/* Debug info for diagnosing lead fetch */}
                
                {loadingLeads ? (
                  <div className="py-8 flex items-center justify-center"><Loader /></div>
                ) : leads.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">No leads found. Click Add Lead to create one.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                          <tr className="text-left text-sm text-white" style={{ background: 'linear-gradient(90deg, #16a34a 0%, #45CA8A 100%)' }}>
                          <th className="p-3">Name</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3">Source</th>
                          <th className="p-3">Product</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Active</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((l, idx) => (
                          <tr
                            key={l.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => { setEditingLead(l); setOpenModal(true); }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setEditingLead(l);
                                setOpenModal(true);
                              }
                            }}
                            className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors cursor-pointer`}
                          >
                            <td className="p-3 text-gray-900 font-medium">{l.firstName} {l.lastName}</td>
                            <td className="p-3 text-gray-700">{l.email}</td>
                            <td className="p-3 text-gray-700">{(l.phones || []).join(', ')}</td>
                            <td className="p-3 text-gray-700">{l.source}</td>
                            <td className="p-3 text-gray-700">{l.product}</td>
                            <td className="p-3">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: l.status === 'Converted' ? '#ecfdf5' : l.status === 'Lost' ? '#fff1f2' : '#f1fdf6', color: l.status === 'Converted' ? '#065f46' : l.status === 'Lost' ? '#9f1239' : '#065f46' }}>{l.status}</span>
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: l.active ? '#ecfdf5' : '#fff1f0', color: l.active ? '#065f46' : '#9f1239' }} aria-label={l.active ? 'Active lead' : 'Inactive lead'}>
                                <span className={`w-2 h-2 rounded-full ${l.active ? 'bg-green-500' : 'bg-red-400'}`} />
                                {l.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  className="px-3 py-1 bg-green-600 text-white border border-green-600 rounded text-sm hover:bg-green-700"
                                  onClick={(e) => { e.stopPropagation(); setEditingLead(l); setOpenModal(true); }}
                                >Edit</button>
                                <button
                                  className="px-3 py-1 bg-red-600 text-white border border-red-600 rounded text-sm hover:bg-red-700"
                                  onClick={(e) => { e.stopPropagation(); handleDelete(l); }}
                                >Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </main>
        </div>

        <LeadsModal
          open={openModal}
          onClose={() => { setOpenModal(false); setEditingLead(null); }}
          onSaved={(lead) => {
            // if editing, replace; else prepend
            setLeads(prev => {
              const exists = prev.find(p => p.id === lead.id);
              if (exists) return prev.map(p => p.id === lead.id ? lead : p);
              return [lead, ...prev];
            });
            setEditingLead(null);
          }}
          lead={editingLead}
        />

        {/* Delete confirmation modal (in-app) */}
        {showDeleteConfirm && deleteCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2">Delete Lead</h3>
              <p className="text-sm text-gray-700 mb-4">Are you sure you want to permanently delete <strong>{deleteCandidate.firstName} {deleteCandidate.lastName}</strong>?</p>
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 border rounded" onClick={cancelDelete}>Cancel</button>
                <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
