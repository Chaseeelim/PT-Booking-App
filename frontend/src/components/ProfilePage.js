import React, { useEffect, useState } from 'react';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');

            try {
                const response = await fetch('http://localhost:5000/api/users/profile', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data); // Set the full user object
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to fetch user details.');
                }
            } catch (err) {
                setError('An error occurred while fetching user details.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (loading) {
        return <div className="profile-page">Loading...</div>;
    }

    if (error) {
        return <div className="profile-page error">{error}</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-header">    
                    <h1 className="user-name">{user?.name}</h1>
                    <p className="user-role"><strong>Role:</strong> {user?.role || 'Not Assigned'}</p>
                </div>

                {/* Log Out Action */}
                <div className="profile-actions">
                    <button className="logout-button">Log Out</button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
