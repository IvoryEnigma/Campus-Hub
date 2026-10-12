import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  Bookmark,
  Pin,
  MessageSquare,
  Settings,
  ShieldCheck,
  Send,
  X,
} from 'lucide-react';
import { api } from '../api';

export default function InboxView({
  inboxData,
  communities,
  currentUser,
  onRefreshInbox,
}) {
  const [activeTab, setActiveTab] = useState('all'); // all, unread, pinned, saved
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReplyMessage, setActiveReplyMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    announcements: true,
    hostel: true,
    opportunities: true,
    mentions: true,
  });

  const messages = inboxData?.messages || [];
  const counts = inboxData?.counts || { total: 0, unread: 0, pinned: 0, saved: 0 };

  const handleMarkRead = async (msgId) => {
    try {
      await api.markRead(msgId);
      onRefreshInbox();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSave = async (msgId) => {
    try {
      await api.toggleSave(msgId);
      onRefreshInbox();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (msgId) => {
    try {
      await api.togglePin(msgId);
      onRefreshInbox();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenReplies = async (msg) => {
    setActiveReplyMessage(msg);
    setLoadingReplies(true);
    try {
      const res = await api.getReplies(msg.id);
      setReplies(res.replies || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeReplyMessage) return;
    try {
      const res = await api.createReply(activeReplyMessage.id, replyText);
      setReplies([...replies, res.reply]);
      setReplyText('');
      onRefreshInbox();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter messages client-side or trigger fetch
  let displayedMessages = messages;
  if (activeTab === 'unread') {
    displayedMessages = displayedMessages.filter((m) => !m.isRead);
  } else if (activeTab === 'pinned') {
    displayedMessages = displayedMessages.filter((m) => m.isPinned);
  } else if (activeTab === 'saved') {
    displayedMessages = displayedMessages.filter((m) => m.isSaved);
  }

  if (selectedSource) {
    displayedMessages = displayedMessages.filter((m) => m.communitySlug === selectedSource);
  }
  if (selectedType !== 'all') {
    displayedMessages = displayedMessages.filter((m) => m.type === selectedType);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedMessages = displayedMessages.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.authorDisplayName.toLowerCase().includes(q)
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1>Unified Campus Inbox</h1>
          <p>
            Central inbox for authorized announcements, official notices, and community discussions.
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowPreferences(true)}
        >
          <Settings size={14} />
          <span>Notification Preferences</span>
        </button>
      </div>

      {/* Inbox Tabs & Counts */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem',
        }}
      >
        <button
          className={`action-btn ${activeTab === 'all' ? 'active' : ''}`}
          style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
          onClick={() => setActiveTab('all')}
        >
          All Messages ({counts.total})
        </button>
        <button
          className={`action-btn ${activeTab === 'unread' ? 'active' : ''}`}
          style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
          onClick={() => setActiveTab('unread')}
        >
          Unread ({counts.unread})
        </button>
        <button
          className={`action-btn ${activeTab === 'pinned' ? 'active' : ''}`}
          style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
          onClick={() => setActiveTab('pinned')}
        >
          Pinned ({counts.pinned})
        </button>
        <button
          className={`action-btn ${activeTab === 'saved' ? 'active' : ''}`}
          style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
          onClick={() => setActiveTab('saved')}
        >
          Saved ({counts.saved})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '10px', top: '10px' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '32px' }}
            placeholder="Search by keywords, author, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
        >
          <option value="">All Accessible Sources</option>
          {communities
            .filter((c) => c.hasAccess)
            .map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '140px' }}
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="notice">Official Notices</option>
          <option value="announcement">Announcements</option>
          <option value="discussion">Discussions</option>
        </select>
      </div>

      {/* Message List */}
      <div>
        {displayedMessages.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}
          >
            <h3>No messages found matching your filters</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Try adjusting the tab, category, or search keywords.
            </p>
          </div>
        ) : (
          displayedMessages.map((msg) => (
            <div
              key={msg.id}
              className={`message-card ${msg.isOfficial ? 'official' : ''}`}
              style={{
                backgroundColor: msg.isRead ? 'white' : '#f8faff',
              }}
            >
              <div className="message-card-header">
                <div>
                  <div className="author-meta">
                    <span className="author-name">{msg.authorDisplayName}</span>
                    <span className="author-badge">{msg.communitySlug}</span>
                    <span className="message-date">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
                    {msg.isOfficial && <span className="badge badge-official">[OFFICIAL]</span>}
                    {msg.isDemo && <span className="badge badge-demo">[DEMO]</span>}
                    {!msg.isRead && (
                      <span className="badge badge-official" style={{ fontSize: '0.65rem' }}>
                        NEW
                      </span>
                    )}
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
                  className={`action-btn ${msg.isRead ? 'active' : ''}`}
                  onClick={() => handleMarkRead(msg.id)}
                >
                  <CheckCircle size={14} />
                  <span>{msg.isRead ? 'Marked Read' : 'Mark as Read'}</span>
                </button>

                <button
                  className={`action-btn ${msg.isSaved ? 'active' : ''}`}
                  onClick={() => handleToggleSave(msg.id)}
                >
                  <Bookmark size={14} />
                  <span>{msg.isSaved ? 'Saved' : 'Save'}</span>
                </button>

                {(currentUser?.role === 'admin' ||
                  currentUser?.role === 'faculty' ||
                  currentUser?.role === 'club_lead') && (
                  <button
                    className={`action-btn ${msg.isPinned ? 'active' : ''}`}
                    onClick={() => handleTogglePin(msg.id)}
                  >
                    <Pin size={14} />
                    <span>{msg.isPinned ? 'Unpin' : 'Pin'}</span>
                  </button>
                )}

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

      {/* Reply Modal / Drawer */}
      {activeReplyMessage && (
        <div className="modal-overlay" onClick={() => setActiveReplyMessage(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Discussion Thread & Replies</h2>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setActiveReplyMessage(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  {activeReplyMessage.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {activeReplyMessage.content}
                </div>
              </div>

              <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '1rem' }}>
                {loadingReplies ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                    Loading replies...
                  </div>
                ) : replies.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                    No replies yet. Be the first to respond!
                  </div>
                ) : (
                  replies.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      >
                        <span>{r.authorDisplayName}</span>
                        <span style={{ color: 'var(--text-light)', fontSize: '0.7rem' }}>
                          {new Date(r.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={{ marginTop: '0.2rem', color: 'var(--text-secondary)' }}>
                        {r.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Write a constructive reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                />
                <button className="btn btn-primary btn-sm" onClick={handleSendReply}>
                  <Send size={14} />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      {showPreferences && (
        <div className="modal-overlay" onClick={() => setShowPreferences(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Notification Preferences</h2>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setShowPreferences(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Choose which types of campus activity trigger in-app notification indicators.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={notifPrefs.announcements}
                    onChange={(e) =>
                      setNotifPrefs({ ...notifPrefs, announcements: e.target.checked })
                    }
                  />
                  <span>Official Academic & Department Announcements</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={notifPrefs.hostel}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, hostel: e.target.checked })}
                  />
                  <span>Authorized Hostel Notices & Maintenance Alerts</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={notifPrefs.opportunities}
                    onChange={(e) =>
                      setNotifPrefs({ ...notifPrefs, opportunities: e.target.checked })
                    }
                  />
                  <span>Verified Alumni Internship & Mentorship Opportunities</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={notifPrefs.mentions}
                    onChange={(e) =>
                      setNotifPrefs({ ...notifPrefs, mentions: e.target.checked })
                    }
                  />
                  <span>Innovation Hub Collaboration & Teammate Requests</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowPreferences(false)}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
