import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const BettingPage = () => {
    const [matches, setMatches] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [betAmount, setBetAmount] = useState('');
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [selectedChoice, setSelectedChoice] = useState('');
    const [odds, setOdds] = useState(1); // This would typically come from backend
    const { user, updateUser } = useUser();

    useEffect(() => {
        fetchUpcomingMatches();
    }, []);

    const fetchUpcomingMatches = async () => {
        try {
            const response = await axios.get('/api/matches/upcoming', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setMatches(response.data.matches);
        } catch (error) {
            setError('Failed to fetch upcoming matches');
        } finally {
            setLoading(false);
        }
    };

    const placeBet = async () => {
        if (!selectedMatch || !selectedChoice || !betAmount || isNaN(betAmount) || betAmount <= 0) {
            setError('Please select a match, choose an outcome, and enter a valid bet amount');
            return;
        }

        try {
            const response = await axios.post('/api/betting/place', {
                matchId: selectedMatch._id,
                amount: parseFloat(betAmount),
                choice: selectedChoice,
                odds: odds // Sending odds, assuming the backend will use this for payout calculations
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (response.data.newBalance) {
                // Update user balance in the context if available
                updateUser({ ...user, balance: response.data.newBalance });
            }

            alert('Bet placed successfully!');
            fetchUpcomingMatches(); // Refresh matches list
            setBetAmount(''); // Clear the bet amount
            setSelectedChoice(''); // Reset selected choice
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while placing the bet');
        }
    };

    if (loading) return <div>Loading matches...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="betting-page">
            <h2>Place Your Bets</h2>
            <select 
                onChange={(e) => setSelectedMatch(JSON.parse(e.target.value))}
                value={selectedMatch ? JSON.stringify(selectedMatch) : ""}
            >
                <option value="">Select a Match</option>
                {matches.map(match => (
                    <option key={match._id} value={JSON.stringify(match)}>
                        {match.teamA.name} vs {match.teamB.name}
                    </option>
                ))}
            </select>

            {selectedMatch && (
                <div>
                    <h3>{selectedMatch.teamA.name} vs {selectedMatch.teamB.name}</h3>
                    <input 
                        type="number" 
                        value={betAmount} 
                        onChange={(e) => setBetAmount(e.target.value)} 
                        placeholder="Enter bet amount"
                        min="1"
                        step="0.01" // Allows for decimal amounts
                    />
                    <select 
                        onChange={(e) => setSelectedChoice(e.target.value)}
                        value={selectedChoice}
                    >
                        <option value="" disabled>Choose Outcome</option>
                        <option value="teamA">{selectedMatch.teamA.name} wins</option>
                        <option value="teamB">{selectedMatch.teamB.name} wins</option>
                        <option value="draw">Draw</option>
                    </select>
                    <button onClick={placeBet} disabled={!betAmount || !selectedChoice}>
                        Place Bet
                    </button>
                </div>
            )}

            <h3>Current Balance: ${user.balance.toFixed(2)}</h3>
        </div>
    );
};

export default BettingPage;