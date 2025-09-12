import React, { useState, useMemo } from 'react';
import { useUserInfo } from '../context/UserInfoContext';
import { decryptToken } from '../utils/apiKeys';
import { useRouter } from 'next/router';

export default function LeadsModal({ open, onClose, onSaved, lead = null }) {
  const { aid, user } = useUserInfo();
  const router = useRouter();
  const { token: queryToken, cid: queryCid } = router.query || {};

  // Prefer companyId from token in link (decrypted ci) -> then query cid -> then user.companyId/user.company
  const resolvedCompanyId = useMemo(() => {
    // 1) try decrypting token from query param if present
    if (queryToken) {
      const dec = decryptToken(queryToken);
      if (dec?.ci) return dec.ci;
    }
    // 2) try cid query param
    if (queryCid) return queryCid;
    // 3) fallback to authenticated user's company id/name
    return user?.companyId || user?.company || null;
  }, [queryToken, queryCid, user]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialForm = {
    // Basic
    firstName: '',
    lastName: '',
    salutation: '',
    gender: '',
    dob: '',
    // Contact
    phones: [''],
    altEmail: '',
    email: '',
    preferredContact: 'Email',
    timezone: '',
    // Address broken down
    street: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    // Professional
    company: '',
    companySize: '',
    annualRevenue: '',
    jobTitle: '',
    industry: '',
    website: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    // Lead Tracking
    source: '',
    sourceDetail: '',
    campaign: '',
    referral: '',
    dateCaptured: '',
    // Opportunity
    product: '',
    estimatedValue: '',
    currency: 'INR',
    budget: '',
    timeline: '',
    priority: 'Warm',
    leadType: 'B2B',
    leadScore: '',
    tags: '', // comma-separated
    notes: '',
    // Communication & Ownership
    lastContactDate: '',
    nextFollowUp: '',
    status: 'New',
    assignedTo: aid || '',
    active: true,
  };

  const [form, setForm] = useState(initialForm);

  // When editing, prefill form
  React.useEffect(() => {
    if (lead) {
      // normalize fields that the form expects to be strings
      const normalized = { ...lead };
      if (Array.isArray(lead.tags)) normalized.tags = lead.tags.join(', ');
      if (Array.isArray(lead.phones)) normalized.phones = lead.phones.length ? lead.phones : [''];
      // assignedTo should be a simple id string
      if (lead.assignedTo && typeof lead.assignedTo !== 'string') normalized.assignedTo = String(lead.assignedTo);
      setForm(prev => ({ ...prev, ...normalized }));
    }
    else {
      // if no lead (adding new), reset form to initial values
      setForm(initialForm);
    }
  }, [lead]);

  if (!open) return null;

  const handleChange = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handlePhoneChange = (idx) => (e) => {
    setForm(prev => {
      const phones = [...prev.phones];
      phones[idx] = e.target.value;
      return { ...prev, phones };
    });
  };

  const addPhone = () => setForm(prev => ({ ...prev, phones: [...prev.phones, ''] }));
  const removePhone = (idx) => setForm(prev => ({ ...prev, phones: prev.phones.filter((_, i) => i !== idx) }));

  const toggleActive = () => setForm(prev => ({ ...prev, active: !prev.active }));

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const employeeId = form.assignedTo || aid || null;
      const companyIdToUse = resolvedCompanyId || user?.companyId || user?.company || null;

      // validate required identifiers before sending to API
      if (!companyIdToUse || !employeeId) {
        setError('companyId and employeeId are required to save a lead.');
        setLoading(false);
        return;
      }

      // normalize tags: accept array (already normalized) or comma string
      let tagsArray = [];
      if (Array.isArray(form.tags)) {
        tagsArray = form.tags.map(t => (t || '').toString().trim()).filter(Boolean);
      } else if (typeof form.tags === 'string' && form.tags.trim()) {
        tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      }

      const payload = {
        ...form,
        employeeId,
        assignedTo: form.assignedTo || aid || null,
        phones: Array.isArray(form.phones) ? form.phones.filter(Boolean) : (form.phones ? [form.phones] : []),
        tags: tagsArray,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        companyId: companyIdToUse,
      };
      let res, data;
      if (lead && lead.id) {
        // update
        payload.id = lead.id;
        res = await fetch('/api/leads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to update');
      } else {
        res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to save');
      }

      // ensure returned object has id
      const returned = { id: data.id || (lead && lead.id) || null, ...payload };
      onSaved && onSaved(returned);
  onClose && onClose();
  // If this was a create (not edit), reset the form so next open is empty
  if (!lead) setForm(initialForm);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card light-theme">
        <div className="p-2 bg-transparent rounded-t-md">
          <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold"><span style={{ color: 'var(--color-primary)' }}>Add Lead</span></h3>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.active} onChange={toggleActive} className="form-checkbox" />
              Active
            </label>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
          </div>
        </div>
        </div>

  <div className="space-y-6 px-1">
          {/* Basic Information */}
          <section className="p-3 bg-[rgba(250,253,250,0.6)] rounded">
            <h4 className="font-semibold text-gray-800 mb-2">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input className="input" placeholder="Salutation (Mr/Ms/Dr)" value={form.salutation} onChange={handleChange('salutation')} />
              <input className="input" placeholder="First name" value={form.firstName} onChange={handleChange('firstName')} />
              <input className="input" placeholder="Last name" value={form.lastName} onChange={handleChange('lastName')} />
              <select className="input" value={form.gender} onChange={handleChange('gender')}>
                <option value="">Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
              <input type="date" className="input" value={form.dob} onChange={handleChange('dob')} />
              <input className="input" placeholder="Timezone (e.g. Asia/Kolkata)" value={form.timezone} onChange={handleChange('timezone')} />
              <input className="input" placeholder="Lead source (short)" value={form.source} onChange={handleChange('source')} />
              <input className="input" placeholder="Source details (campaign/referral)" value={form.sourceDetail} onChange={handleChange('sourceDetail')} />
            </div>
          </section>

          {/* Contact */}
          <section className="p-3 bg-[rgba(250,253,250,0.6)] rounded">
            <h4 className="font-semibold text-gray-800 mb-2">Contact & Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Phone numbers</label>
                <div className="flex flex-col gap-2">
                  {form.phones.map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <input placeholder={i === 0 ? 'Mobile' : 'Alternate phone'} value={p} onChange={handlePhoneChange(i)} className="input flex-1" />
                      {i === 0 ? (
                        <button type="button" onClick={addPhone} className="btn">+</button>
                      ) : (
                        <button type="button" onClick={() => removePhone(i)} className="btn">-</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <input className="input" placeholder="Primary email" value={form.email} onChange={handleChange('email')} />
              <input className="input" placeholder="Alternate email" value={form.altEmail} onChange={handleChange('altEmail')} />
              <select className="input" value={form.preferredContact} onChange={handleChange('preferredContact')}>
                <option>Email</option>
                <option>Call</option>
                <option>WhatsApp</option>
                <option>SMS</option>
              </select>

              <input className="input" placeholder="Street address" value={form.street} onChange={handleChange('street')} />
              <input className="input" placeholder="City" value={form.city} onChange={handleChange('city')} />
              <input className="input" placeholder="State" value={form.state} onChange={handleChange('state')} />
              <input className="input" placeholder="ZIP / Postal" value={form.zip} onChange={handleChange('zip')} />
              <input className="input" placeholder="Country" value={form.country} onChange={handleChange('country')} />
            </div>
          </section>

          {/* Professional / Business */}
          <section className="p-3 bg-[rgba(250,253,250,0.6)] rounded">
            <h4 className="font-semibold text-gray-800 mb-2">Professional / Business Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input className="input" placeholder="Company / Organization" value={form.company} onChange={handleChange('company')} />
              <input className="input" placeholder="Company size (e.g. 10-50)" value={form.companySize} onChange={handleChange('companySize')} />
              <input className="input" placeholder="Annual revenue" value={form.annualRevenue} onChange={handleChange('annualRevenue')} />
              <input className="input" placeholder="Job title / Role" value={form.jobTitle} onChange={handleChange('jobTitle')} />
              <input className="input" placeholder="Industry / Sector" value={form.industry} onChange={handleChange('industry')} />
              <input className="input" placeholder="Website" value={form.website} onChange={handleChange('website')} />
              <input className="input" placeholder="LinkedIn URL" value={form.linkedin} onChange={handleChange('linkedin')} />
              <input className="input" placeholder="Twitter handle / URL" value={form.twitter} onChange={handleChange('twitter')} />
              <input className="input" placeholder="Facebook URL" value={form.facebook} onChange={handleChange('facebook')} />
            </div>
          </section>

          {/* Lead Details / Opportunity */}
          <section className="p-3 bg-[rgba(250,253,250,0.6)] rounded">
            <h4 className="font-semibold text-gray-800 mb-2">Lead Details & Opportunity</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input className="input" placeholder="Product / Service Interested In" value={form.product} onChange={handleChange('product')} />
              <input className="input" placeholder="Estimated value" value={form.estimatedValue} onChange={handleChange('estimatedValue')} />
              <select className="input" value={form.currency} onChange={handleChange('currency')}>
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>Other</option>
              </select>
              <input className="input" placeholder="Budget range" value={form.budget} onChange={handleChange('budget')} />
              <input className="input" placeholder="Timeline to purchase / decision" value={form.timeline} onChange={handleChange('timeline')} />
              <select className="input" value={form.priority} onChange={handleChange('priority')}>
                <option>Hot</option>
                <option>Warm</option>
                <option>Cold</option>
              </select>
              <select className="input" value={form.leadType} onChange={handleChange('leadType')}>
                <option>B2B</option>
                <option>B2C</option>
                <option>Enterprise</option>
              </select>
              <input className="input" placeholder="Lead score" value={form.leadScore} onChange={handleChange('leadScore')} />
              <input className="input" placeholder="Tags (comma separated)" value={form.tags} onChange={handleChange('tags')} />
            </div>
          </section>

          {/* Communication & Ownership */}
          <section className="p-3 bg-[rgba(250,253,250,0.6)] rounded">
            <h4 className="font-semibold text-gray-800 mb-2">Communication & Ownership</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input type="date" className="input" value={form.lastContactDate} onChange={handleChange('lastContactDate')} />
              <input type="date" className="input" value={form.nextFollowUp} onChange={handleChange('nextFollowUp')} />
              <select className="input" value={form.status} onChange={handleChange('status')}>
                <option>New</option>
                <option>Contacted</option>
                <option>In Negotiation</option>
                <option>Converted</option>
                <option>Lost</option>
                <option>On Hold</option>
              </select>
              <input className="input" placeholder="Assigned Salesperson (employee id)" value={form.assignedTo} onChange={handleChange('assignedTo')} />
            </div>
          </section>

          {/* Notes */}
          <section className="p-3 bg-[rgba(250,253,250,0.6)] rounded">
            <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
            <textarea className="input w-full h-32" placeholder="Notes / extra details" value={form.notes} onChange={handleChange('notes')} />
          </section>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-3">
            <button className="btn-muted px-4 py-2" onClick={onClose}>Cancel</button>
            <button className="btn px-4 py-2" onClick={submit} disabled={loading}>{loading ? 'Saving...' : 'Save Lead'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
