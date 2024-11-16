import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function Header() {
    const { isAuthenticated, user, logout } = useUser();

    const handleLogout = () => {
        logout();
        // Optionally redirect or perform other actions after logout
    };

    return (
        <header>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    {isAuthenticated ? (
                        <>
                            <li><Link to="/match-history">Match History</Link></li>
                            <li><Link to="/ongoing-challenges">Challenges</Link></li>
                            <li><Link to="/new-challenge">New Challenge</Link></li>
                            <li><Link to="/profile">{user.username}'s Profile</Link></li>
                            <li><button onClick={handleLogout}>Logout</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/signup">Signup</Link></li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;