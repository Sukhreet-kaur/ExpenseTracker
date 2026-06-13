import React, { useState } from 'react';
import './Modal.css';

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
                placeholder="e.g., Flatmates, Trip to Goa, Office Team"
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
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-create" disabled={isLoading || !groupName.trim()}>
              {isLoading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;