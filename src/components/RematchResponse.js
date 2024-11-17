import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import PropTypes from 'prop-types';

const socket = io('http://localhost:3000');

function RematchResponse({ rematchId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('pending');

    useEffect(() => {
        // Socket.io listener for status updates
        socket.on('rematchStatusUpdate', (data) => {
            if (data.rematchId === rematchId) {
                setStatus(data.status);
            }
        });

        // Initial fetch to get the current status
        const fetchStatus = async () => {
            try {
                const response = await axios.get(`/api/rematch/${rematchId}/status`);
                setStatus(response.data.status);
            } catch (err) {
                setError('Failed to fetch rematch status. Please try again.');
            }
        };

        fetchStatus();

        return () => {
            socket.off('rematchStatusUpdate');
        };
    }, [rematchId]);

    const handleResponse = async (action) => {
        setLoading(true);
        setError(null);
        try {
            // Optimistically update status for immediate feedback
            setStatus(action === 'accept' ? 'accepted' : 'rejected');
            const response = await axios.post(`/api/rematch/${rematchId}/${action}`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            // If server update fails, revert status
            if (response.status !== 200) {
                setStatus('pending');
                throw new Error('Server update failed');
            } else {
                // If successful, emit the status update to the server
                socket.emit('rematchStatusUpdate', { rematchId, status: response.data.status });
            }
        } catch (err) {
            setStatus('pending'); // Revert status on error
            setError(err.message || 'Failed to process your request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'pending') {
        return (
            <div className="rematch-response">
                {error && <p className="error-message">{error}</p>}
                <button 
                    onClick={() => handleResponse('accept')} 
                    disabled={loading}
                    className="action-button accept-button"
                >
                    {loading ? 'Accepting...' : 'Accept Rematch'}
                </button>
                <button 
                    onClick={() => handleResponse('reject')} 
                    disabled={loading}
                    className="action-button reject-button"
                >
                    {loading ? 'Rejecting...' : 'Reject Rematch'}
                </button>
            </div>
        );
    } else {
        return <p className="rematch-status">Rematch {status}.</p>;
    }
}

RematchResponse.propTypes = {
    rematchId: PropTypes.string.isRequired
};

export default RematchResponse;