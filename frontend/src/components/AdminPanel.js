import React, { useState, useEffect } from 'react';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('points');
  const [users, setUsers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersRes, rewardsRes, redemptionsRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/rewards', { credentials: 'include' }),
        fetch('/api/admin/redemptions', { credentials: 'include' })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }

      if (rewardsRes.ok) {
        const rewardsData = await rewardsRes.json();
        setRewards(rewardsData.rewards);
      }

      if (redemptionsRes.ok) {
        const redemptionsData = await redemptionsRes.json();
        setRedemptions(redemptionsData.redemptions);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'points', label: 'Points Management', icon: '💰' },
    { id: 'rewards', label: 'Rewards Management', icon: '🎁' },
    { id: 'redemptions', label: 'Redemption Tracker', icon: '📊' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="card fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              ⚙️ Admin Panel
            </h1>
            <p className="text-gray-600">
              Manage Good Girl Points, rewards, and track redemptions
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card fade-in">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="card fade-in">
          {activeTab === 'points' && (
            <PointsManagement users={users} onUpdate={fetchAdminData} />
          )}
          {activeTab === 'rewards' && (
            <RewardsManagement rewards={rewards} onUpdate={fetchAdminData} />
          )}
          {activeTab === 'redemptions' && (
            <RedemptionTracker redemptions={redemptions} />
          )}
        </div>
      </div>
    </div>
  );
}

function PointsManagement({ users, onUpdate }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [actionType, setActionType] = useState('Add');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !points || !reason) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedUser,
          actionType,
          points: parseInt(points),
          reason
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setSelectedUser('');
        setPoints('');
        setReason('');
        onUpdate();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Points Management</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('✅') ? 'bg-green-50 border border-green-200 text-green-700' :
          'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.pointBalance} points)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="input-field"
              required
            >
              <option value="Add">➕ Add Points</option>
              <option value="Subtract">➖ Remove Points</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points Amount
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="input-field"
              placeholder="Enter points amount"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field"
              placeholder="Enter reason for points change"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? 'Processing...' : `${actionType} Points`}
        </button>
      </form>
    </div>
  );
}

function RewardsManagement({ rewards, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', pointCost: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = editingReward 
        ? `/api/rewards/${editingReward.id}`
        : '/api/rewards';
      
      const method = editingReward ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage(`✅ Reward ${editingReward ? 'updated' : 'created'} successfully!`);
        setShowAddForm(false);
        setEditingReward(null);
        setFormData({ name: '', description: '', pointCost: '' });
        onUpdate();
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rewardId) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;

    try {
      const response = await fetch(`/api/rewards/${rewardId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setMessage('✅ Reward deleted successfully!');
        onUpdate();
      } else {
        setMessage('❌ Failed to delete reward');
      }
    } catch (error) {
      setMessage('❌ Network error. Please try again.');
    }
  };

  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description,
      pointCost: reward.pointCost.toString()
    });
    setShowAddForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Rewards Management</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingReward(null);
            setFormData({ name: '', description: '', pointCost: '' });
          }}
          className="btn-primary"
        >
          {showAddForm ? 'Cancel' : 'Add New Reward'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('✅') ? 'bg-green-50 border border-green-200 text-green-700' :
          'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-bold mb-4">
            {editingReward ? 'Edit Reward' : 'Add New Reward'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Reward name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field"
                required
              />
              <input
                type="number"
                placeholder="Point cost"
                value={formData.pointCost}
                onChange={(e) => setFormData({...formData, pointCost: e.target.value})}
                className="input-field"
                min="1"
                required
              />
            </div>
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="input-field"
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingReward ? 'Update Reward' : 'Add Reward')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingReward(null);
                  setFormData({ name: '', description: '', pointCost: '' });
                }}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {rewards.map((reward) => (
          <div key={reward.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{reward.name}</h3>
              <p className="text-gray-600">{reward.description}</p>
              <p className="text-sm text-primary-600 font-medium">{reward.pointCost} points</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(reward)}
                className="btn-outline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(reward.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RedemptionTracker({ redemptions }) {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Redemption Tracker</h2>
      
      {redemptions.length > 0 ? (
        <div className="space-y-4">
          {redemptions.map((redemption, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">🎁</div>
                <div>
                  <p className="font-medium text-gray-800">
                    {redemption.username} redeemed {redemption.rewardName}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(redemption.timestamp)}</p>
                </div>
              </div>
              <div className="text-red-600 font-bold">
                -{redemption.pointCost} points
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No redemptions yet
          </h3>
          <p className="text-gray-600">
            Redemption history will appear here once rewards are redeemed!
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminPanel; 