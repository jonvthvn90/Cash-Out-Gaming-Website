import React, { useState } from 'react';
import axios from 'axios';

const PaymentOptions = () => {
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to initiate PayPal payment
    const handlePaypalPayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.post('/api/payments/paypal/pay', { amount });
            window.location.href = data.approvalURL; // Redirect to PayPal
        } catch (error) {
            setError('Failed to initiate PayPal payment: ' + error.message);
            console.error('PayPal payment initiation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to initiate Coinbase payment
    const handleCoinbasePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.post('/api/payments/coinbase/charge', { amount });
            window.location.href = data.chargeURL; // Redirect to Coinbase payment page
        } catch (error) {
            setError('Failed to initiate Coinbase payment: ' + error.message);
            console.error('Coinbase payment initiation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-options">
            <h2>Add Funds</h2>
            <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(parseFloat(e.target.value))} 
                placeholder="Amount to add ($)" 
                min="0.01" 
                step="0.01" 
                required 
            />
            <button 
                onClick={handlePaypalPayment} 
                disabled={loading || amount <= 0}
            >
                {loading ? 'Loading...' : 'Pay with PayPal'}
            </button>
            <button 
                onClick={handleCoinbasePayment} 
                disabled={loading || amount <= 0}
            >
                {loading ? 'Loading...' : 'Pay with Coinbase'}
            </button>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default PaymentOptions;