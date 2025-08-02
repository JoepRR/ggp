import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function RewardsShop() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/rewards', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRewards(data.rewards);
      }
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId) => {
    setRedeeming(rewardId);
    setMessage('');

    try {
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ rewardId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`🎉 ${data.message}`);
        // Refresh user data to update balance
        window.location.reload();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Network error. Please try again.');
    } finally {
      setRedeeming(null);
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="card fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              🎁 Rewards Shop
            </h1>
            <p className="text-gray-600">
              Redeem your Good Girl Points for special rewards!
            </p>
            <div className="mt-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl p-4 inline-block">
              <div className="text-2xl font-bold">
                {user?.pointBalance || 0} Points Available
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`card fade-in ${
            message.includes('🎉') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <p className={`text-center font-medium ${
              message.includes('🎉') ? 'text-green-700' : 'text-red-700'
            }`}>
              {message}
            </p>
          </div>
        )}

        {/* Rewards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const canAfford = (user?.pointBalance || 0) >= reward.pointCost;
            
            return (
              <div key={reward.id} className="card fade-in hover:shadow-xl transition-shadow duration-300">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎁</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {reward.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {reward.description}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="text-2xl font-bold text-primary-600">
                      {reward.pointCost}
                    </span>
                    <span className="text-gray-500">points</span>
                  </div>

                  <button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={!canAfford || redeeming === reward.id}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      canAfford
                        ? 'bg-primary-500 hover:bg-primary-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {redeeming === reward.id ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Redeeming...
                      </span>
                    ) : canAfford ? (
                      'Redeem Now! 🎉'
                    ) : (
                      'Not enough points 😔'
                    )}
                  </button>

                  {!canAfford && (
                    <p className="text-sm text-gray-500 mt-2">
                      Need {reward.pointCost - (user?.pointBalance || 0)} more points
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {rewards.length === 0 && (
          <div className="card fade-in">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No rewards available
              </h3>
              <p className="text-gray-600">
                Check back later for new rewards!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RewardsShop; 