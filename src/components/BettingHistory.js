import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function BettingHistory() {
    const[bets, setBets] = useState([]);
    const[error, setError] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        const fetchBettingHistory = async () => {
            try {
                const response = await axios.get('/api/bets/history', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setBets(response.data);
            } catch (error) {
                setError('Failed to fetch betting history');
            }
        };

        fetchBettingHistory();
    }, []);

    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Betting History</h2>
            <table>
                <thead>
                    <tr>
                        <th>Game</th>
                        <th>Amount Bet</th>
                        <th>Winner</th>
                        <th>Payout</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {bets.map(bet => (
                        <tr key={bet._id}>
                            <td>{bet.match.game}</td>
                            <td>${bet.amount.toFixed(2)}</td>
                            <td>{bet.winner ? bet.winner.username : 'N/A'}</td>
                            <td>{bet.payout ? `$${bet.payout.toFixed(2)}` : 'N/A'}</td>
                            <td>{bet.status}</td>
                            <td>{new Date(bet.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default BettingHistory;