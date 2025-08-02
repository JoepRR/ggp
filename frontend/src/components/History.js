import React, { useState, useEffect } from 'react';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'Add':
        return '➕';
      case 'Subtract':
        return '➖';
      case 'Redemption':
        return '🎁';
      default:
        return '📝';
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'Add':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Subtract':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Redemption':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="card fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              📜 My History
            </h1>
            <p className="text-gray-600">
              Complete activity log of your Good Girl Points
            </p>
          </div>
        </div>

        {/* History List */}
        <div className="card fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Activity Log</h2>
          
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border ${getActionColor(entry.actionType)}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getActionIcon(entry.actionType)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {entry.reason}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold text-lg ${
                    entry.points > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {entry.points > 0 ? '+' : ''}{entry.points} points
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No activity yet
              </h3>
              <p className="text-gray-600">
                Your activity history will appear here once you start earning or spending points!
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {history.length > 0 && (
          <div className="card fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Summary</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {history.filter(entry => entry.actionType === 'Add').length}
                </div>
                <p className="text-green-700">Points Added</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {history.filter(entry => entry.actionType === 'Subtract').length}
                </div>
                <p className="text-red-700">Points Removed</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {history.filter(entry => entry.actionType === 'Redemption').length}
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

export default History; 