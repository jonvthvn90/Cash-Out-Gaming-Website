import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function BetOnMatch({ match }) {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const { user, updateUser } = useUser();

    // Function to handle betting process
    const handleBet = async (playerId) => {
        // Input validation
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

            // Update user balance in the context if available
            if (response.data.newBalance) {
                updateUser({ ...user, balance: response.data.newBalance });
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Could not place bet');
        }
    };

    // Render error if present
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h3>Place Bet on {match.game}</h3>
            <p>Balance: ${user.balance.toFixed(2)}</p>
            <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="Bet Amount"
                min="0"
            />
            <button 
                onClick={() => handleBet(match.player1.id)} 
                disabled={!amount || user.balance < parseFloat(amount)}
            >
                Bet on {match.player1.username}
            </button>
            <button 
                onClick={() => handleBet(match.player2.id)} 
                disabled={!amount || user.balance < parseFloat(amount)}
            >
                Bet on {match.player2.username}
            </button>
        </div>
    );
}

export default BetOnMatch;