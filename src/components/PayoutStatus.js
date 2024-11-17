import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

function PayoutStatus({ tournamentId }) {
    const [payoutStatus, setPayoutStatus] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/tournaments/${tournamentId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setPayoutStatus(response.data.payoutStatus);
            } catch (error) {
                setError('Failed to fetch payout status');
                console.error('Error fetching payout status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [tournamentId]);

    const handlePayout = async () => {
        try {
            setLoading(true);
            await axios.post(`/api/tournaments/${tournamentId}/payout`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setPayoutStatus('pending'); // Assuming the backend changes status to 'pending' when a payout is requested
            alert('Payout requested successfully');
        } catch (error) {
            setError('Failed to request payout');
            console.error('Payout request failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading payout status...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="payout-status">
            <h3>Payout Status</h3>
            <p>{payoutStatus ? payoutStatus : 'No status available'}</p>
            {payoutStatus === 'not_paid' && (
                <button 
                    onClick={handlePayout} 
                    disabled={loading}
                    className="payout-button"
                >
                    Request Payout
                </button>
            )}
        </div>
    );
}

PayoutStatus.propTypes = {
    tournamentId: PropTypes.string.isRequired
};

export default PayoutStatus;