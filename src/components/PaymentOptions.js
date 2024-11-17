import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const PaymentOptions = () => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cashappLink, setCashappLink] = useState(null);

    // Function to initiate PayPal payment
    const handlePaypalPayment = async () => {
        if (!amount || amount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.post('/api/payments/paypal/pay', { amount });
            window.location.href = data.approvalURL; // Redirect to PayPal
        } catch (error) {
            setError('Failed to initiate PayPal payment: ' + (error.response?.data?.message || error.message));
            console.error('PayPal payment initiation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to initiate Coinbase payment
    const handleCoinbasePayment = async () => {
        if (!amount || amount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.post('/api/payments/coinbase/charge', { amount });
            window.location.href = data.chargeURL; // Redirect to Coinbase payment page
        } catch (error) {
            setError('Failed to initiate Coinbase payment: ' + (error.response?.data?.message || error.message));
            console.error('Coinbase payment initiation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to initiate CashApp payment
    const handleCashAppPayment = async () => {
        if (!amount || amount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.post('/api/payments/cashapp/charge', { amount });
            setCashappLink(data.cashappLink); // Assuming the backend returns a CashApp payment link
            setLoading(false);
        } catch (error) {
            setError('Failed to initiate CashApp payment: ' + (error.response?.data?.message || error.message));
            console.error('CashApp payment initiation failed:', error);
            setLoading(false);
        }
    };

    // Function to reset CashApp payment link (for subsequent payments)
    const resetCashAppLink = () => {
        setCashappLink(null);
    };

    return (
        <div className="payment-options">
            <h2>Add Funds</h2>
            <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="Amount to add ($)" 
                min="0.01" 
                step="0.01" 
                required 
                className="amount-input"
            />
            <button 
                onClick={handlePaypalPayment} 
                disabled={loading || !amount || amount <= 0}
                className="paypal-button"
            >
                {loading ? 'Loading...' : 'Pay with PayPal'}
            </button>
            <button 
                onClick={handleCoinbasePayment} 
                disabled={loading || !amount || amount <= 0}
                className="coinbase-button"
            >
                {loading ? 'Loading...' : 'Pay with Coinbase'}
            </button>
            <button 
                onClick={handleCashAppPayment} 
                disabled={loading || !amount || amount <= 0}
                className="cashapp-button"
            >
                {loading ? 'Loading...' : 'Pay with CashApp'}
            </button>

            {cashappLink && (
                <div className="cashapp-payment">
                    <p>Please use this CashApp link to complete the payment:</p>
                    <a href={cashappLink} target="_blank" rel="noopener noreferrer">{cashappLink}</a>
                    <button onClick={resetCashAppLink} className="reset-cashapp-link">New Payment</button>
                </div>
            )}

            {error && <p className="error">{error}</p>}
        </div>
    );
};

PaymentOptions.propTypes = {
    // You can add propTypes here if you expect any props to be passed to this component
};

export default PaymentOptions;