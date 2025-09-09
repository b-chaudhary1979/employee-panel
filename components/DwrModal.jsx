import React, { useEffect, useState } from 'react';

export default function DwrModal({ open, onClose, companyId, employeeId, onSaved, setNotification }) {
  const [points, setPoints] = useState([{ text: '', link: '' }]);
  const [loading, setLoading] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);
  const [dateKey, setDateKey] = useState(null);

  useEffect(() => {
    if (!open) return;
    // default date key = today YYYY-MM-DD
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    setDateKey(key);

    // fetch existing DWR for today
    (async () => {
      if (!companyId || !employeeId) return;
      setLoading(true);
      try {
        const resp = await fetch('/api/DWR/get', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId, employeeId, date: key })
        });
        if (!resp.ok) {
          setPoints([{ text: '', link: '' }]);
          setReadonly(false);
          setCreatedAt(null);
          return;
        }
        const data = await resp.json();
        if (data && data.doc) {
          // normalize points to objects { text, link }
          const normalized = Array.isArray(data.doc.points) && data.doc.points.length
            ? data.doc.points.map(p => {
                if (!p) return { text: '', link: '' };
                if (typeof p === 'string') return { text: p, link: '' };
                // p may already be object
                return { text: p.text || '', link: p.link || '' };
              })
            : [{ text: '', link: '' }];
          setPoints(normalized);
          setCreatedAt(data.doc.createdAt ? new Date(data.doc.createdAt) : null);
          // editable only if within 48 hours
          if (data.doc.createdAt) {
            const created = new Date(data.doc.createdAt);
            const hours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
            setReadonly(hours > 48);
          }
        } else {
          setPoints([{ text: '', link: '' }]);
          setReadonly(false);
        }
      } catch (err) {
        console.error('Failed to fetch DWR', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, companyId, employeeId]);

  if (!open) return null;

  const updatePoint = (i, v) => setPoints(p => p.map((x, idx) => idx === i ? { ...x, text: v } : x));
  const updateLink = (i, v) => setPoints(p => p.map((x, idx) => idx === i ? { ...x, link: v } : x));
  const addPoint = () => setPoints(p => [...p, { text: '', link: '' }]);
  const removePoint = (i) => setPoints(p => p.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!companyId || !employeeId || !dateKey) return;
    // normalize and trim; keep only points with text
    const pts = points.map(p => ({ text: (p.text || '').trim(), link: (p.link || '').trim() })).filter(p => p.text.length > 0);
    if (pts.length === 0) {
      setNotification && setNotification({ show: true, message: 'Add at least one point', color: 'red' });
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/DWR/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyId, employeeId, date: dateKey, points: pts })
      });
      const res = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setNotification && setNotification({ show: true, message: res.error || 'Failed to save DWR', color: 'red' });
        return;
      }
      setNotification && setNotification({ show: true, message: res.message || 'DWR saved', color: 'green' });
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error('save dwr error', err);
      setNotification && setNotification({ show: true, message: 'Failed to save DWR', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="bg-black/50 absolute inset-0 backdrop-blur-sm"></div>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-0 z-70 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Daily Work Report</h3>
            <div className="text-xs text-gray-500">{dateKey} {createdAt ? `• Created: ${createdAt.toLocaleString()}` : ''}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 rounded p-2" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-gray-50">
          {readonly && (
            <div className="p-3 mb-0 bg-yellow-50 border border-yellow-100 rounded text-sm text-yellow-800">Editing disabled: DWR older than 48 hours</div>
          )}

          <div className="space-y-3">
            {points.map((pt, idx) => (
              <div key={idx} className="flex flex-col gap-2 bg-white p-3 rounded-md border border-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-6 text-gray-600 mt-2">{idx + 1}.</div>
                  <input
                    className="flex-1 border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                    value={pt.text}
                    onChange={(e) => updatePoint(idx, e.target.value)}
                    placeholder="Describe the task in one line"
                    disabled={readonly}
                  />
                  {!readonly && (
                    <button type="button" onClick={() => removePoint(idx)} className="px-3 py-1 bg-red-50 text-red-700 rounded-md border border-red-100">Remove</button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    className="flex-1 border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-50"
                    value={pt.link}
                    onChange={(e) => updateLink(idx, e.target.value)}
                    placeholder="Optional: related link (https://...)"
                    disabled={readonly}
                  />
                  <div className="text-sm text-gray-400">Optional</div>
                </div>
              </div>
            ))}
          </div>

          {!readonly && (
            <div className="flex gap-2">
              <button type="button" onClick={addPoint} className="px-4 py-2 bg-white border border-green-200 text-green-700 rounded-md shadow-sm hover:bg-green-50">+ Add Point</button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 bg-white border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-md">Close</button>
          {!readonly && <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md shadow">{loading ? 'Saving...' : 'Save'}</button>}
        </div>
      </div>
    </div>
  );
}
