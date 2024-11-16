import React, { useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Your server address

function RematchRequest({ challengeId }) {
    const[loading, setLoading] = useState(false);
    const[error, setError] = useState(null);

    const requestRematch = async () => {
        setLoading(true);
        setError(null);
        try {
            await axios.post(`/api/rematch/${challengeId}/request`);
            alert('Rematch requested successfully!');
        } catch (err) {
            setError('Failed to request rematch. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={requestRematch} disabled={loading}>
                {loading ? 'Requesting...' : 'Request Rematch'}
            </button>
        </div>
    );
}

export default RematchRequest;