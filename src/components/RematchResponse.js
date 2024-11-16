import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function RematchResponse({ rematchId }) {
    const[loading, setLoading] = useState(false);
    const[error, setError] = useState(null);
    const[status, setStatus] = useState('pending');

    useEffect(() => {
        // Socket.io listener for status updates
        socket.on('rematchStatusUpdate', (data) => {
            if (data.rematchId === rematchId) {
                setStatus(data.status);
            }
        });

        return () => {
            socket.off('rematchStatusUpdate');
        };
    },[rematchId]);

    const handleResponse = async (action) => {
        setLoading(true);
        setError(null);
        try {
            // Optimistically update status for immediate feedback
            setStatus(action === 'accept' ? 'accepted' : 'rejected');
            const response = await axios.post(`/api/rematch/${rematchId}/${action}`);
            // If server update fails, revert status
            if (response.status !== 200) {
                setStatus('pending');
            } else {
                // If successful, emit the status update to the server
                socket.emit('rematchStatusUpdate', { rematchId, status: response.data.status });
            }
        } catch (err) {
            setStatus('pending'); // Revert status on error
            setError('Failed to process your request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'pending') {
        return (
            <div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button onClick={() => handleResponse('accept')} disabled={loading}>Accept Rematch</button>
                <button onClick={() => handleResponse('reject')} disabled={loading}>Reject Rematch</button>
            </div>
        );
    } else {
        return <p>Rematch {status}.</p>;
    }
}

export default RematchResponse;