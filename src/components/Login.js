import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function Login() {
    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');
    const[error, setError] = useState('');
    const history = useHistory();
    const { login } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            const response = await axios.post('/api/login', { username, password });
            if (response.status === 200) {
                login(response.data.token, response.data.user);
                history.push('/');
            } else {
                setError('Invalid username or password.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;