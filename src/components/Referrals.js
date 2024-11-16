import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function Referral() {
    const[referralCode, setReferralCode] = useState('');
    const[error, setError] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        fetchReferralCode();
    }, []);

    const fetchReferralCode = async () => {
        try {
            const response = await axios.post('/api/referrals/code', {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setReferralCode(response.data.referralCode);
        } catch (error) {
            setError('Failed to generate referral code');
        }
    };

    const useReferral = async () => {
        const code = prompt("Enter Referral Code:");
        if (code) {
            try {
                const response = await axios.post('/api/referrals/use', { code }, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                alert(`Referral code used! You've received ${response.data.bonus} bonus points.`);
            } catch (error) {
                setError('Invalid or used referral code');
            }
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Refer a Friend</h2>
            <p>Your Referral Code: {referralCode}</p>
            <p>Share this code with your friends to earn rewards when they sign up and use it!</p>
            <button onClick={useReferral}>Use a Referral Code</button>
        </div>
    );
}

export default Referral;