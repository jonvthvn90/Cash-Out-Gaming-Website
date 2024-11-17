import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

const Store = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const { user, updateUser } = useUser();

    useEffect(() => {
        if (user) {
            fetchProducts();
        }
    }, [user]);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/store', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setProducts(response.data.products);
        } catch (error) {
            setError('Failed to fetch products');
            console.error('Products fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const purchaseProduct = async (productId) => {
        if (purchasing) return; // Prevent multiple clicks
        setPurchasing(true);
        setError(null);
        try {
            const response = await axios.post(`/api/store/purchase/${productId}`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            const { purchase, updatedBalance } = response.data;
            alert(`Purchase successful! You bought ${purchase.name} for $${purchase.priceAtPurchase.toFixed(2)}.`);

            // Update user's balance with the new balance received from the server
            updateUser({ ...user, balance: updatedBalance });
            
            fetchProducts(); // Refresh products list in case of stock changes
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred during purchase');
            console.error('Purchase error:', error);
        } finally {
            setPurchasing(false);
        }
    };

    if (!user) {
        return <div>Please log in to access the store.</div>;
    }

    if (loading) return <div>Loading store...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="store">
            <h2>Store</h2>
            <p>Your Balance: ${user.balance.toFixed(2)}</p>
            <div className="products-list">
                {products.map(product => (
                    <div key={product._id} className="product-item">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p>Price: ${product.price.toFixed(2)}</p>
                        <button 
                            onClick={() => purchaseProduct(product._id)} 
                            disabled={purchasing || product.price > user.balance}
                            className="product-buy-button"
                        >
                            {purchasing ? 'Processing...' : 'Buy'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

Store.propTypes = {
    user: PropTypes.shape({
        balance: PropTypes.number.isRequired
    }).isRequired,
    updateUser: PropTypes.func.isRequired
};

export default Store;