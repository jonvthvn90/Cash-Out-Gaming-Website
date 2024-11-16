import React, { useState } from 'react';
import axios from 'axios';

function PayoutTrigger({ tournamentId }) {
    const[loading, setLoading] = useState(false);
    const[error, setError] = useState(null);

    const handlePayout = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`/api/tournaments/${tournamentId}/payout`, {
                amount: /* calculate based on tournament results */,
                userId: /* user's Stripe connected account ID or similar identifier */
            });
            alert('Payouts have been processed successfully');
        } catch (err) {
            setError('Failed to process payouts: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={handlePayout} disabled={loading}>
                {loading ? 'Processing...' : 'Trigger Payout'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default PayoutTrigger;