import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function BettingHistory() {
    const [bets, setBets] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
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
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBettingHistory();
        }
    }, [user]);

    // Render error if present
    if (error) return <div>Error: {error}</div>;

    // Render loading state
    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Betting History</h2>
            {bets.length === 0 ? (
                <p>You have no betting history yet.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f2f2f2' }}>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Game</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Amount Bet</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Winner</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Payout</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bets.map(bet => (
                            <tr key={bet._id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '8px' }}>{bet.match.game}</td>
                                <td style={{ padding: '8px' }}>${bet.amount.toFixed(2)}</td>
                                <td style={{ padding: '8px' }}>
                                    {bet.winner ? bet.winner.username : 'N/A'}
                                </td>
                                <td style={{ padding: '8px' }}>
                                    {bet.payout ? `$${bet.payout.toFixed(2)}` : 'Pending'}
                                </td>
                                <td style={{ padding: '8px' }}>{bet.status}</td>
                                <td style={{ padding: '8px' }}>
                                    {new Date(bet.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default BettingHistory;