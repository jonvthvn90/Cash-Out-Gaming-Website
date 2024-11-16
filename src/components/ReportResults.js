import React, { useState } from 'react';
import axios from 'axios';

function ReportResult({ challengeId, onResultReported }) {
    const[winnerId, setWinnerId] = useState('');
    const[loserId, setLoserId] = useState('');
    const[scores, setScores] = useState({});

    const handleSubmit = async () => {
        try {
            await axios.post(`/api/challenges/${challengeId}/report`, { winnerId, loserId, scores });
            onResultReported();
        } catch (error) {
            console.error('Error reporting result:', error);
            alert('Failed to report result.');
        }
    };

    return (
        <div>
            <h3>Report Result</h3>
            <input type="text" value={winnerId} onChange={(e) => setWinnerId(e.target.value)} placeholder="Winner ID" />
            <input type="text" value={loserId} onChange={(e) => setLoserId(e.target.value)} placeholder="Loser ID" />
            <button onClick={handleSubmit}>Submit Result</button>
        </div>
    );
}

export default ReportResult;