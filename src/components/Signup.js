import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

function Signup() {
    const[username, setUsername] = useState('');
    const[email, setEmail] = useState('');
    const[password, setPassword] = useState('');
    const[confirmPassword, setConfirmPassword] = useState('');
    const[error, setError] = useState('');
    const history = useHistory();

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await axios.post('/api/signup', { username, email, password });
            if (response.status === 201) {
                // Assuming the response includes a token for authentication
                localStorage.setItem('token', response.data.token);
                setError('');
                history.push('/'); // Redirect to home page after signup
            } else {
                setError('Signup failed. Please check your details and try again.');
            }
        } catch (err) {
            setError('An error occurred during registration. Please try again.');
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <br />
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <br />
                <label>
                    Confirm Password:
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </label>
                <br />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}

export default Signup;