import React, { useState, useEffect } from 'react';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getNotificationIcon = (message) => {
    if (message.includes('Added')) return '➕';
    if (message.includes('Removed')) return '➖';
    if (message.includes('redeemed')) return '🎁';
    return '🔔';
  };

  const getNotificationColor = (message) => {
    if (message.includes('Added')) return 'bg-green-50 border-green-200';
    if (message.includes('Removed')) return 'bg-red-50 border-red-200';
    if (message.includes('redeemed')) return 'bg-blue-50 border-blue-200';
    return 'bg-gray-50 border-gray-200';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="card fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              🔔 Notifications
            </h1>
            <p className="text-gray-600">
              Stay updated with your Good Girl Points activity
            </p>
          </div>
        </div>

        {/* Notifications List */}
        <div className="card fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Notifications</h2>
          
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-4 p-4 rounded-lg border ${getNotificationColor(notification.message)}`}
                >
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.message)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(notification.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600">
                You'll see notifications here when points are added, removed, or rewards are redeemed!
              </p>
            </div>
          )}
        </div>

        {/* Notification Stats */}
        {notifications.length > 0 && (
          <div className="card fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Notification Summary</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.message.includes('Added')).length}
                </div>
                <p className="text-green-700">Points Added</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {notifications.filter(n => n.message.includes('Removed')).length}
                </div>
                <p className="text-red-700">Points Removed</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => n.message.includes('redeemed')).length}
                </div>
                <p className="text-blue-700">Rewards Redeemed</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications; 