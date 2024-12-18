import React, { useState } from 'react';
import '../styles/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('https://personal-training-app-444808.appspot.com//api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('JWT Token:', data.token);

                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role); // Save role in local storage
                if (data.role === 'admin') {
                    window.location.href = '/admin-dashboard'; // Redirect admin to admin page
                } else {
                    window.location.href = '/'; // Redirect to home
                }
            } else {
                setError(data.message || 'Invalid email or password');
            }
        } catch (err) {
            setError('Something went wrong. Please try again later.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLanding = () => {
        window.location.href = '/';
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-box">
                    <h1>Login</h1>

                    {error && <div className="error-message">{error}</div>}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p>
                        Don't have an account? <a href="/register">Register</a>
                    </p>

                    <button className="back-to-home" onClick={handleBackToLanding}>
                        Back to Home
                    </button>
                </div>
            </div>
        </div>

    );
};

export default Login;
