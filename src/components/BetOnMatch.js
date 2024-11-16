import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function BetOnMatch({ match }) {
    const[amount, setAmount] = useState('');
    const[error, setError] = useState('');
    const { user } = useUser();

    const handleBet = async (playerId) => {
        if (!amount || isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        try {
            const response = await axios.post('/api/bets', {
                matchId: match._id,
                amount: parseFloat(amount),
                winnerId: playerId
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            alert('Bet placed successfully');
            setAmount('');
        } catch (error) {
            setError(error.response?.data?.message || 'Could not place bet');
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div>
            <h3>Place Bet on {match.game}</h3>
            <p>Balance: ${user.balance}</p>
            <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="Bet Amount"
            />
            <button onClick={() => handleBet(match.player1)}>{match.player1.username}</button>
            <button onClick={() => handleBet(match.player2)}>{match.player2.username}</button>
        </div>
    );
}

export default BetOnMatch;