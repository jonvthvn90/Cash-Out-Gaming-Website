import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const Store = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, updateUser } = useUser();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/store', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setProducts(response.data.products);
        } catch (error) {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const purchaseProduct = async (productId) => {
        try {
            const response = await axios.post(`/api/store/purchase/${productId}`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Purchase successful!');
            updateUser({ ...user, balance: user.balance - response.data.purchase.priceAtPurchase }); // Update balance in context
            fetchProducts(); // Refresh products list in case of stock changes
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred during purchase');
        }
    };

    if (loading) return <div>Loading store...</div>;
    if (error) return <div>{error}</div>;

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
                        <button onClick={() => purchaseProduct(product._id)}>Buy</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Store;