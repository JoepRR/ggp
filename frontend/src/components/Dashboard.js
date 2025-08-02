import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return <AdminDashboard data={dashboardData} />;
  }

  return <UserDashboard data={dashboardData} />;
}

function UserDashboard({ data }) {
  if (!data) return null;

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="card fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Hi Joep 💖
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              You've been such a good girl!
            </p>
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl p-6">
              <div className="text-4xl font-bold mb-2">
                {data.pointBalance} Points
              </div>
              <p className="text-primary-100">Current Balance</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
          {data.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {data.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.actionType === 'Add' ? 'bg-green-500' :
                      activity.actionType === 'Subtract' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-800">{activity.reason}</p>
                      <p className="text-sm text-gray-500">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    activity.points > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.points > 0 ? '+' : ''}{activity.points} points
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ data }) {
  if (!data) return null;

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="card fade-in">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage Joep's Good Girl Points and rewards
          </p>
        </div>

        {/* Joep's Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Joep's Status</h2>
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl p-6">
              <div className="text-3xl font-bold mb-2">
                {data.joep?.pointBalance || 0} Points
              </div>
              <p className="text-primary-100">Current Balance</p>
            </div>
          </div>

          <div className="card fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="btn-primary w-full">
                ➕ Add Points
              </button>
              <button className="btn-outline w-full">
                ➖ Remove Points
              </button>
              <button className="btn-secondary w-full">
                🎁 Manage Rewards
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Redemptions */}
          <div className="card fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Redemptions</h2>
            {data.recentRedemptions && data.recentRedemptions.length > 0 ? (
              <div className="space-y-3">
                {data.recentRedemptions.map((redemption, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{redemption.rewardName}</p>
                      <p className="text-sm text-gray-500">{formatDate(redemption.timestamp)}</p>
                    </div>
                    <div className="text-red-600 font-bold">
                      -{redemption.pointCost} points
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent redemptions</p>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="card fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Notifications</h2>
            {data.recentNotifications && data.recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {data.recentNotifications.map((notification, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <p className="text-gray-800">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(notification.timestamp)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 