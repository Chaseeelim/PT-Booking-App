import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [role, setRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleBookSessionClick = (e) => {
        const token = localStorage.getItem('token'); // Check if the user is logged in
        if (!token) {
            e.preventDefault(); // Prevent navigation to the "Book" page
            alert('You need to log in to book a session.');
            navigate('/login'); // Redirect to login page
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="logo">Boxing</Link>
                <button className="menu-toggle" onClick={toggleMenu}>
                    ☰
                </button>
            </div>
            <ul className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
                {/* Links available to everyone */}
                <li>
                    <Link to="/book" onClick={handleBookSessionClick}>
                        Book a Session
                    </Link>
                </li>
                <li><Link to="/coaches">Coach Info</Link></li>

            
                {/* Links for admin */}
                {role === 'admin' && (
                    <>
                        <li><Link to="/admin-dashboard" className="dashboard-button">Admin Dashboard</Link></li>
                        <li>
                            <Link to="/profile" className="profile-button">Profile</Link>
                        </li>
                        <li><Link to="/contact">Contact</Link></li>

                        <li>
                            <button onClick={handleLogout} className="logout-button">Logout</button>
                        </li>
                    </>
                )}

                {/* Links for logged-in users */}
                {role === 'user' && (
                    <>
                        <li><Link to="/dashboard" className="dashboard-button">Dashboard</Link></li>
                        <li>
                            <Link to="/profile" className="profile-button">Profile</Link>
                        </li>
                        <li><Link to="/contact">Contact</Link></li>
                        <li>
                            <button onClick={handleLogout} className="logout-button">Logout</button>
                        </li>
                    </>
                )}

                {/* Links for public users */}
                {!role && (
                    <li><Link to="/login" className="login-button">Login</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
