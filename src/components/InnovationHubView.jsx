import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Briefcase,
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
  UserCheck,
} from 'lucide-react';
import { api } from '../api';

export default function InnovationHubView({
  currentUser,
  onOpenNewIdeaModal,
}) {
  // Exactly 4 tabs as required:
  // 1. ideas_projects: Ideas & Projects
  // 2. opportunities: Alumni Opportunities
  // 3. my_applications: My Applications
  // 4. verification_workflow: Alumni Verification Workflow
  const [activeTab, setActiveTab] = useState('ideas_projects');

  // Sub-filter for Ideas & Projects
  const [ideasProjectsFilter, setIdeasProjectsFilter] = useState('all'); // all, ideas, projects

  const [ideas, setIdeas] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [verifications, setVerifications] = useState([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // new state for idea category filter
  const [seekingTeammatesOnly, setSeekingTeammatesOnly] = useState(false); // filter to show only ideas seeking teammates

  // Idea Comments Modal
  const [activeIdeaComments, setActiveIdeaComments] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [commentText, setCommentText] = useState('');

  // Apply Opportunity Modal
  const [activeApplyOpp, setActiveApplyOpp] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);

  // New Opportunity Modal
  const [showPostOppModal, setShowPostOppModal] = useState(false);
  const [oppTitle, setOppTitle] = useState('');
  const [oppCompany, setOppCompany] = useState('');
  const [oppRole, setOppRole] = useState('');
  const [oppType, setOppType] = useState('Internship');
  const [oppStipend, setOppStipend] = useState('');
  const [oppDesc, setOppDesc] = useState('');

  // Alumni Verification Registration Form
  const [gradYear, setGradYear] = useState('2024');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [submittingAlumni, setSubmittingAlumni] = useState(false);

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

      if (currentUser?.role === 'admin') {
        try {
          const verRes = await api.getPendingAlumni();
          setVerifications(verRes.verifications || []);
        } catch {
          // Non-admin may not have access
        }
      }
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

  const handleRegisterAlumni = async (e) => {
    e.preventDefault();
    setSubmittingAlumni(true);
    try {
      await api.registerAlumni({
        graduationYear: gradYear,
        company,
        designation,
        linkedInUrl: linkedIn,
      });
      alert('Alumni registration submitted! Your request is pending Administrator review.');
      setCompany('');
      setDesignation('');
      setLinkedIn('');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingAlumni(false);
    }
  };

  const handleReviewAlumni = async (id, approve) => {
    try {
      await api.reviewAlumni(id, approve);
      alert(`Alumni verification ${approve ? 'APPROVED' : 'REJECTED'}`);
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
            <span className="badge badge-demo">DEMO COLLABORATION</span>
          </div>
          <h1>Innovation Hub</h1>
          <p>
            Student research concepts, peer collaboration, verified alumni opportunities, and project showcases.
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
              <span>Post Opportunity</span>
            </button>
          )}
        </div>
      </div>

      {/* Exactly 4 Tabs - Only one section visible at a time */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}
      >
        <button
          className={`action-btn ${activeTab === 'ideas_projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('ideas_projects')}
        >
          <Lightbulb size={16} />
          <span>Ideas & Projects ({ideas.length + projects.length})</span>
        </button>

        <button
          className={`action-btn ${activeTab === 'opportunities' ? 'active' : ''}`}
          onClick={() => setActiveTab('opportunities')}
        >
          <Briefcase size={16} />
          <span>Alumni Opportunities ({opportunities.length})</span>
        </button>

        <button
          className={`action-btn ${activeTab === 'my_applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_applications')}
        >
          <CheckCircle size={16} />
          <span>My Applications ({myApplications.length})</span>
        </button>

        <button
          className={`action-btn ${activeTab === 'verification_workflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('verification_workflow')}
        >
          <UserCheck size={16} />
          <span>Alumni Verification Workflow</span>
        </button>
      </div>

      {/* TAB 1: IDEAS & PROJECTS (SINGLE COLUMN, MAX-WIDTH 900PX) */}
      {activeTab === 'ideas_projects' && (
        <div className="single-col-cards">
          {/* Sub-filter & Search Bar */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn btn-sm ${ideasProjectsFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setIdeasProjectsFilter('all')}
              >
                All ({ideas.length + projects.length})
              </button>
              <button
                className={`btn btn-sm ${ideasProjectsFilter === 'ideas' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setIdeasProjectsFilter('ideas')}
              >
                Ideas ({ideas.length})
              </button>
              <button
                className={`btn btn-sm ${ideasProjectsFilter === 'projects' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setIdeasProjectsFilter('projects')}
              >
                Projects ({projects.length})
              </button>
            </div>

            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '10px', top: '12px' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '34px' }}
                placeholder="Search ideas & projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Ideas List */}
          {(ideasProjectsFilter === 'all' || ideasProjectsFilter === 'ideas') && (
            <>
              {filteredIdeas.map((idea) => (
                <div key={idea.id} className="card card-hover">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge badge-official">IDEA: {idea.category}</span>
                      <span className="badge badge-demo">DEMO</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="card-title">{idea.title}</h3>
                  <p className="card-description">{idea.description}</p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                    {idea.tags?.map((t, idx) => (
                      <span key={idx} className="tag-chip">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Teammate Recruiting Callout */}
                  {idea.seekingTeammates && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '0.85rem',
                        fontSize: '0.9rem',
                        color: '#166534',
                      }}
                    >
                      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Users size={16} /> Seeking Collaborators
                      </div>
                      <div style={{ marginTop: '0.25rem' }}>
                        Required: <strong>{idea.neededSkills?.join(', ') || 'Interdisciplinary peers'}</strong>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Proposed by <strong>{idea.authorDisplayName}</strong>
                    </span>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className={`action-btn ${idea.hasLiked ? 'active' : ''}`}
                        onClick={() => handleToggleLike(idea.id)}
                      >
                        <Heart size={16} fill={idea.hasLiked ? 'currentColor' : 'none'} />
                        <span>{idea.likesCount || 0} Likes</span>
                      </button>

                      <button className="action-btn" onClick={() => handleOpenComments(idea)}>
                        <MessageSquare size={16} />
                        <span>{idea.commentsCount || 0} Comments</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Projects List */}
          {(ideasProjectsFilter === 'all' || ideasProjectsFilter === 'projects') && (
            <>
              {projects.map((proj) => (
                <div key={proj.id} className="card card-hover" style={{ borderLeft: '4px solid #2563eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span className="badge badge-official">PROJECT: {proj.category}</span>
                      <span className="badge badge-demo">DEMO</span>
                    </div>
                    <span className="badge badge-verified">{proj.status}</span>
                  </div>

                  <h3 className="card-title">{proj.title}</h3>
                  <p className="card-description">{proj.description}</p>

                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Lead: <strong>{proj.leadDisplayName}</strong>
                  </div>

                  {/* Milestones Progression */}
                  <div style={{ backgroundColor: 'var(--bg-surface-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.85rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                      Milestones & Validation:
                    </div>
                    {proj.milestones?.map((m, idx) => (
                      <div key={idx} className={`milestone-item ${m.completed ? 'completed' : ''}`}>
                        {m.completed ? (
                          <CheckCircle2 size={16} color="#16a34a" />
                        ) : (
                          <Clock size={16} color="#ca8a04" />
                        )}
                        <span>
                          {m.title} ({m.date})
                        </span>
                      </div>
                    ))}
                  </div>

                  {proj.repoUrl && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline"
                      >
                        <span>View Repository</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* TAB 2: ALUMNI OPPORTUNITIES (SINGLE COLUMN, MAX-WIDTH 900PX) */}
      {activeTab === 'opportunities' && (
        <div className="single-col-cards">
          {opportunities.map((opp) => (
            <div key={opp.id} className="card card-hover" style={{ borderLeft: '4px solid #16a34a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="badge badge-verified">
                      <CheckCircle size={12} /> ALUMNI VERIFIED
                    </span>
                    <span className="badge badge-demo">DEMO</span>
                  </div>
                  <h3 className="card-title">{opp.title}</h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <strong>{opp.company}</strong> • Posted by {opp.authorDisplayName} • {opp.location}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setActiveApplyOpp(opp)}
                >
                  Apply Now
                </button>
              </div>

              <p className="card-description" style={{ margin: '0.85rem 0' }}>
                {opp.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <div><strong>Role:</strong> {opp.role}</div>
                <div><strong>Type:</strong> {opp.type}</div>
                <div><strong>Stipend:</strong> {opp.stipend}</div>
                <div><strong>Deadline:</strong> {opp.deadline}</div>
                <div><strong>Applications:</strong> {opp.applicationsCount || 0}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: MY APPLICATIONS (SINGLE COLUMN, MAX-WIDTH 900PX) */}
      {activeTab === 'my_applications' && (
        <div className="single-col-cards">
          {myApplications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <h3>No submitted applications yet</h3>
              <p style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Explore the Alumni Opportunities tab to submit applications for internships and mentorship roles.
              </p>
            </div>
          ) : (
            myApplications.map((app) => (
              <div key={app.id} className="card card-hover">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 className="card-title">{app.opportunityTitle}</h3>
                  <span className="badge badge-official">{app.status}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {app.company} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  <strong>Statement of Interest:</strong> {app.coverNote}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: ALUMNI VERIFICATION WORKFLOW (SINGLE COLUMN, MAX-WIDTH 900PX) */}
      {activeTab === 'verification_workflow' && (
        <div className="single-col-cards">
          {/* Status for current user */}
          <div className="card">
            <h3 className="card-title">Alumni & Mentor Verification Status</h3>
            <p className="card-description">
              Only verified AIT alumni and faculty members can publish verified opportunities and research positions.
            </p>

            {currentUser?.role === 'alumni' ? (
              currentUser.verified ? (
                <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                  <div style={{ color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} /> Verified AIT Alumni Account
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#166534', marginTop: '0.25rem' }}>
                    {currentUser.company} • Class of {currentUser.graduationYear}. You are authorized to post campus opportunities.
                  </p>
                </div>
              ) : (
                <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
                  <div style={{ color: '#92400e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} /> Pending Verification Review
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#92400e', marginTop: '0.25rem' }}>
                    Your alumni credentials have been submitted and are pending Administrator verification.
                  </p>
                </div>
              )
            ) : (
              <div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Are you an AIT graduate? Submit your graduation details and current professional organization to unlock alumni privileges.
                </p>

                <form onSubmit={handleRegisterAlumni}>
                  <div className="form-group">
                    <label className="form-label">Graduation Year *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Company / Organization *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Microsoft, Qualcomm, DRDO"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation / Role *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Member of Technical Staff, Team Lead"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedIn}
                      onChange={(e) => setLinkedIn(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submittingAlumni}>
                    {submittingAlumni ? 'Submitting...' : 'Submit Verification Request'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Admin Review Console if Admin */}
          {currentUser?.role === 'admin' && (
            <div className="card">
              <h3 className="card-title">Administrator Review Queue</h3>
              <p className="card-description">
                Approve or reject submitted alumni credentials before verified badges are issued.
              </p>

              {verifications.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No verification requests currently pending.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {verifications.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{v.displayName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {v.designation} at {v.company} (Class of {v.graduationYear})
                        </div>
                      </div>

                      {v.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleReviewAlumni(v.id, true)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleReviewAlumni(v.id, false)}
                            style={{ color: '#dc2626' }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`badge ${v.status === 'approved' ? 'badge-verified' : 'badge-restricted'}`}>
                          {v.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Idea Comments Modal */}
      {activeIdeaComments && (
        <div className="modal-overlay" onClick={() => setActiveIdeaComments(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Discussion & Mentorship</h2>
              <button className="btn btn-sm btn-outline" onClick={() => setActiveIdeaComments(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem', padding: '0.85rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{activeIdeaComments.title}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {activeIdeaComments.description}
                </div>
              </div>

              <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '1rem' }}>
                {commentsList.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No feedback comments yet.</div>
                ) : (
                  commentsList.map((c) => (
                    <div key={c.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}>
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
                  placeholder="Share feedback or offer mentorship..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button className="btn btn-primary" onClick={handleAddComment}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Opportunity Modal */}
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
                <div style={{ marginBottom: '1rem', padding: '0.85rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{activeApplyOpp.title}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{activeApplyOpp.company}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Statement of Interest / Cover Note *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Describe your relevant projects, engineering coursework, and interests..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Resume Link or GitHub Portfolio URL *</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/resume.pdf"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveApplyOpp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingApp}>
                  {submittingApp ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Opportunity Modal */}
      {showPostOppModal && (
        <div className="modal-overlay" onClick={() => setShowPostOppModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post Campus Opportunity</h2>
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
                  <label className="form-label">Company / Organization *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Microsoft, Qualcomm, DRDO"
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
                    placeholder="e.g. Embedded C++, Backend Development"
                    value={oppRole}
                    onChange={(e) => setOppRole(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type & Stipend</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <select className="form-select" value={oppType} onChange={(e) => setOppType(e.target.value)}>
                      <option value="Internship">Internship</option>
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
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Role responsibilities and eligibility..."
                    value={oppDesc}
                    onChange={(e) => setOppDesc(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPostOppModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
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
