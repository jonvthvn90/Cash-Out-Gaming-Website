import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function BalanceManagement() {
    const[balance, setBalance] = useState(0);
    const[amount, setAmount] = useState('');
    const[error, setError] = useState('');
    const { user } = useUser();

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await axios.get('/api/users/balance', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setBalance(response.data.balance);
            } catch (error) {
                setError('Failed to fetch balance');
            }
        };

        if (user) {
            fetchBalance();
        }
    }, [user]);

    const handleDeposit = async () => {
        try {
            const response = await axios.post('/api/users/deposit', { amount: parseFloat(amount) }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setBalance(response.data.balance);
            setAmount('');
        } catch (error) {
            setError(error.response?.data?.message || 'Deposit failed');
        }
    };

    const handleWithdraw = async () => {
        try {
            const response = await axios.post('/api/users/withdraw', { amount: parseFloat(amount) }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setBalance(response.data.balance);
            setAmount('');
        } catch (error) {
            setError(error.response?.data?.message || 'Withdrawal failed');
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Balance Management</h2>
            <p>Current Balance: ${balance.toFixed(2)}</p>
            <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
            />
            <button onClick={handleDeposit}>Deposit</button>
            <button onClick={handleWithdraw}>Withdraw</button>
        </div>
    );
}

export default BalanceManagement;