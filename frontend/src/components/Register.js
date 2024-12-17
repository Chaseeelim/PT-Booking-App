import React, { useState } from 'react';
import '../styles/Register.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setError('');
        const user = { name, email, password };

        try {
            const response = await fetch('https://personal-training-app-444808.appspot.com/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Registration failed.');
                return;
            }

            const data = await response.json();
            alert(`Registration successful for ${data.user.name}`);
        } catch (error) {
            console.error('Error during registration:', error.message);
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="register-container">
        <div className="register-box">
            <h1>Register</h1>
    
            {/* Error message */}
            {error && <div className="error-message">{error}</div>}
    
            {/* Form */}
            <form className="register-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" placeholder="Enter your name" required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" placeholder="Enter your email" required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" placeholder="Enter your password" required />
                </div>
                <button type="submit" className="register-button">Register</button>
            </form>
    
            {/* Link to login */}
            <p>
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
    </div>
    
    );
};

export default Register;
