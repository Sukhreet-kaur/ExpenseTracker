import React, { useState } from 'react';
import './Modal.css';

const SettleUpModal = ({ isOpen, onClose, onSettle, balance, currentUser }) => {
  const [amount, setAmount] = useState(Math.abs(balance?.amount || 0));
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    setIsLoading(true);
    await onSettle({
      from: currentUser._id,
      to: balance?.to,
      amount: parseFloat(amount)
    });
    setIsLoading(false);
    onClose();
  };

  if (!isOpen || !balance) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settle Up</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="settle-info">
              <p>You owe <strong>{balance?.toUser}</strong></p>
              <p className="total-amount">Total: ₹{Math.abs(balance?.amount)}</p>
            </div>

            <div className="form-group">
              <label>Amount to Settle (₹)</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={Math.abs(balance?.amount)}
                required
              />
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="upi">UPI (Google Pay, PhonePe)</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-settle" disabled={isLoading || !amount}>
              {isLoading ? 'Processing...' : 'Confirm Settlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettleUpModal;