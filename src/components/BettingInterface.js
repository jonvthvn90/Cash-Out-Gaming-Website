import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BettingInterface = ({ matchId }) => {
    const [amount, setAmount] = useState(1);
    const [predictedWinner, setPredictedWinner] = useState('');
    const [match, setMatch] = useState(null);
    const [error, setError] = useState(null);
    const [betPlaced, setBetPlaced] = useState(false);

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const response = await axios.get(`/api/matches/${matchId}`);
                setMatch(response.data);
            } catch (error) {
                setError('Failed to fetch match data');
                console.error('Failed to fetch match:', error);
            }
        };

        fetchMatch();
    }, [matchId]);

    const placeBet = async (event) => {
        event.preventDefault();
        if (!predictedWinner) {
            setError('Please select a predicted winner');
            return;
        }

        try {
            const response = await axios.post(`/api/matches/${matchId}/bet`, { amount, predictedWinner });
            setBetPlaced(true);
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message);
            } else {
                setError('An error occurred while placing your bet');
            }
        }
    };

    if (!match) return <div>Loading match details...</div>;

    return (
        <div className="betting-interface">
            <h2>Place Your Bet</h2>
            {betPlaced ? (
                <p>Bet placed successfully!</p>
            ) : (
                <form onSubmit={placeBet}>
                    <select 
                        value={predictedWinner} 
                        onChange={e => setPredictedWinner(e.target.value)}
                        required
                    >
                        <option value="">Select a winner</option>
                        {match.participants.map(participant => (
                            <option key={participant} value={participant}>{participant}</option>
                        ))}
                    </select>
                    <select 
                        value={amount} 
                        onChange={e => setAmount(Number(e.target.value))}
                        required
                    >
                        <option value={1}>$1</option>
                        <option value={5}>$5</option>
                        <option value={10}>$10</option>
                    </select>
                    <button type="submit">Place Bet</button>
                </form>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default BettingInterface;