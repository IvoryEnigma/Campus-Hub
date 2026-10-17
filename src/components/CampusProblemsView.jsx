import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  MessageSquare,
  Lightbulb,
  Plus,
  Search,
  ShieldCheck,
  Send,
  Flag,
  X,
} from 'lucide-react';
import { api } from '../api';

export default function CampusProblemsView({
  currentUser,
  onNavigateToInnovation,
}) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedScope, setSelectedScope] = useState('all');
  const [selectedSort, setSelectedSort] = useState('most_affected');

  // New Problem Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hostel Life');
  const [location, setLocation] = useState('');
  const [timeOfDayAffected, setTimeOfDayAffected] = useState('All day');
  const [whoIsAffected, setWhoIsAffected] = useState('All Students');
  const [severity, setSeverity] = useState('medium');
  const [scope, setScope] = useState('Whole campus');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingProblem, setSubmittingProblem] = useState(false);

  // Active Problem Details / Comments / Solutions Modal
  const [activeProblem, setActiveProblem] = useState(null);
  const [problemComments, setProblemComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [problemSolutions, setProblemSolutions] = useState([]);

  // Propose Solution Modal
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [solTitle, setSolTitle] = useState('');
  const [solDesc, setSolDesc] = useState('');
  const [solLocations, setSolLocations] = useState('');
  const [solItems, setSolItems] = useState('');
  const [solPower, setSolPower] = useState('');
  const [solManager, setSolManager] = useState('');
  const [solPayment, setSolPayment] = useState('');
  const [solQuestions, setSolQuestions] = useState('');
  const [submittingSolution, setSubmittingSolution] = useState(false);

  const categories = [
    'Hostel Life',
    'Food & Cafeteria',
    'Academics',
    'Library & Study Spaces',
    'Internet/WiFi',
    'Health & Safety',
    'Sports & Facilities',
    'Administration',
    'Other',
  ];

  const statuses = [
    'Open',
    'Under Review',
    'Solution Proposed',
    'In Progress',
    'Resolved',
    'Closed',
  ];

  const isStaffOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'faculty';

  const loadProblems = async () => {
    setLoading(true);
    try {
      const res = await api.getProblems({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        scope: selectedScope !== 'all' ? selectedScope : undefined,
        search: searchQuery || undefined,
        sort: selectedSort,
      });
      setProblems(res.problems || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [selectedCategory, selectedStatus, selectedScope, selectedSort, currentUser?.id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProblems();
  };

  const handleVote = async (problemId) => {
    try {
      const res = await api.voteProblem(problemId);
      setProblems((prev) =>
        prev.map((p) =>
          p.id === problemId
            ? { ...p, hasVoted: res.hasVoted, upvotesCount: res.upvotesCount }
            : p
        )
      );
      if (activeProblem && activeProblem.id === problemId) {
        setActiveProblem({
          ...activeProblem,
          hasVoted: res.hasVoted,
          upvotesCount: res.upvotesCount,
        });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    setSubmittingProblem(true);
    try {
      await api.createProblem({
        title,
        description,
        category,
        location,
        timeOfDayAffected,
        whoIsAffected,
        severity,
        scope,
        isAnonymous,
      });
      setShowPostModal(false);
      setTitle('');
      setDescription('');
      setLocation('');
      loadProblems();
      alert('Problem reported successfully. Students can now validate and propose solutions.');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingProblem(false);
    }
  };

  const handleOpenDetails = async (prob) => {
    setActiveProblem(prob);
    try {
      const [comRes, solRes] = await Promise.all([
        api.getProblemComments(prob.id),
        api.getProblemSolutions(prob.id),
      ]);
      setProblemComments(comRes.comments || []);
      setProblemSolutions(solRes.solutions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !activeProblem) return;
    try {
      const res = await api.addProblemComment(activeProblem.id, {
        content: commentText,
        isAnonymous: commentAnonymous,
      });
      setProblemComments([...problemComments, res.comment]);
      setCommentText('');
      setProblems((prev) =>
        prev.map((p) =>
          p.id === activeProblem.id
            ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
            : p
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleProposeSolution = async (e) => {
    e.preventDefault();
    if (!activeProblem) return;
    setSubmittingSolution(true);
    try {
      const res = await api.proposeProblemSolution(activeProblem.id, {
        title: solTitle,
        description: solDesc,
        suggestedLocations: solLocations,
        itemsList: solItems,
        powerMaintenanceNeeds: solPower,
        whoManagesIt: solManager,
        paymentOptions: solPayment,
        openQuestionsForAdministration: solQuestions,
      });
      setProblemSolutions([...problemSolutions, res.solution]);
      setShowSolutionModal(false);
      setSolTitle('');
      setSolDesc('');
      setSolLocations('');
      setSolItems('');
      setSolPower('');
      setSolManager('');
      setSolPayment('');
      setSolQuestions('');
      loadProblems();
      alert('Solution proposed! You can convert this into an Innovation Hub idea.');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingSolution(false);
    }
  };

  const handleConvertToIdea = async (solutionId) => {
    if (!activeProblem) return;
    try {
      await api.convertProblemSolutionToIdea(activeProblem.id, solutionId);
      alert('Converted to Innovation Hub Idea! Linked without duplicates.');
      if (onNavigateToInnovation) {
        onNavigateToInnovation();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!activeProblem) return;
    try {
      const res = await api.updateProblemStatus(activeProblem.id, newStatus);
      setActiveProblem(res.problem);
      loadProblems();
      alert(`Problem status updated to ${newStatus}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReportProblem = async (problemId) => {
    const reason = prompt('Please specify why this post is inappropriate or inaccurate:');
    if (!reason) return;
    try {
      await api.reportProblem(problemId, reason);
      alert('Report submitted for moderator review.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-demo">[STUDENT FEEDBACK MODULE]</span>
          </div>
          <h1>Campus Problems & Feedback</h1>
          <p>
            Report real campus issues, validate peer experiences with "I face this too", and collaborate on actionable engineering solutions.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowPostModal(true)}>
          <Plus size={16} />
          <span>Report a Campus Problem</span>
        </button>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid var(--color-primary-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.9rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          color: '#1e3a8a',
        }}
      >
        <ShieldCheck size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Official Note:</strong> Posts are student feedback and do not represent official AIT decisions. Figures, solutions, or proposed equipments are student estimates and do not imply administrative funding or vendor approvals.
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '12px' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search problems by keywords, location, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Campus Scope</label>
            <select
              className="form-select"
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
            >
              <option value="all">All Accessible Scopes</option>
              <option value="Whole campus">Whole campus</option>
              <option value="Girls' Hostel">Girls' Hostel</option>
              <option value="Boys' Hostel">Boys' Hostel</option>
              <option value="Department">Department</option>
            </select>
          </div>

          <div>
            <label className="form-label">Sort Order</label>
            <select
              className="form-select"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
            >
              <option value="most_affected">Most Affected (Upvotes)</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problems Feed (Single Column, Max Width ~900px) */}
      <div className="single-col-cards">
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading problems...
          </div>
        ) : problems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <h3>No campus problems found matching your filters</h3>
            <p style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Feel free to report a new problem or adjust category and scope filters.
            </p>
          </div>
        ) : (
          problems.map((prob) => (
            <div key={prob.id} className="card card-hover" style={{ borderLeft: prob.severity === 'high' ? '4px solid #dc2626' : prob.severity === 'medium' ? '4px solid #ea580c' : '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="badge badge-official">{prob.category}</span>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: prob.status === 'Resolved' ? '#ecfdf5' : prob.status === 'In Progress' ? '#fef3c7' : '#eff6ff',
                      color: prob.status === 'Resolved' ? '#065f46' : prob.status === 'In Progress' ? '#92400e' : '#1d4ed8',
                    }}
                  >
                    {prob.status}
                  </span>
                  <span className="badge badge-demo">
                    {prob.severity.toUpperCase()} SEVERITY
                  </span>
                  {prob.isDemo && <span className="badge badge-demo">DEMO EXAMPLE</span>}
                </div>

                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(prob.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h2 className="card-title">{prob.title}</h2>
              <p className="card-description">{prob.description}</p>

              {/* Metadata tags */}
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginBottom: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
                <div><strong>Location:</strong> {prob.location}</div>
                <div><strong>Time Affected:</strong> {prob.timeOfDayAffected}</div>
                <div><strong>Who:</strong> {prob.whoIsAffected}</div>
                <div><strong>Scope:</strong> {prob.scope}</div>
              </div>

              {/* Converted Innovation Link Tag if exists */}
              {prob.convertedIdeaId && (
                <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Connected Innovation Hub Idea actively prototyping this solution.</span>
                  <span className="badge badge-verified">LINKED IDEA</span>
                </div>
              )}

              {/* Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Reported by <strong>{prob.authorDisplayName}</strong>
                </span>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {/* One-vote "I face this too" button */}
                  <button
                    className={`btn btn-sm ${prob.hasVoted ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleVote(prob.id)}
                    title="Validate that you also experience this campus problem"
                  >
                    <ThumbsUp size={16} />
                    <span>{prob.hasVoted ? 'I face this too' : 'I face this too'} ({prob.upvotesCount || 0})</span>
                  </button>

                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleOpenDetails(prob)}
                  >
                    <MessageSquare size={16} />
                    <span>Solutions & Discussion ({prob.commentsCount + prob.solutionsCount})</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleReportProblem(prob.id)}
                    title="Flag problem post"
                  >
                    <Flag size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* POST NEW PROBLEM MODAL */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report a Campus Problem</h2>
              <button className="btn btn-sm btn-outline" onClick={() => setShowPostModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProblem}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Problem Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Broken water purifier on 2nd floor OB hostel"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Describe how this affects daily academic or hostel life..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Severity Level</label>
                    <select
                      className="form-select"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                    >
                      <option value="low">Low (Minor inconvenience)</option>
                      <option value="medium">Medium (Moderate disruption)</option>
                      <option value="high">High (Urgent / High impact)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Location on Campus *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ramanujan Block Lab 201"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Scope *</label>
                    <select
                      className="form-select"
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                    >
                      <option value="Whole campus">Whole campus</option>
                      <option value="Girls' Hostel">Girls' Hostel</option>
                      <option value="Boys' Hostel">Boys' Hostel</option>
                      <option value="Department">Department</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Time of Day Affected</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Evenings past 8:00 PM"
                      value={timeOfDayAffected}
                      onChange={(e) => setTimeOfDayAffected(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Who is Affected</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 3rd Year IT Students"
                      value={whoIsAffected}
                      onChange={(e) => setWhoIsAffected(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <span>Post Anonymously (Identity hidden from peers, visible only to authorized moderators)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPostModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingProblem}>
                  {submittingProblem ? 'Submitting...' : 'Submit Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROBLEM DETAILS / SOLUTIONS & COMMENTS MODAL */}
      {activeProblem && (
        <div className="modal-overlay" onClick={() => setActiveProblem(null)}>
          <div className="modal-dialog" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-official">{activeProblem.category}</span>
                <h2 style={{ marginTop: '0.25rem' }}>{activeProblem.title}</h2>
              </div>
              <button className="btn btn-sm btn-outline" onClick={() => setActiveProblem(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                {activeProblem.description}
              </p>

              {/* Status Management for Admin/Staff */}
              {isStaffOrAdmin && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                      Staff / Admin Status Control:
                    </span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                      Current: <strong>{activeProblem.status}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {['Under Review', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: '0.8rem', minHeight: '32px', padding: '0.2rem 0.6rem' }}
                        onClick={() => handleStatusChange(s)}
                      >
                        Set {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: PROPOSED SOLUTIONS */}
              <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lightbulb size={18} color="var(--color-primary)" />
                    <span>Proposed Engineering Solutions ({problemSolutions.length})</span>
                  </h3>
                  <button className="btn btn-sm btn-secondary" onClick={() => setShowSolutionModal(true)}>
                    <Plus size={14} />
                    <span>Propose Solution</span>
                  </button>
                </div>

                {problemSolutions.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    No solutions proposed yet. Propose an engineering or operational solution above!
                  </p>
                ) : (
                  problemSolutions.map((sol) => (
                    <div key={sol.id} className="card" style={{ backgroundColor: 'var(--bg-surface-subtle)', marginBottom: '1rem', borderLeft: '4px solid #16a34a' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{sol.title}</h4>
                        <span className="badge badge-demo">STUDENT PROPOSAL</span>
                      </div>
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                        {sol.description}
                      </p>

                      {sol.details && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                          {sol.details.suggestedLocations && <div><strong>Suggested Locations:</strong> {sol.details.suggestedLocations}</div>}
                          {sol.details.itemsList && <div><strong>Items List:</strong> {sol.details.itemsList}</div>}
                          {sol.details.powerMaintenanceNeeds && <div><strong>Power & Maintenance:</strong> {sol.details.powerMaintenanceNeeds}</div>}
                          {sol.details.whoManagesIt && <div><strong>Management:</strong> {sol.details.whoManagesIt}</div>}
                          {sol.details.paymentOptions && <div><strong>Payment Options:</strong> {sol.details.paymentOptions}</div>}
                          {sol.details.openQuestionsForAdministration && <div><strong>Open Questions for Admin:</strong> {sol.details.openQuestionsForAdministration}</div>}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Proposed by {sol.authorDisplayName}
                        </span>

                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleConvertToIdea(sol.id)}
                        >
                          <Lightbulb size={14} />
                          <span>Convert to Innovation Hub Idea</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* SECTION: COMMENTS & EXPERIENCES */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={18} />
                  <span>Student Comments & Validation ({problemComments.length})</span>
                </h3>

                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {problemComments.length === 0 ? (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No comments yet. Share your experience below.</p>
                  ) : (
                    problemComments.map((c) => (
                      <div key={c.id} style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem' }}>
                          <span>{c.authorDisplayName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            {new Date(c.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {c.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Add an experience or comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-primary">
                      <Send size={16} />
                    </button>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={commentAnonymous}
                      onChange={(e) => setCommentAnonymous(e.target.checked)}
                    />
                    <span>Comment anonymously</span>
                  </label>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROPOSE SOLUTION MODAL */}
      {showSolutionModal && (
        <div className="modal-overlay" onClick={() => setShowSolutionModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Propose Solution for: {activeProblem?.title}</h2>
              <button className="btn btn-sm btn-outline" onClick={() => setShowSolutionModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleProposeSolution}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Solution Concept Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Smart Vending Machine Deployment"
                    value={solTitle}
                    onChange={(e) => setSolTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Solution Architecture & Approach *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Explain how this engineering or operational solution addresses the problem..."
                    value={solDesc}
                    onChange={(e) => setSolDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Suggested Locations on Campus</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Recreation halls of Girls' Wing A and Boys' OB/NB"
                    value={solLocations}
                    onChange={(e) => setSolLocations(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Items / Components List</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Healthy snacks, hot beverage dispenser (NO bottled water)"
                    value={solItems}
                    onChange={(e) => setSolItems(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Power & Maintenance Needs</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 230V outlet, weekly vendor refill (to be estimated)"
                      value={solPower}
                      onChange={(e) => setSolPower(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Who Manages It</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Student Mess Committee & Warden Council"
                      value={solManager}
                      onChange={(e) => setSolManager(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Payment Options</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. UPI QR code, RFID student tap"
                      value={solPayment}
                      onChange={(e) => setSolPayment(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Open Questions for Administration</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Curfew vendor access permissions"
                      value={solQuestions}
                      onChange={(e) => setSolQuestions(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSolutionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingSolution}>
                  {submittingSolution ? 'Submitting...' : 'Submit Proposed Solution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
