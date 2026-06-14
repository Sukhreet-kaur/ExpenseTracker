// GroupDetail.jsx - Complete Working Version with CSV Import
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GroupDetail.css';
import AddExpenseModal from './AddExpenseModal';

const GroupDetail = ({ user, token }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expenseFilter, setExpenseFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // CSV Import states
  const [importReport, setImportReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Dynamic state
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newMember, setNewMember] = useState({ email: '' });

  const API_URL = 'https://expensetrackbackend-2q0m.onrender.com/api';

  // Fetch all group data
  useEffect(() => {
    if (groupId && token) {
      fetchGroupData();
    }
  }, [groupId, token]);

  const fetchGroupData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupRes, expensesRes, membersRes, balancesRes] = await Promise.all([
        fetch(`${API_URL}/groups/${groupId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/groups/${groupId}/expenses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/groups/${groupId}/members`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/groups/${groupId}/balances`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!groupRes.ok) throw new Error('Failed to fetch group');
      
      const groupData = await groupRes.json();
      const expensesData = await expensesRes.json();
      const membersData = await membersRes.json();
      const balancesData = await balancesRes.json();
      
      setGroup(groupData);
      setExpenses(expensesData);
      setMembers(membersData);
      setBalances(balancesData);
      
    } catch (err) {
      console.error('Error fetching group data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Expense - Receives data from AddExpenseModal
  const handleAddExpense = async (expenseData) => {
    console.log('Received expense data:', expenseData);
    
    if (!expenseData.description) {
      alert('Description is required');
      return;
    }
    if (!expenseData.amount || expenseData.amount <= 0) {
      alert('Valid amount is required');
      return;
    }
    if (!expenseData.paid_by) {
      alert('Please select who paid');
      return;
    }
    if (!expenseData.splits || expenseData.splits.length === 0) {
      alert('Please select at least one person to split with');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (response.ok) {
        setShowAddExpense(false);
        fetchGroupData();
        alert('Expense added successfully!');
      } else {
        alert(data.message || 'Failed to add expense');
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Error adding expense: ' + err.message);
    }
  };

  // Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.email) {
      alert('Please enter email address');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newMember.email }),
      });

      if (response.ok) {
        setShowAddMember(false);
        setNewMember({ email: '' });
        fetchGroupData();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add member');
      }
    } catch (err) {
      console.error('Error adding member:', err);
      alert('Error adding member');
    }
  };

  // Mark Member as Left
  const handleMarkAsLeft = async (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to mark ${memberName} as left?`)) {
      try {
        const response = await fetch(`${API_URL}/groups/${groupId}/members/${memberId}/leave`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          fetchGroupData();
        } else {
          alert('Failed to update member');
        }
      } catch (err) {
        console.error('Error marking member as left:', err);
        alert('Error updating member');
      }
    }
  };

  // Settle Up
  const handleSettleUp = async (balance) => {
    const amount = prompt(`Enter amount to settle with ${balance.toUser}:`, Math.abs(balance.amount));
    if (!amount) return;

    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/settle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: user._id,
          to: balance.to,
          amount: parseFloat(amount),
          groupId: groupId
        }),
      });

      if (response.ok) {
        alert('Settlement recorded successfully!');
        fetchGroupData();
      } else {
        alert('Failed to record settlement');
      }
    } catch (err) {
      console.error('Error settling up:', err);
      alert('Error recording settlement');
    }
  };

  // CSV Upload Handler
  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('csv', file);

    setIsImporting(true);
    
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/import-csv/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('CSV Analysis Result:', data);
      
      if (data.success) {
        setImportReport({
          summary: data.summary,
          anomalies: data.anomalies,
          cleanData: data.clean_data
        });
        setShowReportModal(true);
      } else {
        alert(data.error || 'Error processing CSV');
      }
    } catch (err) {
      console.error('Error uploading CSV:', err);
      alert('Error processing CSV file');
    } finally {
      setIsImporting(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Approve Import Handler
  const handleApproveImport = async () => {
    setIsImporting(true);
    
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/import-csv/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clean_data: importReport.cleanData }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        setShowReportModal(false);
        setImportReport(null);
        fetchGroupData(); // Refresh the page
      } else {
        alert(data.message || 'Import failed');
      }
    } catch (err) {
      console.error('Error importing:', err);
      alert('Error importing data');
    } finally {
      setIsImporting(false);
    }
  };

  // Get drill-down expenses for balance
  const handleViewDrillDown = async (balance) => {
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/balances/drill-down?from=${balance.from}&to=${balance.to}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setSelectedBalance({
        ...balance,
        expenses: data.expenses || []
      });
    } catch (err) {
      console.error('Error fetching drill down:', err);
    }
  };

  // Filter expenses based on search and filter
  const filteredExpenses = expenses.filter(expense => {
    if (searchTerm && !expense.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (expenseFilter === 'month') {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      if (expenseDate.getMonth() !== now.getMonth() || expenseDate.getFullYear() !== now.getFullYear()) return false;
    }
    if (expenseFilter === 'paidByMe' && expense.paidBy?._id !== user?._id) return false;
    return true;
  });

  // Get total expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Get user's balance
  const totalOwed = balances.filter(b => b.to === user?._id).reduce((sum, b) => sum + Math.abs(b.amount), 0);
  const totalOwe = balances.filter(b => b.from === user?._id).reduce((sum, b) => sum + Math.abs(b.amount), 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading group details...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="error-container">
        <div className="error-icon">😞</div>
        <h3>Failed to load group</h3>
        <p>{error || 'Group not found'}</p>
        <button className="back-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  const getMemberName = (memberId) => {
    const member = members.find(m => m._id === memberId);
    return member?.name || 'Unknown';
  };

  return (
    <div className="group-detail-page">
      {/* Top Navigation */}
      <nav className="top-nav">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        <div className="nav-right">
          <button className="nav-icon-btn">🔔</button>
          <div className="user-avatar">{user?.name?.[0] || 'S'}</div>
        </div>
      </nav>

      {/* Group Header Banner */}
      <div className="group-header-banner">
        <div className="banner-content">
          <div className="group-icon-large">{group.icon || '👥'}</div>
          <div className="group-info">
            <h1 className="group-name">{group.name}</h1>
            <div className="group-meta">
              <span className="meta-item">👥 {members.length} members</span>
              <span className="meta-item">📅 Created {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="header-btn primary" onClick={() => setShowAddExpense(true)}>+ Add Expense</button>
            <button className="header-btn secondary" onClick={() => setShowAddMember(true)}>+ Add Member</button>
            <button className="header-btn icon-only">⋯</button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Tabs */}
        <div className="tabs-container">
          <button className={`tab ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>📋 Expenses</button>
          <button className={`tab ${activeTab === 'balances' ? 'active' : ''}`} onClick={() => setActiveTab('balances')}>💰 Balances</button>
          <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>👥 Members</button>
          <button className={`tab ${activeTab === 'import' ? 'active' : ''}`} onClick={() => setActiveTab('import')}>📁 Import CSV</button>
          <button className={`tab ${activeTab === 'settle' ? 'active' : ''}`} onClick={() => setActiveTab('settle')}>💸 Settle Up</button>
          <div className="tab-indicator" style={{ transform: `translateX(${activeTab === 'expenses' ? 0 : activeTab === 'balances' ? 120 : activeTab === 'members' ? 240 : activeTab === 'import' ? 360 : 480}px)` }}></div>
        </div>

        <div className="content-grid">
          {/* Main Content */}
          <div className="main-column">
            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
              <div className="expenses-section">
                <div className="expenses-toolbar">
                  <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search expenses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="filter-buttons">
                    <button className={`filter-btn ${expenseFilter === 'all' ? 'active' : ''}`} onClick={() => setExpenseFilter('all')}>All</button>
                    <button className={`filter-btn ${expenseFilter === 'month' ? 'active' : ''}`} onClick={() => setExpenseFilter('month')}>This Month</button>
                    <button className={`filter-btn ${expenseFilter === 'paidByMe' ? 'active' : ''}`} onClick={() => setExpenseFilter('paidByMe')}>Paid By Me</button>
                  </div>
                </div>

                {filteredExpenses.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">💰</div>
                    <h3>No expenses found</h3>
                    <p>Add your first expense to start tracking</p>
                    <button className="empty-btn" onClick={() => setShowAddExpense(true)}>+ Add Expense</button>
                  </div>
                ) : (
                  <div className="expenses-list">
                    {filteredExpenses.map(expense => (
                      <div key={expense._id} className="expense-card">
                        <div className="expense-icon">💰</div>
                        <div className="expense-details">
                          <div className="expense-header">
                            <h4 className="expense-description">{expense.description}</h4>
                            <span className="expense-amount">₹{expense.amount.toLocaleString()}</span>
                          </div>
                          <div className="expense-meta">
                            <span>Paid by <strong>{getMemberName(expense.paidBy)}</strong></span>
                            <span className="meta-separator">•</span>
                            <span>{new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="expense-split">
                            Split with: {expense.splitBetween?.map(s => getMemberName(s.user)).join(', ') || 'Everyone'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Balances Tab */}
            {activeTab === 'balances' && (
              <div className="balances-section">
                {balances.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">⚖️</div>
                    <h3>All settled up!</h3>
                  </div>
                ) : (
                  <div className="balances-grid">
                    {balances.map((balance, idx) => (
                      <div key={idx} className={`balance-card ${balance.from === user?._id ? 'payable' : 'receivable'}`} onClick={() => handleViewDrillDown(balance)}>
                        <div className="balance-card-header">
                          <div className="balance-icon">{balance.from === user?._id ? '📤' : '📥'}</div>
                          <div className="balance-info">
                            <h4>{balance.from === user?._id ? 'You owe' : `${balance.fromUser} owes you`}</h4>
                            <p className="balance-name">{balance.from === user?._id ? balance.toUser : balance.fromUser}</p>
                          </div>
                        </div>
                        <div className="balance-amount-large">₹{Math.abs(balance.amount).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedBalance && (
                  <div className="drill-down-panel">
                    <div className="drill-down-header">
                      <h3>Expense Details</h3>
                      <button className="close-drill" onClick={() => setSelectedBalance(null)}>✕</button>
                    </div>
                    <div className="drill-down-list">
                      {selectedBalance.expenses?.length > 0 ? (
                        selectedBalance.expenses.map((exp, idx) => (
                          <div key={idx} className="drill-item">
                            <div className="drill-info">
                              <span className="drill-name">{exp.description}</span>
                              <span className="drill-date">{new Date(exp.date).toLocaleDateString()}</span>
                            </div>
                            <span className="drill-amount">₹{exp.amount}</span>
                          </div>
                        ))
                      ) : (
                        <p className="no-expenses">No expense details available</p>
                      )}
                      <div className="drill-total">
                        <span>Total:</span>
                        <span className="total-amount">₹{Math.abs(selectedBalance.amount)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="members-section">
                <div className="members-header">
                  <h3>All Members ({members.length})</h3>
                  <button className="add-member-btn" onClick={() => setShowAddMember(true)}>+ Add Member</button>
                </div>
                <div className="members-grid">
                  {members.map(member => (
                    <div key={member._id} className="member-card">
                      <div className="member-avatar">{member.name?.[0] || '?'}</div>
                      <div className="member-details">
                        <h4 className="member-name">{member.name}</h4>
                        <div className="member-email">{member.email}</div>
                      </div>
                      {member.isActive !== false && member._id !== group.createdBy && (
                        <button className="action-btn leave" onClick={() => handleMarkAsLeft(member._id, member.name)}>Mark as Left</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Import CSV Tab */}
            {activeTab === 'import' && (
              <div className="import-section">
                <div className="upload-area" onClick={() => document.getElementById('csvInput').click()}>
                  <input 
                    type="file" 
                    id="csvInput" 
                    accept=".csv" 
                    style={{ display: 'none' }} 
                    onChange={handleCsvUpload} 
                  />
                  <div className="upload-icon">📁</div>
                  <h3>Click to upload CSV file</h3>
                  <p>or drag and drop</p>
                  <div className="csv-format">
                    <small>Expected format: date, description, amount, paid_by, split_type, split_with</small>
                  </div>
                  {isImporting && <div className="loading-spinner-small">Processing CSV file...</div>}
                </div>
              </div>
            )}

            {/* Settle Up Tab */}
            {activeTab === 'settle' && (
              <div className="settle-section">
                <div className="settlement-cards">
                  {balances.filter(b => b.amount < 0).map((balance, idx) => (
                    <div key={idx} className="settlement-card">
                      <div className="settlement-arrow">You owe {balance.toUser}</div>
                      <div className="settlement-amount">₹{Math.abs(balance.amount)}</div>
                      <button className="settle-now-btn" onClick={() => handleSettleUp(balance)}>Settle Now</button>
                    </div>
                  ))}
                  {balances.filter(b => b.amount < 0).length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">✅</div>
                      <h3>All settled up!</h3>
                      <p>No pending settlements</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="right-sidebar">
            <div className="summary-widget">
              <h3 className="widget-title">Quick Summary</h3>
              <div className="summary-stat">
                <span>Total Expenses:</span>
                <span>₹{totalExpenses.toLocaleString()}</span>
              </div>
              <div className="summary-stat">
                <span>You Owe:</span>
                <span className="negative">₹{totalOwe.toLocaleString()}</span>
              </div>
              <div className="summary-stat">
                <span>You Are Owed:</span>
                <span className="positive">₹{totalOwed.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AddExpenseModal Component */}
      {showAddExpense && (
        <AddExpenseModal
          isOpen={showAddExpense}
          onClose={() => setShowAddExpense(false)}
          onAddExpense={handleAddExpense}
          members={members}
          currentUser={user}
        />
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Member</h2>
              <button className="modal-close" onClick={() => setShowAddMember(false)}>✕</button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="friend@example.com" value={newMember.email} onChange={(e) => setNewMember({ email: e.target.value })} required />
                  <small className="hint-text">The person must have a SplitSmart account</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowAddMember(false)}>Cancel</button>
                <button type="submit" className="btn-save">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Report Modal */}
      {showReportModal && importReport && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 CSV Import Report</h2>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              {/* Statistics Cards */}
              <div className="import-stats">
                <div className="stat-card">
                  <div className="stat-value">{importReport.summary.total_rows}</div>
                  <div className="stat-label">Total Rows</div>
                </div>
                <div className="stat-card valid">
                  <div className="stat-value">{importReport.summary.valid_rows}</div>
                  <div className="stat-label">Valid</div>
                </div>
                <div className="stat-card invalid">
                  <div className="stat-value">{importReport.summary.skipped_rows}</div>
                  <div className="stat-label">Skipped</div>
                </div>
                <div className="stat-card warning">
                  <div className="stat-value">{importReport.summary.anomalies_count}</div>
                  <div className="stat-label">Issues Found</div>
                </div>
              </div>
              
              {/* Anomalies List */}
              {importReport.anomalies && importReport.anomalies.length > 0 && (
                <div className="anomalies-section">
                  <h3>⚠️ Issues Found & Fixed</h3>
                  <div className="anomalies-list">
                    {importReport.anomalies.slice(0, 20).map((anomaly, idx) => (
                      <div key={idx} className={`anomaly-item ${anomaly.type}`}>
                        <div className="anomaly-row">Row {anomaly.row}</div>
                        <div className="anomaly-message">{anomaly.message}</div>
                        <div className="anomaly-action">{anomaly.action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Preview */}
              {importReport.cleanData && importReport.cleanData.length > 0 && (
                <div className="preview-section">
                  <h3>📋 Preview (First {Math.min(5, importReport.cleanData.length)} rows)</h3>
                  <div className="preview-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Paid By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importReport.cleanData.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.date}</td>
                            <td>{row.description}</td>
                            <td>₹{row.amount}</td>
                            <td>{row.paid_by}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowReportModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-import" 
                onClick={handleApproveImport}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : `Import ${importReport.summary?.valid_rows || 0} Expenses`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;