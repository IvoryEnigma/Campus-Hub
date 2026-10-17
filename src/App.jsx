import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import InboxView from './components/InboxView';
import CommunitiesView from './components/CommunitiesView';
import CommunityDetailView from './components/CommunityDetailView';
import HostelView from './components/HostelView';
import CampusProblemsView from './components/CampusProblemsView';
import InnovationHubView from './components/InnovationHubView';
import SavedView from './components/SavedView';
import ProfileView from './components/ProfileView';
import AdminModerationView from './components/AdminModerationView';
import NewIdeaModal from './components/NewIdeaModal';
import { api } from './api';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCommunitySlug, setSelectedCommunitySlug] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [demoUsers, setDemoUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [inboxData, setInboxData] = useState({ messages: [], counts: {} });
  const [ideas, setIdeas] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [problems, setProblems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewIdeaModal, setShowNewIdeaModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize application state
  const loadInitialData = async () => {
    try {
      const [meRes, usersRes, commRes, inboxRes, ideasRes, oppsRes, problemsRes, notifsRes] =
        await Promise.all([
          api.getMe(),
          api.getDemoAccounts(),
          api.getCommunities(),
          api.getInbox(),
          api.getIdeas(),
          api.getOpportunities(),
          api.getProblems(),
          api.getNotifications(),
        ]);

      setCurrentUser(meRes.user);
      setDemoUsers(usersRes.personas || []);
      setCommunities(commRes.communities || []);
      setInboxData(inboxRes);
      setIdeas(ideasRes.ideas || []);
      setOpportunities(oppsRes.opportunities || []);
      setProblems(problemsRes.problems || []);
      setNotifications(notifsRes.notifications || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSwitchUser = async (userId) => {
    setLoading(true);
    try {
      await api.switchUser(userId);
      await loadInitialData();
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  const handleRefreshInbox = async () => {
    try {
      const [inboxRes, commRes, problemsRes] = await Promise.all([
        api.getInbox(),
        api.getCommunities(),
        api.getProblems(),
      ]);
      setInboxData(inboxRes);
      setCommunities(commRes.communities || []);
      setProblems(problemsRes.problems || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    setSelectedCommunitySlug(null);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCommunity = (slug) => {
    setSelectedCommunitySlug(slug);
    setCurrentView('community-detail');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNotificationRead = async (notifId) => {
    try {
      await api.markNotificationRead(notifId);
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !currentUser) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: '#f8fafc',
        }}
      >
        <div className="ait-logo-badge" style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}>
          AIT
        </div>
        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Loading AIT Campus Hub...</div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        unreadCount={inboxData?.counts?.unread || 0}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main">
        <Header
          currentUser={currentUser}
          demoUsers={demoUsers}
          onSwitchUser={handleSwitchUser}
          notifications={notifications}
          onNotificationRead={handleNotificationRead}
          onNavigate={handleNavigate}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main style={{ flex: 1 }}>
          {currentView === 'home' && (
            <HomeView
              currentUser={currentUser}
              inboxData={inboxData}
              ideas={ideas}
              opportunities={opportunities}
              problems={problems}
              onNavigate={handleNavigate}
              onOpenNewIdea={() => setShowNewIdeaModal(true)}
            />
          )}

          {currentView === 'inbox' && (
            <InboxView
              inboxData={inboxData}
              communities={communities}
              currentUser={currentUser}
              onRefreshInbox={handleRefreshInbox}
            />
          )}

          {currentView === 'communities' && (
            <CommunitiesView
              communities={communities}
              currentUser={currentUser}
              onSelectCommunity={handleSelectCommunity}
            />
          )}

          {currentView === 'community-detail' && selectedCommunitySlug && (
            <CommunityDetailView
              communitySlug={selectedCommunitySlug}
              currentUser={currentUser}
              onBack={() => setCurrentView('communities')}
              onRefreshInbox={handleRefreshInbox}
            />
          )}

          {currentView === 'fe-announcements' && (
            <CommunityDetailView
              communitySlug="fe-announcements"
              currentUser={currentUser}
              onBack={() => handleNavigate('home')}
              onRefreshInbox={handleRefreshInbox}
            />
          )}

          {currentView === 'departments' && (
            <CommunitiesView
              communities={communities.filter((c) => c.category === 'department')}
              currentUser={currentUser}
              onSelectCommunity={handleSelectCommunity}
            />
          )}

          {currentView === 'hostel' && (
            <HostelView
              currentUser={currentUser}
              communities={communities}
              onRefreshInbox={handleRefreshInbox}
            />
          )}

          {currentView === 'campus-problems' && (
            <CampusProblemsView
              currentUser={currentUser}
              onNavigateToInnovation={() => handleNavigate('innovation')}
            />
          )}

          {currentView === 'innovation' && (
            <InnovationHubView
              currentUser={currentUser}
              onOpenNewIdeaModal={() => setShowNewIdeaModal(true)}
            />
          )}

          {currentView === 'saved' && (
            <SavedView
              inboxData={inboxData}
              onRefreshInbox={handleRefreshInbox}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              onRefreshUser={loadInitialData}
            />
          )}

          {currentView === 'moderation' && (
            <AdminModerationView currentUser={currentUser} />
          )}
        </main>
      </div>

      {/* New Idea Modal */}
      <NewIdeaModal
        isOpen={showNewIdeaModal}
        onClose={() => setShowNewIdeaModal(false)}
        onIdeaCreated={async () => {
          const res = await api.getIdeas();
          setIdeas(res.ideas || []);
          handleRefreshInbox();
        }}
      />
    </div>
  );
}
