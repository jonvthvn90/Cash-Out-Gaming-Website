import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

const Referral = () => {
    const [referralCode, setReferralCode] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [referralStats, setReferralStats] = useState({});
    const { user } = useUser();
    const [useCode, setUseCode] = useState('');

    useEffect(() => {
        if (user) {
            fetchReferralStats();
        }
    }, [user]);

    const fetchReferralStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/referral/stats', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setReferralStats(response.data);
            setReferralCode(response.data.referralCode || ''); // If the server provides the referral code directly
        } catch (error) {
            setError('Failed to fetch referral stats');
            console.error('Referral stats fetch error:', error);
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
            fetchReferralStats(); // Refresh stats to reflect new code
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred generating the referral code');
            console.error('Referral code generation error:', error);
        }
    };

    const handleUseReferralCode = async () => {
        if (!useCode.trim()) {
            setError('Please enter a referral code');
            return;
        }
        try {
            setLoading(true);
            await axios.post(`/api/referral/use/${useCode.trim()}`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Referral code successfully used!');
            fetchReferralStats(); // Refresh stats
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred using the referral code');
            console.error('Referral code use error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div>Please log in to view or manage your referrals.</div>;
    }

    if (loading) return <div>Loading referral information...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="referral">
            <h2>Referral Program</h2>
            <div className="referral-code-section">
                <h3>Your Referral Code</h3>
                {referralCode ? 
                    <p>{referralCode}</p> :
                    <button onClick={generateReferralCode} disabled={loading}>Generate Referral Code</button>
                }
            </div>

            <div className="use-referral-code-section">
                <h3>Use Referral Code</h3>
                <input 
                    type="text" 
                    value={useCode} 
                    onChange={(e) => setUseCode(e.target.value)} 
                    placeholder="Enter referral code"
                    disabled={loading}
                    className="referral-code-input"
                />
                <button onClick={handleUseReferralCode} disabled={loading || !useCode.trim()}>Use Code</button>
            </div>

            <div className="referral-stats-section">
                <h3>Referral Stats</h3>
                <p>Total Referrals: {referralStats.totalReferrals || 0}</p>
                <p>Successful Referrals: {referralStats.successfulReferrals || 0}</p>
                <ul className="referral-list">
                    {(referralStats.referrals || []).map(referral => (
                        <li key={referral._id} className="referral-item">
                            {referral.referee ? `Referred: ${referral.referee.username}` : 'Pending'}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

Referral.propTypes = {
    user: PropTypes.shape({
        // Add relevant user properties here if needed
    })
};

export default Referral;