import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);
  if (!stats) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
      {[
        { label: 'Total Users', value: stats.totalUsers },
        { label: 'Verified', value: stats.verifiedUsers },
        { label: 'Workouts Logged', value: stats.totalWorkouts },
        { label: 'Nutrition Logs', value: stats.totalNutritionLogs },
      ].map(s => (
        <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', isAdmin: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    api.get('/admin/users').then(r => { setUsers(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api.post('/admin/users', form);
      setUsers(prev => [res.data, ...prev]);
      setForm({ email: '', password: '', isAdmin: false });
      setCreating(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, email) => {
    if (!confirm(`Delete ${email}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch { alert('Failed to delete user'); }
  };

  const handleToggleAdmin = async (id, current) => {
    try {
      const res = await api.patch(`/admin/users/${id}`, { isAdmin: !current });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isAdmin: res.data.isAdmin } : u));
    } catch { alert('Failed to update user'); }
  };

  const handleResetPassword = async () => {
    if (!resetPassword || resetPassword.length < 6) { alert('Password must be at least 6 characters'); return; }
    try {
      await api.patch(`/admin/users/${resetTarget.id}`, { password: resetPassword });
      setResetTarget(null);
      setResetPassword('');
      alert('Password updated');
    } catch { alert('Failed to reset password'); }
  };

  if (loading) return <div className="loading-state"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title">Users ({users.length})</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>+ Create User</button>
      </div>

      {creating && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--accent)' }}>
          <h3 style={{ marginBottom: '1rem' }}>New User</h3>
          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" required />
              </div>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="isAdmin" checked={form.isAdmin} onChange={e => setForm(f => ({ ...f, isAdmin: e.target.checked }))} />
              <label htmlFor="isAdmin" style={{ marginBottom: 0 }}>Admin privileges</label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create User'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setCreating(false); setError(''); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <th style={th}>Email</th>
              <th style={th}>Status</th>
              <th style={th}>Role</th>
              <th style={th}>Workouts</th>
              <th style={th}>Check-ins</th>
              <th style={th}>Joined</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <td style={td}>
                  <div style={{ fontWeight: 500 }}>{u.email}</div>
                  {u.goal && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.goal}</div>}
                </td>
                <td style={td}>
                  <span style={{
                    padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem',
                    background: u.verified ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: u.verified ? '#16a34a' : '#dc2626',
                  }}>
                    {u.verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td style={td}>
                  <span style={{
                    padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem',
                    background: u.isAdmin ? 'rgba(99,102,241,0.15)' : 'var(--surface-2)',
                    color: u.isAdmin ? 'var(--accent)' : 'var(--text-secondary)',
                  }}>
                    {u.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td style={{ ...td, textAlign: 'center' }}>{u._count.workoutLogs}</td>
                <td style={{ ...td, textAlign: 'center' }}>{u._count.checkIns}</td>
                <td style={{ ...td, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ ...td }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.7rem' }}
                      onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                    >
                      {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.7rem' }}
                      onClick={() => { setResetTarget(u); setResetPassword(''); }}
                    >
                      Reset Pass
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.7rem', color: 'var(--error, #e74c3c)' }}
                      onClick={() => handleDelete(u.id, u.email)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reset password modal */}
      {resetTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setResetTarget(null)}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button className="modal-close" onClick={() => setResetTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Setting new password for <strong>{resetTarget.email}</strong>
              </p>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={e => setResetPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleResetPassword}>Set Password</button>
              <button className="btn btn-secondary" onClick={() => setResetTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Announcements Tab ────────────────────────────────────────────────────────

function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', pinned: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    api.get('/admin/announcements').then(r => { setAnnouncements(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api.post('/admin/announcements', form);
      setAnnouncements(prev => [res.data, ...prev]);
      setForm({ title: '', content: '', pinned: false });
      setCreating(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create announcement');
    } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch(`/admin/announcements/${editTarget.id}`, {
        title: editTarget.title, content: editTarget.content, pinned: editTarget.pinned,
      });
      setAnnouncements(prev => prev.map(a => a.id === res.data.id ? res.data : a));
      setEditTarget(null);
    } catch { alert('Failed to update'); } finally { setSaving(false); }
  };

  const handleTogglePin = async (a) => {
    try {
      const res = await api.patch(`/admin/announcements/${a.id}`, { pinned: !a.pinned });
      setAnnouncements(prev => prev.map(x => x.id === res.data.id ? res.data : x));
    } catch { alert('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch { alert('Failed to delete'); }
  };

  if (loading) return <div className="loading-state"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title">Announcements</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>+ New Announcement</button>
      </div>

      {creating && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--accent)' }}>
          <h3 style={{ marginBottom: '1rem' }}>New Announcement</h3>
          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. New feature available!" required autoFocus />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Write your announcement…"
                rows={4}
                required
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="pinned" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} />
              <label htmlFor="pinned" style={{ marginBottom: 0 }}>Pin to top of dashboard</label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Posting…' : 'Post Announcement'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setCreating(false); setError(''); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {announcements.length === 0 && !creating && (
        <p style={{ color: 'var(--text-secondary)' }}>No announcements yet.</p>
      )}

      {announcements.map(a => (
        <div key={a.id} className="card" style={{
          marginBottom: '1rem',
          borderLeft: a.pinned ? '3px solid var(--accent)' : '3px solid transparent',
        }}>
          {editTarget?.id === a.id ? (
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <input type="text" value={editTarget.title} onChange={e => setEditTarget(t => ({ ...t, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <textarea value={editTarget.content} onChange={e => setEditTarget(t => ({ ...t, content: e.target.value }))} rows={3} style={{ width: '100%', resize: 'vertical' }} required />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="checkbox" checked={editTarget.pinned} onChange={e => setEditTarget(t => ({ ...t, pinned: e.target.checked }))} id={`pin-${a.id}`} />
                <label htmlFor={`pin-${a.id}`} style={{ marginBottom: 0, fontSize: '0.875rem' }}>Pinned</label>
                <button className="btn btn-primary btn-sm" type="submit" disabled={saving} style={{ marginLeft: 'auto' }}>Save</button>
                <button className="btn btn-secondary btn-sm" type="button" onClick={() => setEditTarget(null)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    {a.pinned && <span style={{ fontSize: '0.7rem', background: 'var(--accent)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>PINNED</span>}
                    <span style={{ fontWeight: 600 }}>{a.title}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>{a.content}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', marginLeft: '1rem' }}>
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => handleTogglePin(a)}>
                    {a.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => setEditTarget({ ...a })}>Edit</button>
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', color: 'var(--error, #e74c3c)' }} onClick={() => handleDelete(a.id)}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Table styles ─────────────────────────────────────────────────────────────

const th = { padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' };
const td = { padding: '0.75rem 1rem', verticalAlign: 'middle' };

// ─── Admin Page ───────────────────────────────────────────────────────────────

function Admin() {
  const [tab, setTab] = useState('users');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) navigate('/dashboard');
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage users and announcements</p>
        </div>
      </div>

      <StatsBar />

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('users')}>Users</button>
        <button className={`btn ${tab === 'announcements' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('announcements')}>Announcements</button>
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'announcements' && <AnnouncementsTab />}
    </>
  );
}

export default Admin;
