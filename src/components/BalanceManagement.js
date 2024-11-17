import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function BalanceManagement() {
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const { user } = useUser();

    // Fetch user balance when the user logs in or component mounts
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

    // Handle deposit functionality
    const handleDeposit = async () => {
        try {
            if (!amount || isNaN(parseFloat(amount))) {
                throw new Error('Please enter a valid amount');
            }
            const response = await axios.post('/api/users/deposit', { amount: parseFloat(amount) }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setBalance(response.data.balance);
            setAmount('');
            setError(''); // Clear any previous error
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Deposit failed');
        }
    };

    // Handle withdrawal functionality
    const handleWithdraw = async () => {
        try {
            if (!amount || isNaN(parseFloat(amount))) {
                throw new Error('Please enter a valid amount');
            }
            const response = await axios.post('/api/users/withdraw', { amount: parseFloat(amount) }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setBalance(response.data.balance);
            setAmount('');
            setError(''); // Clear any previous error
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Withdrawal failed');
        }
    };

    if (error) return <div>Error: {error}</div>;

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
            <button onClick={handleDeposit} disabled={!amount}>Deposit</button>
            <button onClick={handleWithdraw} disabled={!amount || balance < parseFloat(amount)}>Withdraw</button>
        </div>
    );
}

export default BalanceManagement;