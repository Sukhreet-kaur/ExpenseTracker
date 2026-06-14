// Dashboard.jsx - Fixed version with error handling
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Modal Component
const CreateGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('👥');
  const [isLoading, setIsLoading] = useState(false);

  const icons = ['👥', '🏠', '🏖️', '🍕', '🎓', '💼', '🎮', '✈️', '🏋️', '🎬'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setIsLoading(true);
    await onCreateGroup({ name: groupName, icon: selectedIcon });
    setIsLoading(false);
    setGroupName('');
    setSelectedIcon('👥');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Group</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Group Name</label>
              <input
                type="text"
                placeholder="Eg. Flatmates, Trip to Goa, Office Team"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label>Choose an Icon</label>
              <div className="icon-selector">
                {icons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-option ${selectedIcon === icon ? 'selected' : ''}`}
                    onClick={() => setSelectedIcon(icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-create" disabled={isLoading || !groupName.trim()}>
              {isLoading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ user, token, onLogout }) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalExpenses: 0,
    youOwe: 0,
    youAreOwed: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  const API_URL = 'https://expensetrackbackend-2q0m.onrender.com/api';

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats with error handling
      const statsResponse = await fetch(`${API_URL}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const statsData = await statsResponse.json();
      console.log('Stats data:', statsData); // Debug log
      
      // Set stats with default values if fields are missing
      setStats({
        totalGroups: statsData.totalGroups || 0,
        totalExpenses: statsData.totalExpenses || 0,
        youOwe: statsData.youOwe || 0,
        youAreOwed: statsData.youAreOwed || 0
      });

      // Fetch groups
      const groupsResponse = await fetch(`${API_URL}/dashboard/groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setGroups(groupsData || []);
      }

      // Fetch activities
      const activitiesResponse = await fetch(`${API_URL}/dashboard/activities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData || []);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        totalGroups: 0,
        totalExpenses: 0,
        youOwe: 0,
        youAreOwed: 0
      });
      setGroups([]);
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const response = await fetch(`${API_URL}/dashboard/create-group`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      });

      if (response.ok) {
        fetchDashboardData();
        setShowCreateGroupModal(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Error creating group');
    }
  };

  // Safe number formatting function
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '₹0';
    return `₹${Number(value).toLocaleString()}`;
  };

  const netBalance = (stats.youAreOwed || 0) - (stats.youOwe || 0);

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="nav-left">
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            ☰
          </button>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            ◀
          </button>
          <div className="logo" onClick={() => navigate('/dashboard')}>
            <div className="logo-icon">💰</div>
            <span className="logo-text">SplitSmart</span>
          </div>
        </div>

        <div className="nav-center">
          <div className="nav-links">
            <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} 
                    onClick={() => { setActiveTab('dashboard'); navigate('/dashboard'); }}>
              Dashboard
            </button>
            <button className={`nav-link ${activeTab === 'groups' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('groups')}>
              Groups
            </button>
            <button className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('activity')}>
              Activity
            </button>
          </div>
        </div>

        <div className="nav-right">
          <div className="profile-avatar">
            <span className="avatar-initials">{user?.name?.[0] || 'S'}</span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="logo">SplitSmart</div>
              <button onClick={() => setMobileMenuOpen(false)}>✕</button>
            </div>
            <div className="mobile-menu-items">
              <button className="mobile-menu-item" onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>📊 Dashboard</button>
              <button className="mobile-menu-item" onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>👥 My Groups</button>
              <button className="mobile-menu-item logout" onClick={onLogout}>🚪 Logout</button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-main">
        {/* Left Sidebar */}
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-menu">
            <button className="sidebar-item active" onClick={() => navigate('/dashboard')}>
              <span className="sidebar-icon">📊</span>
              {!sidebarCollapsed && <span className="sidebar-label">Dashboard</span>}
            </button>
            <button className="sidebar-item logout" onClick={onLogout}>
              <span className="sidebar-icon">🚪</span>
              {!sidebarCollapsed && <span className="sidebar-label">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="main-content">
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome Back, {user?.name || 'User'} 👋</h1>
            <p className="welcome-subtitle">Here's what's happening with your expenses today</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3 className="stat-value">{stats.totalGroups || 0}</h3>
                <p className="stat-label">Total Groups</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3 className="stat-value">{formatCurrency(stats.totalExpenses)}</h3>
                <p className="stat-label">Total Expenses</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📤</div>
              <div className="stat-info">
                <h3 className="stat-value negative">{formatCurrency(stats.youOwe)}</h3>
                <p className="stat-label">You Owe</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📥</div>
              <div className="stat-info">
                <h3 className="stat-value positive">{formatCurrency(stats.youAreOwed)}</h3>
                <p className="stat-label">You Are Owed</p>
              </div>
            </div>
          </div>

          <div className="content-grid">
            <div className="groups-section">
              <div className="section-header">
                <h2 className="section-title">My Groups</h2>
                <button className="create-group-btn" onClick={() => setShowCreateGroupModal(true)}>
                  + Create New Group
                </button>
              </div>

              {loading ? (
                <div className="groups-grid skeleton">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="group-card skeleton-card">
                      <div className="skeleton-icon"></div>
                      <div className="skeleton-text"></div>
                      <div className="skeleton-text short"></div>
                    </div>
                  ))}
                </div>
              ) : groups.length > 0 ? (
                <div className="groups-grid">
                  {groups.map(group => (
                    <div key={group._id} className="group-card" onClick={() => handleGroupClick(group._id)}>
                      <div className="group-card-header">
                        <div className="group-icon">{group.icon || '👥'}</div>
                        <div className="group-info">
                          <h3 className="group-name">{group.name}</h3>
                          <p className="group-members">{group.members || 0} members</p>
                        </div>
                      </div>
                      <div className="group-balance">
                        {group.balance < 0 ? (
                          <span className="balance-owe">You Owe ₹{Math.abs(group.balance)}</span>
                        ) : group.balance > 0 ? (
                          <span className="balance-owed">You Get ₹{group.balance}</span>
                        ) : (
                          <span className="balance-settled">Settled Up</span>
                        )}
                      </div>
                      <div className="group-footer">
                        <span className="last-updated">
                          Updated {group.lastUpdated ? new Date(group.lastUpdated).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🏗️</div>
                  <h3 className="empty-title">No groups yet</h3>
                  <p className="empty-description">Create your first expense group to start splitting bills</p>
                  <button className="empty-create-btn" onClick={() => setShowCreateGroupModal(true)}>
                    Create Group
                  </button>
                </div>
              )}
            </div>

            <div className="right-sidebar">
              <div className="widget quick-summary">
                <h3 className="widget-title">Quick Summary</h3>
                <div className="summary-item">
                  <span className="summary-label">Total You Owe</span>
                  <span className="summary-value negative">{formatCurrency(stats.youOwe)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total You Are Owed</span>
                  <span className="summary-value positive">{formatCurrency(stats.youAreOwed)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-item net">
                  <span className="summary-label">Net Balance</span>
                  <span className={`summary-value ${netBalance >= 0 ? 'positive' : 'negative'}`}>
                    {netBalance >= 0 ? '+' : ''}{formatCurrency(Math.abs(netBalance))}
                  </span>
                </div>
              </div>

              <div className="widget recent-activity">
                <h3 className="widget-title">Recent Activity</h3>
                <div className="activity-timeline">
                  {recentActivities && recentActivities.length > 0 ? (
                    recentActivities.map(activity => (
                      <div key={activity._id} className="activity-item">
                        <div className="activity-avatar">{activity.user?.name?.[0] || 'U'}</div>
                        <div className="activity-details">
                          <p className="activity-text">{activity.description || 'Activity'}</p>
                          <span className="activity-time">
                            {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="activity-text">No recent activities</p>
                  )}
                </div>
              </div>

              <div className="widget tips">
                <h3 className="widget-title">💡 Pro Tip</h3>
                <p className="tips-text">
                  Create groups for recurring expenses like rent, utilities, or trips to keep track easily!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
};

export default Dashboard;