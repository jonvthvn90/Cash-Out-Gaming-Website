import React, { useState } from 'react';
import axios from 'axios';

function MatchResult({ match, tournamentId }) {
    const[winner, setWinner] = useState('');

    const handleSubmit = async () => {
        try {
            await axios.post(`http://localhost:5000/api/tournaments/${tournamentId}/matches/${match._id}/result`, { winnerId: winner });
            alert('Result submitted successfully');
        } catch (error) {
            console.error('Error submitting result:', error);
            alert('Failed to submit result');
        }
    };

    return (
        <div>
            <h3>Submit Result for Match</h3>
            <select value={winner} onChange={(e) => setWinner(e.target.value)}>
                <option value="">Select Winner</option>
                <option value={match.player1}>{match.player1}</option>
                <option value={match.player2}>{match.player2}</option>
            </select>
            <button onClick={handleSubmit}>Submit Result</button>
        </div>
    );
}

export default MatchResult;