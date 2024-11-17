import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

function PayoutTrigger({ tournamentId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tournamentResults, setTournamentResults] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        async function fetchTournamentResults() {
            try {
                setLoading(true);
                const response = await axios.get(`/api/tournaments/${tournamentId}/results`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setTournamentResults(response.data);
            } catch (error) {
                setError('Failed to fetch tournament results');
                console.error('Error fetching tournament results:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchTournamentResults();
    }, [tournamentId]);

    const handlePayout = async () => {
        if (!tournamentResults) {
            setError('Tournament results not available');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payouts = calculatePayouts(tournamentResults); // Implement this function
            const response = await axios.post(`/api/tournaments/${tournamentId}/payout`, {
                payouts: payouts,
                userId: user.stripeAccountId
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.status === 200) {
                alert('Payouts have been processed successfully');
            } else {
                throw new Error('Unexpected server response');
            }
        } catch (err) {
            setError('Failed to process payouts: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const calculatePayouts = (results) => {
        // This is a placeholder function. You should implement the actual payout calculation here
        // based on your tournament rules, rankings, and prize pool distribution.
        return results.map((player) => ({
            userId: player.user._id, // Assuming user object contains _id
            amount: player.prize || 0 // Assuming results include prize field
        }));
    };

    return (
        <div className="payout-trigger">
            <button 
                onClick={handlePayout} 
                disabled={loading || !tournamentResults}
                className="payout-button"
            >
                {loading ? 'Processing...' : 'Trigger Payout'}
            </button>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

PayoutTrigger.propTypes = {
    tournamentId: PropTypes.string.isRequired
};

export default PayoutTrigger;