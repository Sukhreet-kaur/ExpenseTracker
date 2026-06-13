import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddExpenseModal from './AddExpenseModal';
import AddMemberModal from './AddMemberModal';
import SettleUpModal from './SettleUpModal';
import './GroupDetail.css';

const GroupDetail = ({ user, token, onLogout }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('expenses');
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const [groupRes, expensesRes, membersRes, balancesRes] = await Promise.all([
        fetch(`${API_URL}/groups/${groupId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/groups/${groupId}/expenses`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/groups/${groupId}/members`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/groups/${groupId}/balances`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      setGroup(await groupRes.json());
      setExpenses(await expensesRes.json());
      setMembers(await membersRes.json());
      setBalances(await balancesRes.json());
    } catch (error) {
      console.error('Error fetching group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        fetchGroupData();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleAddMember = async (memberData) => {
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });

      if (response.ok) {
        fetchGroupData();
      }
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleSettleUp = async (settleData) => {
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/settle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settleData),
      });

      if (response.ok) {
        fetchGroupData();
        setShowSettleUp(false);
      }
    } catch (error) {
      console.error('Error settling up:', error);
    }
  };

  // Rest of your component JSX remains the same
  // Just update the buttons to open modals:

  return (
    <>
      <div className="group-detail-container">
        {/* Your existing JSX */}
        
        {/* Update Add Expense button */}
        <button className="add-expense-btn" onClick={() => setShowAddExpense(true)}>
          + Add Expense
        </button>
        
        {/* Update Add Member button */}
        <button className="add-member-btn" onClick={() => setShowAddMember(true)}>
          + Add Member
        </button>
        
        {/* Update Settle button */}
        {balances.filter(b => b.amount < 0).map((balance, idx) => (
          <button 
            key={idx}
            className="settle-btn" 
            onClick={() => {
              setSelectedBalance(balance);
              setShowSettleUp(true);
            }}
          >
            Settle Now
          </button>
        ))}
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onAddExpense={handleAddExpense}
        members={members}
        currentUser={user}
      />

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAddMember={handleAddMember}
      />

      <SettleUpModal
        isOpen={showSettleUp}
        onClose={() => {
          setShowSettleUp(false);
          setSelectedBalance(null);
        }}
        onSettle={handleSettleUp}
        balance={selectedBalance}
        currentUser={user}
      />
    </>
  );
};

export default GroupDetail;