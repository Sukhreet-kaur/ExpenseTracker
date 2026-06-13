import React, { useState } from 'react';
import './Modal.css';

const AddExpenseModal = ({ isOpen, onClose, onAddExpense, members, currentUser }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser?._id || '');
  const [splitBetween, setSplitBetween] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !paidBy || splitBetween.length === 0) return;

    setIsLoading(true);
    await onAddExpense({
      description,
      amount: parseFloat(amount),
      paidBy,
      splitBetween,
      date: new Date().toISOString()
    });
    setIsLoading(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setPaidBy(currentUser?._id || '');
    setSplitBetween([]);
  };

  const handleSplitToggle = (memberId) => {
    if (splitBetween.includes(memberId)) {
      setSplitBetween(splitBetween.filter(id => id !== memberId));
    } else {
      setSplitBetween([...splitBetween, memberId]);
    }
  };

  const handleSelectAll = () => {
    if (splitBetween.length === members.length) {
      setSplitBetween([]);
    } else {
      setSplitBetween(members.map(m => m._id));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Expense</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                placeholder="e.g., Dinner, Movie tickets, Groceries"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Paid By</label>
              <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required>
                <option value="">Select who paid</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Split Between</label>
              <button type="button" className="select-all-btn" onClick={handleSelectAll}>
                {splitBetween.length === members.length ? 'Deselect All' : 'Select All'}
              </button>
              <div className="members-list-split">
                {members.map(member => (
                  <label key={member._id} className="split-checkbox">
                    <input
                      type="checkbox"
                      checked={splitBetween.includes(member._id)}
                      onChange={() => handleSplitToggle(member._id)}
                    />
                    <span>{member.name}</span>
                  </label>
                ))}
              </div>
              <small className="hint-text">
                {splitBetween.length === 0 
                  ? 'Select at least one person to split with' 
                  : `Each person will pay ₹${(parseFloat(amount) / splitBetween.length).toFixed(2)}`}
              </small>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-create" 
              disabled={isLoading || !description || !amount || splitBetween.length === 0}
            >
              {isLoading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;