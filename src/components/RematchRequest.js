import React, { useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import PropTypes from 'prop-types';

// Update with your server address
const socket = io('http://localhost:5000');

function RematchRequest({ challengeId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const requestRematch = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`/api/rematch/${challengeId}/request`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            // Emit a socket event to notify real-time updates
            socket.emit('rematchRequested', { challengeId });

            alert('Rematch requested successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request rematch. Please try again.');
            console.error('Rematch request error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rematch-request">
            {error && <p className="error-message">{error}</p>}
            <button 
                onClick={requestRematch} 
                disabled={loading}
                className="rematch-button"
            >
                {loading ? 'Requesting...' : 'Request Rematch'}
            </button>
        </div>
    );
}

RematchRequest.propTypes = {
    challengeId: PropTypes.string.isRequired
};

export default RematchRequest;