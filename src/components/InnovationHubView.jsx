import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Briefcase,
  Layers,
  Heart,
  MessageSquare,
  Users,
  Search,
  Plus,
  Send,
  ExternalLink,
  CheckCircle,
  Clock,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { api } from '../api';

export default function InnovationHubView({
  currentUser,
  onOpenNewIdeaModal,
}) {
  const [activeTab, setActiveTab] = useState('ideas'); // ideas, opportunities, projects, my_applications
  const [ideas, setIdeas] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [seekingTeammatesOnly, setSeekingTeammatesOnly] = useState(false);

  // Idea Comments Modal
  const [activeIdeaComments, setActiveIdeaComments] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [commentText, setCommentText] = useState('');

  // Apply Opportunity Modal
  const [activeApplyOpp, setActiveApplyOpp] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);

  // New Opportunity Modal (Verified Alumni / Admin only)
  const [showPostOppModal, setShowPostOppModal] = useState(false);
  const [oppTitle, setOppTitle] = useState('');
  const [oppCompany, setOppCompany] = useState('');
  const [oppRole, setOppRole] = useState('');
  const [oppType, setOppType] = useState('Internship');
  const [oppStipend, setOppStipend] = useState('');
  const [oppDesc, setOppDesc] = useState('');
  const [oppDeadline, setOppDeadline] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ideasRes, oppsRes, projsRes, appsRes] = await Promise.all([
        api.getIdeas(),
        api.getOpportunities(),
        api.getProjects(),
        api.getMyApplications(),
      ]);
      setIdeas(ideasRes.ideas || []);
      setOpportunities(oppsRes.opportunities || []);
      setProjects(projsRes.projects || []);
      setMyApplications(appsRes.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.id]);

  const handleToggleLike = async (ideaId) => {
    try {
      const res = await api.toggleLikeIdea(ideaId);
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideaId ? { ...i, hasLiked: res.hasLiked, likesCount: res.likesCount } : i
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenComments = async (idea) => {
    setActiveIdeaComments(idea);
    try {
      const res = await api.getIdeaComments(idea.id);
      setCommentsList(res.comments || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !activeIdeaComments) return;
    try {
      const res = await api.addIdeaComment(activeIdeaComments.id, commentText);
      setCommentsList([...commentsList, res.comment]);
      setCommentText('');
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === activeIdeaComments.id
            ? { ...i, commentsCount: (i.commentsCount || 0) + 1 }
            : i
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!activeApplyOpp) return;
    setSubmittingApp(true);
    try {
      await api.applyToOpportunity(activeApplyOpp.id, { coverNote, resumeUrl });
      alert('Application submitted successfully!');
      setActiveApplyOpp(null);
      setCoverNote('');
      setResumeUrl('');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    try {
      await api.createOpportunity({
        title: oppTitle,
        company: oppCompany,
        role: oppRole,
        type: oppType,
        stipend: oppStipend,
        description: oppDesc,
        deadline: oppDeadline,
      });
      setShowPostOppModal(false);
      setOppTitle('');
      setOppCompany('');
      setOppRole('');
      setOppDesc('');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const canPostOpportunity = () => {
    if (!currentUser) return false;
    return (
      currentUser.role === 'admin' ||
      currentUser.role === 'faculty' ||
      (currentUser.role === 'alumni' && currentUser.verified === true)
    );
  };

  // Filter ideas
  let filteredIdeas = ideas;
  if (selectedCategory !== 'all') {
    filteredIdeas = filteredIdeas.filter(
      (i) => i.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }
  if (seekingTeammatesOnly) {
    filteredIdeas = filteredIdeas.filter((i) => i.seekingTeammates);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredIdeas = filteredIdeas.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.tags && i.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-official">AIT INNOVATION CELL</span>
            <span className="badge badge-demo">[ACTIVE COLLABORATION ENGINE]</span>
          </div>
          <h1>Innovation Hub & Opportunities</h1>
          <p>
            Submit student research concepts, discover teammates, apply for verified alumni roles, and track project milestones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onOpenNewIdeaModal}>
            <Plus size={16} />
            <span>Submit New Idea</span>
          </button>
          {canPostOpportunity() && (
            <button className="btn btn-secondary" onClick={() => setShowPostOppModal(true)}>
              <Briefcase size={16} />
              <span>Post Verified Opportunity</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          className={`action-btn ${activeTab === 'ideas' ? 'active' : ''}`}
          style={{ padding: '0.65rem 1.1rem', fontSize: '0.9rem' }}
          onClick={() => setActiveTab('ideas')}
        >
          <Lightbulb size={16} />
          <span>Ideas & Collaboration ({ideas.length})</span>
        </button>

        <button
          className={`action-btn ${activeTab === 'opportunities' ? 'active' : ''}`}
          style={{ padding: '0.65rem 1.1rem', fontSize: '0.9rem' }}
          onClick={() => setActiveTab('opportunities')}
        >
          <Briefcase size={16} />
          <span>Opportunities & Internships ({opportunities.length})</span>
        </button>

        <button
          className={`action-btn ${activeTab === 'projects' ? 'active' : ''}`}
          style={{ padding: '0.65rem 1.1rem', fontSize: '0.9rem' }}
          onClick={() => setActiveTab('projects')}
        >
          <Layers size={16} />
          <span>Project Showcase ({projects.length})</span>
        </button>

        <button
          className={`action-btn ${activeTab === 'my_applications' ? 'active' : ''}`}
          style={{ padding: '0.65rem 1.1rem', fontSize: '0.9rem' }}
          onClick={() => setActiveTab('my_applications')}
        >
          <CheckCircle size={16} />
          <span>My Applications ({myApplications.length})</span>
        </button>
      </div>

      {/* TAB 1: IDEAS DISCOVERY */}
      {activeTab === 'ideas' && (
        <div>
          {/* Filters Bar */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '10px', top: '10px' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '32px' }}
                placeholder="Search ideas by domain, tech stack, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '180px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Domains</option>
              <option value="defense tech">Defense Tech</option>
              <option value="cleantech">CleanTech</option>
              <option value="healthcare & ai">Healthcare & AI</option>
              <option value="general innovation">General Innovation</option>
            </select>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={seekingTeammatesOnly}
                onChange={(e) => setSeekingTeammatesOnly(e.target.checked)}
              />
              <span>Seeking Teammates Only</span>
            </label>
          </div>

          {/* Ideas Grid */}
          <div className="grid-2">
            {filteredIdeas.map((idea) => (
              <div key={idea.id} className="card card-hover" style={{ display: 'flex', flexFlow: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-official">{idea.category}</span>
                    {idea.isDemo && <span className="badge badge-demo">[DEMO IDEA]</span>}
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    {idea.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                    {idea.description}
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {idea.tags?.map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          color: 'var(--text-muted)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Teammate Recruiting Callout */}
                  {idea.seekingTeammates && (
                    <div
                      style={{
                        padding: '0.65rem 0.75rem',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '0.75rem',
                        fontSize: '0.8rem',
                        color: '#166534',
                      }}
                    >
                      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Users size={14} /> Seeking Collaborators
                      </div>
                      <div style={{ marginTop: '0.2rem' }}>
                        Required: {idea.neededSkills?.join(', ') || 'Interdisciplinary peers'}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    marginTop: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Proposed by <strong>{idea.authorDisplayName}</strong>
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className={`action-btn ${idea.hasLiked ? 'active' : ''}`}
                      onClick={() => handleToggleLike(idea.id)}
                    >
                      <Heart size={14} fill={idea.hasLiked ? 'currentColor' : 'none'} />
                      <span>{idea.likesCount || 0}</span>
                    </button>

                    <button className="action-btn" onClick={() => handleOpenComments(idea)}>
                      <MessageSquare size={14} />
                      <span>{idea.commentsCount || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {opportunities.map((opp) => (
            <div key={opp.id} className="card card-hover" style={{ borderLeft: '4px solid #16a34a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span className="badge badge-verified">
                      <CheckCircle size={10} /> VERIFIED BY ALUMNI / FACULTY
                    </span>
                    {opp.isDemo && <span className="badge badge-demo">[DEMO]</span>}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {opp.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    <strong>{opp.company}</strong> • Posted by {opp.authorDisplayName} • {opp.location}
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveApplyOpp(opp)}
                >
                  Apply Now
                </button>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.75rem 0' }}>
                {opp.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.65rem',
                  flexWrap: 'wrap',
                }}
              >
                <div><strong>Role:</strong> {opp.role}</div>
                <div><strong>Type:</strong> {opp.type}</div>
                <div><strong>Stipend / Comp:</strong> {opp.stipend}</div>
                <div><strong>Deadline:</strong> {opp.deadline}</div>
                <div><strong>Applications:</strong> {opp.applicationsCount || 0}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: PROJECT SHOWCASE & MILESTONES */}
      {activeTab === 'projects' && (
        <div className="grid-2">
          {projects.map((proj) => (
            <div key={proj.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-official">{proj.category}</span>
                <span className="badge badge-verified">{proj.status}</span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                {proj.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                {proj.description}
              </p>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Lead: <strong>{proj.leadDisplayName}</strong>
              </div>

              {/* Milestones Progression */}
              <div style={{ backgroundColor: 'var(--bg-surface-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  Project Milestones & Validation:
                </div>
                {proj.milestones?.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', margin: '0.2rem 0' }}>
                    {m.completed ? (
                      <CheckCircle2 size={13} color="#16a34a" />
                    ) : (
                      <Clock size={13} color="#ca8a04" />
                    )}
                    <span style={{ textDecoration: m.completed ? 'line-through' : 'none', color: m.completed ? 'var(--text-muted)' : 'var(--text-main)' }}>
                      {m.title} ({m.date})
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {proj.repoUrl && (
                  <a
                    href={proj.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline"
                    style={{ flex: 1 }}
                  >
                    <span>View Repository</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: MY APPLICATIONS */}
      {activeTab === 'my_applications' && (
        <div>
          {myApplications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <h3>No submitted applications yet</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Browse verified opportunities posted by alumni and faculty to apply.
              </p>
            </div>
          ) : (
            myApplications.map((app) => (
              <div key={app.id} className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{app.opportunityTitle}</h3>
                  <span className="badge badge-official">{app.status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {app.company} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Note:</strong> {app.coverNote}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Idea Comments Modal */}
      {activeIdeaComments && (
        <div className="modal-overlay" onClick={() => setActiveIdeaComments(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Innovation Discussion & Mentorship</h2>
              <button className="btn btn-sm btn-outline" onClick={() => setActiveIdeaComments(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700 }}>{activeIdeaComments.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{activeIdeaComments.description}</div>
              </div>

              <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '1rem' }}>
                {commentsList.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No feedback or mentorship comments yet.</div>
                ) : (
                  commentsList.map((c) => (
                    <div key={c.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 700 }}>{c.authorDisplayName}: </span>
                      <span>{c.content}</span>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ask a technical question or offer mentorship..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button className="btn btn-primary btn-sm" onClick={handleAddComment}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Application Modal */}
      {activeApplyOpp && (
        <div className="modal-overlay" onClick={() => setActiveApplyOpp(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply for Opportunity</h2>
              <button className="btn btn-sm btn-outline" onClick={() => setActiveApplyOpp(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleApplySubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700 }}>{activeApplyOpp.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{activeApplyOpp.company}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Statement of Interest / Cover Note *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Describe your technical background, projects built, and how you can contribute..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Resume Link or Portfolio URL *</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/my-resume.pdf or GitHub URL"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveApplyOpp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingApp}>
                  {submittingApp ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Verified Opportunity Modal */}
      {showPostOppModal && (
        <div className="modal-overlay" onClick={() => setShowPostOppModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post Verified Campus Opportunity</h2>
              <button className="btn btn-sm btn-outline" onClick={() => setShowPostOppModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateOpportunity}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Position Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Systems Engineer Intern"
                    value={oppTitle}
                    onChange={(e) => setOppTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company / Lab Organization *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Microsoft, DRDO, AIT R&D"
                    value={oppCompany}
                    onChange={(e) => setOppCompany(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role Focus *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Backend Development, Embedded C++"
                    value={oppRole}
                    onChange={(e) => setOppRole(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type & Compensation</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <select className="form-select" value={oppType} onChange={(e) => setOppType(e.target.value)}>
                      <option value="Internship">Internship</option>
                      <option value="Full-Time Role">Full-Time Role</option>
                      <option value="Research Fellowship">Research Fellowship</option>
                      <option value="Mentorship">Mentorship</option>
                    </select>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ₹50,000 / month"
                      value={oppStipend}
                      onChange={(e) => setOppStipend(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Application Requirements *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Role responsibilities, eligibility batch, interview timeline..."
                    value={oppDesc}
                    onChange={(e) => setOppDesc(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowPostOppModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Publish Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
