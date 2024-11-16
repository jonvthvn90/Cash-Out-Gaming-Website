import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PayoutStatus({ tournamentId }) {
    const[payoutStatus, setPayoutStatus] = useState('');

    useEffect(() => {
        async function fetchStatus() {
            const response = await axios.get(`http://localhost:5000/api/tournaments/${tournamentId}`);
            setPayoutStatus(response.data.payoutStatus);
        }
        fetchStatus();
    },[tournamentId]);

    return (
        <div>
            <h3>Payout Status</h3>
            <p>{payoutStatus}</p>
            {payoutStatus === 'not_paid' && <button onClick={() => handlePayout(tournamentId)}>Request Payout</button>}
        </div>
    );
}

function handlePayout(tournamentId) {
    // This would typically trigger an API call or a confirmation dialog
    alert('Payout requested for tournament ' + tournamentId);
    // Here you'd call an API to initiate payout
}

export default PayoutStatus;