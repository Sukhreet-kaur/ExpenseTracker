// AddExpenseModal.jsx
import React, { useState, useEffect } from 'react';
import './AddExpense.css';

const AddExpenseModal = ({ isOpen, onClose, onAddExpense, members, currentUser, groupId, token }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'INR',
    paid_by: '',
    date: new Date().toISOString().split('T')[0],
    split_type: 'equal',
    split_details: '',
    notes: ''
  });

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [splitValues, setSplitValues] = useState({});
  const [splitPercentages, setSplitPercentages] = useState({});
  const [splitShares, setSplitShares] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen && members.length > 0) {
      const allMemberIds = members.map(m => m._id);
      setSelectedMembers(allMemberIds);
      
      const initialValues = {};
      const initialPercentages = {};
      const initialShares = {};
      allMemberIds.forEach(memberId => {
        initialValues[memberId] = '';
        initialPercentages[memberId] = '';
        initialShares[memberId] = '';
      });
      setSplitValues(initialValues);
      setSplitPercentages(initialPercentages);
      setSplitShares(initialShares);
      
      if (!formData.paid_by && currentUser) {
        setFormData(prev => ({ ...prev, paid_by: currentUser._id }));
      }
    }
  }, [isOpen, members, currentUser]);

  // Calculate preview amounts
  const calculatePreviewAmounts = () => {
    const amount = parseFloat(formData.amount);
    if (!amount || selectedMembers.length === 0) return {};

    switch (formData.split_type) {
      case 'equal':
        const equalAmount = amount / selectedMembers.length;
        const equalValues = {};
        selectedMembers.forEach(memberId => {
          equalValues[memberId] = equalAmount;
        });
        return equalValues;

      case 'percentage':
        const percentageValues = {};
        let totalPercentage = 0;
        selectedMembers.forEach(memberId => {
          const val = parseFloat(splitPercentages[memberId]) || 0;
          totalPercentage += val;
        });
        if (Math.abs(totalPercentage - 100) < 0.01) {
          selectedMembers.forEach(memberId => {
            const percentage = parseFloat(splitPercentages[memberId]) || 0;
            percentageValues[memberId] = (amount * percentage / 100);
          });
        }
        return percentageValues;

      case 'unequal':
        const unequalValues = {};
        selectedMembers.forEach(memberId => {
          const val = parseFloat(splitValues[memberId]) || 0;
          unequalValues[memberId] = val;
        });
        return unequalValues;

      case 'share':
        const shareValues = {};
        let totalShares = 0;
        selectedMembers.forEach(memberId => {
          const val = parseFloat(splitShares[memberId]) || 0;
          totalShares += val;
        });
        if (totalShares > 0) {
          selectedMembers.forEach(memberId => {
            const share = parseFloat(splitShares[memberId]) || 0;
            shareValues[memberId] = (amount * share / totalShares);
          });
        }
        return shareValues;

      default:
        return {};
    }
  };

  const previewAmounts = calculatePreviewAmounts();
  const totalPreviewAmount = Object.values(previewAmounts).reduce((sum, val) => sum + (val || 0), 0);
  const totalAmount = parseFloat(formData.amount) || 0;

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.paid_by) {
      newErrors.paid_by = 'Please select who paid';
    }
    if (selectedMembers.length === 0) {
      newErrors.splits = 'Select at least one member to split with';
    }

    // Validate based on split type
    if (formData.split_type === 'percentage') {
      let total = 0;
      selectedMembers.forEach(memberId => {
        total += parseFloat(splitPercentages[memberId]) || 0;
      });
      if (Math.abs(total - 100) > 0.01) {
        newErrors.splits = `Total percentage must be 100% (currently ${total}%)`;
      }
      // Check if any member has percentage
      const hasValues = selectedMembers.some(memberId => parseFloat(splitPercentages[memberId]) > 0);
      if (!hasValues) {
        newErrors.splits = 'Please enter percentage for at least one member';
      }
    }

    if (formData.split_type === 'unequal') {
      let total = 0;
      selectedMembers.forEach(memberId => {
        total += parseFloat(splitValues[memberId]) || 0;
      });
      if (Math.abs(total - totalAmount) > 0.01) {
        newErrors.splits = `Total amount (${total}) must equal ${totalAmount}`;
      }
      // Check if any member has value
      const hasValues = selectedMembers.some(memberId => parseFloat(splitValues[memberId]) > 0);
      if (!hasValues) {
        newErrors.splits = 'Please enter amount for at least one member';
      }
    }

    if (formData.split_type === 'share') {
      let total = 0;
      selectedMembers.forEach(memberId => {
        total += parseFloat(splitShares[memberId]) || 0;
      });
      if (total <= 0) {
        newErrors.splits = 'Total shares must be greater than 0';
      }
      const hasValues = selectedMembers.some(memberId => parseFloat(splitShares[memberId]) > 0);
      if (!hasValues) {
        newErrors.splits = 'Please enter shares for at least one member';
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
    
    switch (formData.split_type) {
      case 'equal':
        const equalAmount = amount / selectedMembers.length;
        splits = selectedMembers.map(memberId => ({
          user_id: memberId,
          amount: equalAmount,
          value: equalAmount
        }));
        break;
        
      case 'percentage':
        splits = selectedMembers.map(memberId => ({
          user_id: memberId,
          percentage: parseFloat(splitPercentages[memberId]) || 0,
          amount: (amount * (parseFloat(splitPercentages[memberId]) || 0) / 100)
        }));
        break;
        
      case 'unequal':
        splits = selectedMembers.map(memberId => ({
          user_id: memberId,
          amount: parseFloat(splitValues[memberId]) || 0,
          value: parseFloat(splitValues[memberId]) || 0
        }));
        break;
        
      case 'share':
        let totalShares = 0;
        selectedMembers.forEach(memberId => {
          totalShares += parseFloat(splitShares[memberId]) || 0;
        });
        splits = selectedMembers.map(memberId => ({
          user_id: memberId,
          shares: parseFloat(splitShares[memberId]) || 0,
          amount: totalShares > 0 ? (amount * (parseFloat(splitShares[memberId]) || 0) / totalShares) : 0
        }));
        break;
    }

    const expenseData = {
      description: formData.description,
      amount: amount,
      currency: formData.currency,
      paid_by: formData.paid_by,
      date: formData.date,
      split_type: formData.split_type,
      split_details: formData.split_details,
      notes: formData.notes,
      splits: splits,
      split_with: selectedMembers.map(id => {
        const member = members.find(m => m._id === id);
        return member?.name;
      }).join(';')
    };

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
      split_details: '',
      notes: ''
    });
    setSelectedMembers(members.map(m => m._id));
    setSplitValues({});
    setSplitPercentages({});
    setSplitShares({});
    setErrors({});
  };

  const handleMemberToggle = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
      const newValues = { ...splitValues };
      const newPercentages = { ...splitPercentages };
      const newShares = { ...splitShares };
      delete newValues[memberId];
      delete newPercentages[memberId];
      delete newShares[memberId];
      setSplitValues(newValues);
      setSplitPercentages(newPercentages);
      setSplitShares(newShares);
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
      setSplitValues({ ...splitValues, [memberId]: '' });
      setSplitPercentages({ ...splitPercentages, [memberId]: '' });
      setSplitShares({ ...splitShares, [memberId]: '' });
    }
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
      setSplitValues({});
      setSplitPercentages({});
      setSplitShares({});
    } else {
      const allIds = members.map(m => m._id);
      setSelectedMembers(allIds);
      const newValues = {};
      const newPercentages = {};
      const newShares = {};
      allIds.forEach(id => { 
        newValues[id] = ''; 
        newPercentages[id] = '';
        newShares[id] = '';
      });
      setSplitValues(newValues);
      setSplitPercentages(newPercentages);
      setSplitShares(newShares);
    }
  };

  const getSplitInputField = (member) => {
    const amount = parseFloat(formData.amount) || 0;
    
    switch (formData.split_type) {
      case 'equal':
        const equalAmount = selectedMembers.length > 0 ? (amount / selectedMembers.length).toFixed(2) : 0;
        return <div className="split-preview">{formData.currency === 'USD' ? '$' : '₹'}{equalAmount}</div>;
        
      case 'percentage':
        return (
          <div className="split-input-group">
            <input
              type="number"
              step="0.1"
              placeholder="%"
              value={splitPercentages[member._id] || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                setSplitPercentages({ ...splitPercentages, [member._id]: newValue });
                // Auto-calculate last person to make 100%
                if (selectedMembers.length > 1) {
                  const lastMember = selectedMembers[selectedMembers.length - 1];
                  if (member._id !== lastMember) {
                    const otherTotal = selectedMembers
                      .filter(id => id !== member._id && id !== lastMember)
                      .reduce((sum, id) => sum + (parseFloat(splitPercentages[id]) || 0), 0);
                    const currentVal = parseFloat(newValue) || 0;
                    const remaining = 100 - (otherTotal + currentVal);
                    if (remaining >= 0 && remaining <= 100) {
                      setSplitPercentages(prev => ({ ...prev, [lastMember]: remaining.toString() }));
                    }
                  }
                }
              }}
              className="split-input"
            />
            <span className="split-unit">%</span>
          </div>
        );
        
      case 'unequal':
        return (
          <div className="split-input-group">
            <span className="currency-symbol">{formData.currency === 'USD' ? '$' : '₹'}</span>
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={splitValues[member._id] || ''}
              onChange={(e) => setSplitValues({ ...splitValues, [member._id]: e.target.value })}
              className="split-input"
            />
          </div>
        );
        
      case 'share':
        return (
          <div className="split-input-group">
            <input
              type="number"
              step="1"
              placeholder="Shares"
              value={splitShares[member._id] || ''}
              onChange={(e) => setSplitShares({ ...splitShares, [member._id]: e.target.value })}
              className="split-input"
            />
            <span className="split-unit">shares</span>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Generate split details string for preview
  const getSplitDetailsString = () => {
    if (formData.split_type === 'equal') return null;
    
    if (formData.split_type === 'percentage') {
      const details = selectedMembers
        .map(memberId => {
          const member = members.find(m => m._id === memberId);
          const percentage = splitPercentages[memberId];
          if (percentage && parseFloat(percentage) > 0) {
            return `${member?.name} ${percentage}%`;
          }
          return null;
        })
        .filter(Boolean)
        .join('; ');
      return details;
    }
    
    if (formData.split_type === 'unequal') {
      const details = selectedMembers
        .map(memberId => {
          const member = members.find(m => m._id === memberId);
          const value = splitValues[memberId];
          if (value && parseFloat(value) > 0) {
            return `${member?.name} ${formData.currency === 'USD' ? '$' : '₹'}${value}`;
          }
          return null;
        })
        .filter(Boolean)
        .join('; ');
      return details;
    }
    
    if (formData.split_type === 'share') {
      const details = selectedMembers
        .map(memberId => {
          const member = members.find(m => m._id === memberId);
          const shares = splitShares[memberId];
          if (shares && parseFloat(shares) > 0) {
            return `${member?.name} ${shares} shares`;
          }
          return null;
        })
        .filter(Boolean)
        .join('; ');
      return details;
    }
    
    return null;
  };

  if (!isOpen) return null;

  const splitDetailsString = getSplitDetailsString();

  return (
    <div className="expense-modal-overlay" onClick={onClose}>
      <div className="expense-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="expense-modal-header">
          <h2>➕ Add New Expense</h2>
          <button className="expense-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="expense-modal-body">
            {/* Description */}
            <div className="expense-form-group">
              <label>Description <span className="required">*</span></label>
              <input
                type="text"
                placeholder="e.g., February rent, Groceries, Dinner at Marina Bites"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            {/* Amount and Currency */}
            <div className="expense-form-row">
              <div className="expense-form-group">
                <label>Amount <span className="required">*</span></label>
                <div className="amount-input-wrapper">
                  <span className="currency-prefix">{formData.currency === 'USD' ? '$' : '₹'}</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className={errors.amount ? 'error' : ''}
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

            {/* Paid By and Date */}
            <div className="expense-form-row">
              <div className="expense-form-group">
                <label>Paid By <span className="required">*</span></label>
                <select
                  value={formData.paid_by}
                  onChange={(e) => setFormData({...formData, paid_by: e.target.value})}
                  className={errors.paid_by ? 'error' : ''}
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

            {/* Split Type */}
            <div className="expense-form-group">
              <label>Split Type</label>
              <div className="split-type-buttons">
                <button
                  type="button"
                  className={`split-type-btn ${formData.split_type === 'equal' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, split_type: 'equal'})}
                >
                  ⚖️ Equal
                </button>
                <button
                  type="button"
                  className={`split-type-btn ${formData.split_type === 'unequal' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, split_type: 'unequal'})}
                >
                  📊 Unequal
                </button>
                <button
                  type="button"
                  className={`split-type-btn ${formData.split_type === 'percentage' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, split_type: 'percentage'})}
                >
                  📈 Percentage
                </button>
                <button
                  type="button"
                  className={`split-type-btn ${formData.split_type === 'share' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, split_type: 'share'})}
                >
                  🔢 Share
                </button>
              </div>
            </div>

            {/* Split Among Members */}
            <div className="expense-form-group">
              <div className="split-header">
                <label>Split Among</label>
                <button type="button" className="select-all-btn" onClick={handleSelectAll}>
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
                        onChange={() => handleMemberToggle(member._id)}
                      />
                      <span className="member-name">
                        {member.name} {member._id === currentUser?._id && '(You)'}
                      </span>
                    </label>
                    {selectedMembers.includes(member._id) && (
                      <div className="member-split-value">
                        {getSplitInputField(member)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.splits && <span className="error-message">{errors.splits}</span>}
            </div>

            {/* Split Details Display */}
            {splitDetailsString && (
              <div className="expense-form-group">
                <label>Split Details</label>
                <div className="split-details-preview">
                  {splitDetailsString}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="expense-form-group">
              <label>Notes (Optional)</label>
              <textarea
                rows="2"
                placeholder="Add any notes about this expense..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="notes-input"
              />
            </div>

            {/* Preview Section */}
            {selectedMembers.length > 0 && totalAmount > 0 && Object.keys(previewAmounts).length > 0 && (
              <div className="expense-preview">
                <h4>Preview</h4>
                <div className="preview-items">
                  {selectedMembers.map(memberId => {
                    const member = members.find(m => m._id === memberId);
                    const amount = previewAmounts[memberId];
                    if (amount === undefined || amount === null) return null;
                    return (
                      <div key={memberId} className="preview-item">
                        <span className="preview-name">{member?.name}</span>
                        <span className="preview-amount">
                          {formData.currency === 'USD' ? '$' : '₹'}{Math.abs(amount).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="preview-total">
                  <span>Total:</span>
                  <span className="total-amount">
                    {formData.currency === 'USD' ? '$' : '₹'}{totalPreviewAmount.toFixed(2)}
                  </span>
                </div>
                {Math.abs(totalPreviewAmount - totalAmount) > 0.01 && (
                  <div className="preview-warning">
                    ⚠️ Split total doesn't match amount
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="expense-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
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