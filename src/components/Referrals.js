import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

function Referral() {
    const [referralCode, setReferralCode] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            fetchReferralCode();
        }
    }, [user]);

    const fetchReferralCode = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/referrals/code', {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setReferralCode(response.data.referralCode);
        } catch (error) {
            setError('Failed to generate referral code');
            console.error('Error fetching referral code:', error);
        } finally {
            setLoading(false);
        }
    };

    const useReferral = async () => {
        const code = prompt("Enter Referral Code:");
        if (code) {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.post('/api/referrals/use', { code }, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                alert(`Referral code used! You've received ${response.data.bonus} bonus points.`);
                // Fetch updated referral code if necessary or update user context
            } catch (error) {
                setError(error.response?.data?.message || 'Invalid or used referral code');
                console.error('Error using referral code:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    if (!user) {
        return <div>Please log in to access referral features.</div>;
    }

    if (loading) return <div>Loading referral information...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="referral">
            <h2>Refer a Friend</h2>
            <p>Your Referral Code: <strong>{referralCode}</strong></p>
            <p>Share this code with your friends to earn rewards when they sign up and use it!</p>
            <button onClick={useReferral} disabled={loading}>Use a Referral Code</button>
        </div>
    );
}

Referral.propTypes = {
    user: PropTypes.shape({
        // Add relevant user properties here if needed
    })
};

export default Referral;