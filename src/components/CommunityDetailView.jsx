import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Lock,
  Pin,
  CheckCircle,
  Bookmark,
  MessageSquare,
  Send,
  AlertTriangle,
  X,
} from 'lucide-react';
import { api } from '../api';

export default function CommunityDetailView({
  communitySlug,
  currentUser,
  onBack,
  onRefreshInbox,
}) {
  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Post Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('discussion');
  const [isOfficial, setIsOfficial] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Replies State
  const [activeReplyMsg, setActiveReplyMsg] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');

  const loadChannelData = async () => {
    setLoading(true);
    setError(null);
    try {
      const commRes = await api.getCommunity(communitySlug);
      setCommunity(commRes.community);

      const msgRes = await api.getCommunityMessages(communitySlug);
      setMessages(msgRes.messages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannelData();
  }, [communitySlug, currentUser?.id]);

  const canPublishOfficial = () => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'faculty') {
      return community?.category === 'department' || community?.category === 'fe';
    }
    if (currentUser.role === 'club_lead') {
      return community?.name === currentUser.managedClub;
    }
    if (currentUser.role === 'warden') {
      return community?.category === 'hostel' && community?.hostelAssignment === currentUser.assignedHostel;
    }
    return false;
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSubmitting(true);
    try {
      await api.createMessage({
        communitySlug,
        title: newTitle,
        content: newContent,
        type: isOfficial ? 'notice' : newType,
        isOfficial,
      });
      setShowPostModal(false);
      setNewTitle('');
      setNewContent('');
      setIsOfficial(false);
      loadChannelData();
      if (onRefreshInbox) onRefreshInbox();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReplies = async (msg) => {
    setActiveReplyMsg(msg);
    try {
      const res = await api.getReplies(msg.id);
      setReplies(res.replies || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeReplyMsg) return;
    try {
      const res = await api.createReply(activeReplyMsg.id, replyText);
      setReplies([...replies, res.reply]);
      setReplyText('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleSave = async (msgId) => {
    try {
      await api.toggleSave(msgId);
      loadChannelData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading channel feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <button className="btn btn-sm btn-outline" onClick={onBack} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Communities
        </button>

        <div className="security-alert">
          <AlertTriangle size={24} style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Access Prohibited</h3>
            <p>{error}</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#7f1d1d' }}>
              Hostel communities are isolated to preserve student privacy and security. You can switch personas in the top bar to inspect permitted access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button className="btn btn-sm btn-outline" onClick={onBack} style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Back to Communities
      </button>

      {/* Channel Header Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span className="badge badge-official">{community?.category?.toUpperCase()}</span>
              {community?.isDemo && <span className="badge badge-demo">[DEMO CHANNEL]</span>}
              {community?.isRestricted && <span className="badge badge-restricted">RESTRICTED SPACE</span>}
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {community?.name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '800px' }}>
              {community?.description}
            </p>
          </div>

          <button className="btn btn-primary" onClick={() => setShowPostModal(true)}>
            <Plus size={16} />
            <span>Post in Channel</span>
          </button>
        </div>
      </div>

      {/* Channel Message Stream */}
      <div>
        {messages.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <h3>No messages posted yet in this channel</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Be the first to share an update or question with your peers.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message-card ${msg.isOfficial ? 'official' : ''}`}>
              <div className="message-card-header">
                <div>
                  <div className="author-meta">
                    <span className="author-name">{msg.authorDisplayName}</span>
                    <span className="author-badge">{msg.roleBadge}</span>
                    <span className="message-date">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
                    {msg.isOfficial && <span className="badge badge-official">[OFFICIAL]</span>}
                    {msg.isDemo && <span className="badge badge-demo">[DEMO]</span>}
                  </div>
                </div>
                {msg.isPinned && (
                  <span className="badge badge-official" style={{ fontSize: '0.65rem' }}>
                    <Pin size={10} /> PINNED
                  </span>
                )}
              </div>

              <h2 className="message-title">{msg.title}</h2>
              <p className="message-content">{msg.content}</p>

              <div className="message-actions">
                <button
                  className={`action-btn ${msg.isSaved ? 'active' : ''}`}
                  onClick={() => handleToggleSave(msg.id)}
                >
                  <Bookmark size={14} />
                  <span>{msg.isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  className="action-btn"
                  onClick={() => handleOpenReplies(msg)}
                  style={{ marginLeft: 'auto' }}
                >
                  <MessageSquare size={14} />
                  <span>Replies ({msg.repliesCount || 0})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post to {community?.name}</h2>
              <button className="btn btn-sm btn-outline" onClick={() => setShowPostModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Subject / Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Workshop Registration, Lab Timings"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Post Category</label>
                  <select
                    className="form-select"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <option value="discussion">Peer Discussion</option>
                    <option value="announcement">General Announcement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Message Details *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Provide full details, deadlines, links or instructions..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                  />
                </div>

                {/* Role Protected Official Notice Checkbox */}
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: canPublishOfficial() ? 'var(--color-primary-light)' : '#fef2f2',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: canPublishOfficial() ? 'var(--color-primary-border)' : '#fecaca',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: canPublishOfficial() ? 'pointer' : 'not-allowed',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: canPublishOfficial() ? 'var(--color-primary)' : '#991b1b',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isOfficial}
                      disabled={!canPublishOfficial()}
                      onChange={(e) => setIsOfficial(e.target.checked)}
                    />
                    <span>Publish as Official Institute Notice</span>
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {canPublishOfficial()
                      ? 'Authorized: Your role permits broadcasting official notices in this space.'
                      : 'Permission Denied: Only verified faculty, club leads, wardens, or administrators may publish official notices.'}
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowPostModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting}
                >
                  {submitting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {activeReplyMsg && (
        <div className="modal-overlay" onClick={() => setActiveReplyMsg(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Discussion Thread</h2>
              <button className="btn btn-sm btn-outline" onClick={() => setActiveReplyMsg(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700 }}>{activeReplyMsg.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activeReplyMsg.content}</div>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                {replies.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No replies yet.</div>
                ) : (
                  replies.map((r) => (
                    <div key={r.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>{r.authorDisplayName}: </span>
                      <span>{r.content}</span>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                />
                <button className="btn btn-primary btn-sm" onClick={handleSendReply}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
