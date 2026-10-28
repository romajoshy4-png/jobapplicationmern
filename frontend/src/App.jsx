import { useEffect, useState } from 'react';
import { BriefcaseBusiness, Plus, Search, RefreshCw } from 'lucide-react';
import { api } from './api';

const emptyForm = {
  companyName: '', jobRole: '', jobType: 'Full-time',
  appliedDate: new Date().toISOString().slice(0, 10), expectedSalary: '', notes: ''
};
const statuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'Accepted', 'Declined'];
const nextStatuses = {
  Applied: ['Interview', 'Rejected'], Interview: ['Offer', 'Rejected'],
  Offer: ['Accepted', 'Declined'], Rejected: [], Accepted: [], Declined: []
};
const dateText = (value) => value ? new Date(value).toLocaleDateString() : '—';

export default function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true); setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (companySearch.trim()) params.set('company', companySearch.trim());
      const data = await api.list(params.toString() ? `?${params}` : '');
      // API may return an array in this starter; extend it to return status counts as well.
      setItems(Array.isArray(data) ? data : (data.items || []));
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  useEffect(() => { load(); }, [statusFilter, companySearch]);

  function change(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function submit(e) {
    e.preventDefault(); setError(''); setMessage('');
    if (form.appliedDate > new Date().toISOString().slice(0, 10)) {
      setError('Applied date cannot be in the future'); return;
    }
    try {
      if (editing) await api.update(editing._id, form);
      else await api.create(form);
      setMessage(editing ? 'Application updated.' : 'Application added.');
      setForm(emptyForm); setEditing(null); await load();
    } catch (e) { setError(e.message); }
  }

  function edit(item) {
    setEditing(item);
    setForm({
      companyName: item.companyName, jobRole: item.jobRole, jobType: item.jobType,
      appliedDate: item.appliedDate?.slice(0, 10) || emptyForm.appliedDate,
      expectedSalary: item.expectedSalary ?? '', notes: item.notes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function updateStatus(item, status) {
    try { await api.changeStatus(item._id, status); setMessage('Status updated.'); await load(); }
    catch (e) { setError(e.message); }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item.companyName} — ${item.jobRole}?`)) return;
    try { await api.remove(item._id); setMessage('Application deleted.'); await load(); }
    catch (e) { setError(e.message); }
  }

  const counts = statuses.reduce((acc, status) => {
    acc[status] = items.filter((item) => item.status === status).length;
    return acc;
  }, {});

  return <main className="shell">
    <header className="topbar">
      <div className="brand"><span className="brand-icon"><BriefcaseBusiness size={22}/></span><div><strong>CareerTrack</strong><small>JOB APPLICATION MANAGER</small></div></div>
      <span className="live"><span/> Your next opportunity, organized</span>
    </header>

    <section className="hero">
      <div><p className="eyebrow">YOUR CAREER DASHBOARD</p><h1>Keep every opportunity<br/><em>moving forward.</em></h1><p className="hero-copy">A clear view of your applications, follow-ups, and next steps.</p></div>
      <div className="hero-mark"><BriefcaseBusiness size={76} strokeWidth={1}/></div>
    </section>

    {error && <div className="alert error">{error}</div>}
    {message && <div className="alert success">{message}</div>}

    <section className="stats">
      <div className="stat total"><span>Total shown</span><strong>{items.length}</strong><small>Based on current filters</small></div>
      {statuses.map((s) => <div className="stat" key={s}><span>{s}</span><strong>{counts[s]}</strong><small>Applications</small></div>)}
    </section>

    <section className="content-grid">
      <aside className="panel form-panel">
        <div className="panel-heading"><div><p className="eyebrow">{editing ? 'UPDATE DETAILS' : 'NEW OPPORTUNITY'}</p><h2>{editing ? 'Edit application' : 'Add an application'}</h2></div><span className="plus-icon"><Plus size={20}/></span></div>
        <form onSubmit={submit}>
          <label>Company name<input required value={form.companyName} onChange={e => change('companyName', e.target.value)} placeholder="e.g. Acme Inc."/></label>
          <label>Job role<input required value={form.jobRole} onChange={e => change('jobRole', e.target.value)} placeholder="e.g. Frontend Developer"/></label>
          <div className="two-col">
            <label>Job type<select value={form.jobType} onChange={e => change('jobType', e.target.value)}><option>Full-time</option><option>Internship</option><option>Contract</option></select></label>
            {!editing && <label>Applied date<input type="date" required max={new Date().toISOString().slice(0, 10)} value={form.appliedDate} onChange={e => change('appliedDate', e.target.value)}/></label>}
          </div>
          <label>Expected salary <span className="optional">OPTIONAL</span><input type="number" min="0" value={form.expectedSalary} onChange={e => change('expectedSalary', e.target.value)} placeholder="e.g. 600000"/></label>
          <label>Notes <span className="optional">OPTIONAL</span><textarea rows="3" value={form.notes} onChange={e => change('notes', e.target.value)} placeholder="Recruiter, interview notes, reminders…"/></label>
          <div className="form-actions"><button className="primary" type="submit">{editing ? 'Save changes' : 'Add application'} <span>→</span></button>{editing && <button type="button" className="secondary" onClick={() => {setEditing(null); setForm(emptyForm);}}>Cancel</button>}</div>
        </form>
        <p className="form-foot">Your application ID is generated by the server.</p>
      </aside>

      <section className="panel list-panel">
        <div className="panel-heading"><div><p className="eyebrow">APPLICATION PIPELINE</p><h2>Your applications <span className="count">{items.length}</span></h2></div><button className="icon-button" onClick={load} title="Refresh"><RefreshCw size={17}/></button></div>
        <div className="filters">
          <div className="search"><Search size={17}/><input value={companySearch} onChange={e => setCompanySearch(e.target.value)} placeholder="Search company…"/></div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">All statuses</option>{statuses.map(s => <option key={s}>{s}</option>)}</select>
        </div>
        {busy ? <div className="empty">Loading applications…</div> : items.length === 0 ? <div className="empty"><span className="empty-icon"><BriefcaseBusiness size={24}/></span><strong>No applications yet</strong><p>Add your first opportunity using the form.</p></div> :
          <div className="application-list">{items.map(item => <article className="application" key={item._id}>
            <div className="application-top"><div className="company-avatar">{(item.companyName || '?').slice(0, 1).toUpperCase()}</div><div className="job-info"><h3>{item.jobRole}</h3><p>{item.companyName}</p></div><span className={`badge ${item.status.toLowerCase()}`}>{item.status}</span></div>
            <div className="meta"><span><small>APPLICATION ID</small><strong>{item.applicationId}</strong></span><span><small>APPLIED</small><strong>{dateText(item.appliedDate)}</strong></span><span><small>FOLLOW-UP</small><strong>{dateText(item.followUpDate)}</strong></span></div>
            {item.isOverdue && <div className="overdue">Follow-up Overdue</div>}
            <div className="application-actions">
              <select aria-label="Change status" value="" disabled={!nextStatuses[item.status]?.length} onChange={e => e.target.value && updateStatus(item, e.target.value)}>
                <option value="">{nextStatuses[item.status]?.length ? 'Move to…' : 'No next status'}</option>
                {(nextStatuses[item.status] || []).map(s => <option key={s}>{s}</option>)}
              </select>
              <button className="text-button" onClick={() => edit(item)}>Edit</button>
              <button className="text-button danger-text" disabled={['Interview', 'Offer'].includes(item.status)} onClick={() => remove(item)}>Delete</button>
              <button className="text-button" onClick={async () => {
                try { const detail = await api.get(item._id); window.alert(`Status history\\n\\n${(detail.statusHistory || []).map(h => `${h.status} — ${new Date(h.changedAt).toLocaleString()}`).join('\\n') || 'No history yet'}`); }
                catch(e) { setError(e.message); }
              }}>History</button>
            </div>
          </article>)}</div>}
      </section>
    </section>
    <footer>CAREERTRACK <span>•</span> Built to keep your job search on track.</footer>
  </main>;
}
