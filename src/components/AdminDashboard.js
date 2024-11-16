import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const [matchData, setMatchData] = useState({
        teamA: '',
        teamB: '',
        game: '',
        scheduledAt: ''
    });
    const [tournamentData, setTournamentData] = useState({
        name: '',
        game: '',
        entryFee: 0,
        prizePool: 0,
        startDate: '',
        endDate: ''
    });
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        price: 0,
        type: 'skin',
        stock: -1
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(response.data);
        } catch (error) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const createMatch = async (matchData) => {
        try {
            await axios.post('/api/admin/matches', matchData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Match created successfully!');
            // Reset form data
            setMatchData({
                teamA: '',
                teamB: '',
                game: '',
                scheduledAt: ''
            });
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred creating the match');
        }
    };

    const createTournament = async (tournamentData) => {
        try {
            await axios.post('/api/admin/tournaments', tournamentData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Tournament created successfully!');
            // Reset form data
            setTournamentData({
                name: '',
                game: '',
                entryFee: 0,
                prizePool: 0,
                startDate: '',
                endDate: ''
            });
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred creating the tournament');
        }
    };

    const addProduct = async (productData) => {
        try {
            await axios.post('/api/admin/products', productData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Product added successfully!');
            // Reset form data
            setProductData({
                name: '',
                description: '',
                price: 0,
                type: 'skin',
                stock: -1
            });
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred adding the product');
        }
    };

    if (loading) return <div>Loading admin dashboard...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            <section>
                <h3>User Management</h3>
                <ul>
                    {users.map(user => (
                        <li key={user._id}>{user.username} - {user.email}</li>
                    ))}
                </ul>
            </section>

            <section>
                <h3>Match Management</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    createMatch(matchData);
                }}>
                    <input 
                        value={matchData.teamA} 
                        onChange={(e) => setMatchData({ ...matchData, teamA: e.target.value })} 
                        placeholder="Team A" 
                        required 
                    />
                    <input 
                        value={matchData.teamB} 
                        onChange={(e) => setMatchData({ ...matchData, teamB: e.target.value })} 
                        placeholder="Team B" 
                        required 
                    />
                    <input 
                        value={matchData.game} 
                        onChange={(e) => setMatchData({ ...matchData, game: e.target.value })} 
                        placeholder="Game" 
                        required 
                    />
                    <input 
                        value={matchData.scheduledAt} 
                        onChange={(e) => setMatchData({ ...matchData, scheduledAt: e.target.value })} 
                        type="datetime-local" 
                        required 
                    />
                    <button type="submit">Create Match</button>
                </form>
            </section>

            <section>
                <h3>Tournament Management</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    createTournament(tournamentData);
                }}>
                    <input 
                        value={tournamentData.name} 
                        onChange={(e) => setTournamentData({ ...tournamentData, name: e.target.value })} 
                        placeholder="Tournament Name" 
                        required 
                    />
                    <input 
                        value={tournamentData.game} 
                        onChange={(e) => setTournamentData({ ...tournamentData, game: e.target.value })} 
                        placeholder="Game" 
                        required 
                    />
                    <input 
                        type="number" 
                        value={tournamentData.entryFee} 
                        onChange={(e) => setTournamentData({ ...tournamentData, entryFee: e.target.value })}
                        placeholder="Entry Fee" 
                    />
                    <input 
                        type="number" 
                        value={tournamentData.prizePool} 
                        onChange={(e) => setTournamentData({ ...tournamentData, prizePool: e.target.value })}
                        placeholder="Prize Pool" 
                    />
                    <input 
                        value={tournamentData.startDate} 
                        onChange={(e) => setTournamentData({ ...tournamentData, startDate: e.target.value })} 
                        type="datetime-local" 
                        required 
                    />
                    <input 
                        value={tournamentData.endDate} 
                        onChange={(e) => setTournamentData({ ...tournamentData, endDate: e.target.value })} 
                        type="datetime-local" 
                        required 
                    />
                    <button type="submit">Create Tournament</button>
                </form>
            </section>

            <section>
                <h3>Store Management</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    addProduct(productData);
                }}>
                    <input 
                        value={productData.name} 
                        onChange={(e) => setProductData({ ...productData, name: e.target.value })} 
                        placeholder="Product Name" 
                        required 
                    />
                    <textarea 
                        value={productData.description} 
                        onChange={(e) => setProductData({ ...productData, description: e.target.value })} 
                        placeholder="Description" 
                    />
                    <input 
                        type="number" 
                        value={productData.price} 
                        onChange={(e) => setProductData({ ...productData, price: e.target.value })} 
                        placeholder="Price" 
                        required 
                    />
                    <select 
                        value={productData.type} 
                        onChange={(e) => setProductData({ ...productData, type: e.target.value })}>
                        <option value="skin">Skin</option>
                        <option value="badge">Badge</option>
                        <option value="advantage">Advantage</option>
                        <option value="other">Other</option>
                    </select>
                    <input 
                        type="number" 
                        value={productData.stock} 
                        onChange={(e) => setProductData({ ...productData, stock: e.target.value })} 
                        placeholder="Stock (-1 for unlimited)" 
                    />
                    <button type="submit">Add Product</button>
                </form>
            </section>
        </div>
    );
};

export default AdminDashboard;