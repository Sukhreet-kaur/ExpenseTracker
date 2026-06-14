// AddExpenseModal.jsx - Complete Working Version
import React, { useState, useEffect } from 'react';
import './AddExpense.css';

const AddExpenseModal = ({ isOpen, onClose, onAddExpense, members, currentUser }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'INR',
    paid_by: '',
    date: new Date().toISOString().split('T')[0],
    split_type: 'equal',
    notes: ''
  });

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [splitValues, setSplitValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('Modal isOpen:', isOpen);
    console.log('Members:', members);
    console.log('CurrentUser:', currentUser);
    
    if (isOpen && members && members.length > 0) {
      const allMemberIds = members.map(m => m._id);
      setSelectedMembers(allMemberIds);
      
      const initialValues = {};
      allMemberIds.forEach(memberId => {
        initialValues[memberId] = '';
      });
      setSplitValues(initialValues);
      
      if (!formData.paid_by && currentUser) {
        setFormData(prev => ({ ...prev, paid_by: currentUser._id }));
      }
    }
  }, [isOpen, members]);

  const getPreviewAmount = (memberId) => {
    const amount = parseFloat(formData.amount);
    if (!amount || selectedMembers.length === 0) return 0;
    
    if (formData.split_type === 'equal') {
      return amount / selectedMembers.length;
    } else if (formData.split_type === 'unequal') {
      return parseFloat(splitValues[memberId]) || 0;
    }
    return 0;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) newErrors.description = 'Description required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount required';
    if (!formData.paid_by) newErrors.paid_by = 'Select who paid';
    if (selectedMembers.length === 0) newErrors.splits = 'Select at least one member';
    
    if (formData.split_type === 'unequal') {
      let total = 0;
      selectedMembers.forEach(id => {
        total += parseFloat(splitValues[id]) || 0;
      });
      if (Math.abs(total - parseFloat(formData.amount)) > 0.01) {
        newErrors.splits = `Total (${total}) must equal ${formData.amount}`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    
    const amount = parseFloat(formData.amount);
    let splits = [];
    
    if (formData.split_type === 'equal') {
      const equalAmount = amount / selectedMembers.length;
      splits = selectedMembers.map(memberId => ({
        user_id: memberId,
        amount: equalAmount
      }));
    } else if (formData.split_type === 'unequal') {
      splits = selectedMembers.map(memberId => ({
        user_id: memberId,
        amount: parseFloat(splitValues[memberId]) || 0
      }));
    }

    const expenseData = {
      description: formData.description,
      amount: amount,
      currency: formData.currency,
      paid_by: formData.paid_by,
      date: formData.date,
      split_type: formData.split_type,
      notes: formData.notes || '',
      splits: splits
    };

    console.log('Sending expense data:', expenseData);
    await onAddExpense(expenseData);
    setIsLoading(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      currency: 'INR',
      paid_by: currentUser?._id || '',
      date: new Date().toISOString().split('T')[0],
      split_type: 'equal',
      notes: ''
    });
    setSelectedMembers(members?.map(m => m._id) || []);
    setSplitValues({});
    setErrors({});
  };

  const handleSplitChange = (memberId, value) => {
    setSplitValues({ ...splitValues, [memberId]: value });
  };

  if (!isOpen) return null;

  if (!members || members.length === 0) {
    return (
      <div className="expense-modal-overlay" onClick={onClose}>
        <div className="expense-modal-container">
          <div className="expense-modal-header">
            <h2>Error</h2>
            <button className="expense-modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="expense-modal-body">
            <p>No members found in this group. Please add members first.</p>
          </div>
          <div className="expense-modal-footer">
            <button className="btn-cancel" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = parseFloat(formData.amount) || 0;
  const previewTotal = formData.split_type === 'equal' 
    ? totalAmount 
    : Object.values(splitValues).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

  return (
    <div className="expense-modal-overlay" onClick={onClose}>
      <div className="expense-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="expense-modal-header">
          <h2>➕ Add New Expense</h2>
          <button className="expense-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="expense-modal-body">
            <div className="expense-form-group">
              <label>Description <span className="required">*</span></label>
              <input
                type="text"
                placeholder="e.g., Pizza Party, Dinner, Groceries"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="expense-form-row">
              <div className="expense-form-group">
                <label>Amount <span className="required">*</span></label>
                <div className="amount-input-wrapper">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                {errors.amount && <span className="error-message">{errors.amount}</span>}
              </div>

              <div className="expense-form-group">
                <label>Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                >
                  <option value="INR">🇮🇳 INR (₹)</option>
                  <option value="USD">🇺🇸 USD ($)</option>
                  <option value="EUR">🇪🇺 EUR (€)</option>
                  <option value="GBP">🇬🇧 GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="expense-form-row">
              <div className="expense-form-group">
                <label>Paid By <span className="required">*</span></label>
                <select
                  value={formData.paid_by}
                  onChange={(e) => setFormData({...formData, paid_by: e.target.value})}
                >
                  <option value="">Select who paid</option>
                  {members.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.name} {member._id === currentUser?._id && '(You)'}
                    </option>
                  ))}
                </select>
                {errors.paid_by && <span className="error-message">{errors.paid_by}</span>}
              </div>

              <div className="expense-form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

            <div className="expense-form-group">
              <label>Split Type <span className="required">*</span></label>
              <select
                value={formData.split_type}
                onChange={(e) => setFormData({...formData, split_type: e.target.value})}
                className="split-type-select"
              >
                <option value="equal">⚖️ Equal Split (Everyone pays equally)</option>
                <option value="unequal">📊 Unequal Split (Custom amounts per person)</option>
              </select>
            </div>

            <div className="expense-form-group">
              <div className="split-header">
                <label>Split Among <span className="required">*</span></label>
                <button type="button" className="select-all-btn" onClick={() => {
                  if (selectedMembers.length === members.length) {
                    setSelectedMembers([]);
                  } else {
                    setSelectedMembers(members.map(m => m._id));
                  }
                }}>
                  {selectedMembers.length === members.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="members-split-list">
                {members.map(member => (
                  <div key={member._id} className="member-split-item">
                    <label className="member-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member._id)}
                        onChange={() => {
                          if (selectedMembers.includes(member._id)) {
                            setSelectedMembers(selectedMembers.filter(id => id !== member._id));
                          } else {
                            setSelectedMembers([...selectedMembers, member._id]);
                          }
                        }}
                      />
                      <span className="member-name">{member.name}</span>
                    </label>
                    
                    {selectedMembers.includes(member._id) && formData.split_type === 'unequal' && (
                      <div className="member-split-value">
                        <div className="split-input-group">
                          <span className="currency-symbol">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            value={splitValues[member._id] || ''}
                            onChange={(e) => handleSplitChange(member._id, e.target.value)}
                            className="split-input"
                          />
                        </div>
                      </div>
                    )}
                    
                    {selectedMembers.includes(member._id) && formData.split_type === 'equal' && (
                      <div className="split-preview">
                        ₹{(totalAmount / selectedMembers.length).toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.splits && <span className="error-message">{errors.splits}</span>}
            </div>

            <div className="expense-form-group">
              <label>Notes (Optional)</label>
              <textarea
                rows="2"
                placeholder="Add any notes..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="notes-input"
              />
            </div>

            {selectedMembers.length > 0 && totalAmount > 0 && (
              <div className="expense-preview">
                <h4>Preview - Each person pays:</h4>
                <div className="preview-items">
                  {selectedMembers.map(memberId => {
                    const member = members.find(m => m._id === memberId);
                    let amount = 0;
                    if (formData.split_type === 'equal') {
                      amount = totalAmount / selectedMembers.length;
                    } else {
                      amount = parseFloat(splitValues[memberId]) || 0;
                    }
                    return (
                      <div key={memberId} className="preview-item">
                        <span className="preview-name">{member?.name}</span>
                        <span className="preview-amount">₹{amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="preview-total">
                  <span>Total:</span>
                  <span className="total-amount">₹{previewTotal.toFixed(2)}</span>
                </div>
                {Math.abs(previewTotal - totalAmount) > 0.01 && (
                  <div className="preview-warning">
                    ⚠️ Split total doesn't match amount
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="expense-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={isLoading}>
              {isLoading ? 'Saving...' : '💾 Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;