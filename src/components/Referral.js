import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const Referral = () => {
    const [referralCode, setReferralCode] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [referralStats, setReferralStats] = useState({});
    const { user } = useUser();
    const [useCode, setUseCode] = useState('');

    useEffect(() => {
        fetchReferralStats();
    }, []);

    const fetchReferralStats = async () => {
        try {
            const response = await axios.get('/api/referral/stats', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setReferralStats(response.data);
        } catch (error) {
            setError('Failed to fetch referral stats');
        } finally {
            setLoading(false);
        }
    };

    const generateReferralCode = async () => {
        try {
            const response = await axios.post('/api/referral/generate', {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setReferralCode(response.data.referralCode);
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred generating the referral code');
        }
    };

    const handleUseReferralCode = async () => {
        if (!useCode) {
            setError('Please enter a referral code');
            return;
        }
        try {
            await axios.post(`/api/referral/use/${useCode}`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Referral code successfully used!');
            fetchReferralStats(); // Refresh stats
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred using the referral code');
        }
    };

    if (loading) return <div>Loading referral information...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="referral">
            <h2>Referral Program</h2>
            <div>
                <h3>Your Referral Code</h3>
                {referralCode ? 
                    <p>{referralCode}</p> :
                    <button onClick={generateReferralCode}>Generate Referral Code</button>
                }
            </div>

            <div>
                <h3>Use Referral Code</h3>
                <input 
                    type="text" 
                    value={useCode} 
                    onChange={(e) => setUseCode(e.target.value)} 
                    placeholder="Enter referral code"
                />
                <button onClick={handleUseReferralCode}>Use Code</button>
            </div>

            <div>
                <h3>Referral Stats</h3>
                <p>Total Referrals: {referralStats.totalReferrals}</p>
                <p>Successful Referrals: {referralStats.successfulReferrals}</p>
                <ul>
                    {referralStats.referrals && referralStats.referrals.map(referral => (
                        <li key={referral._id}>
                            {referral.referee ? `Referred: ${referral.referee.username}` : 'Pending'}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Referral;