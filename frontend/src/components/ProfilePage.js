import React, { useEffect, useState } from 'react';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [bookedSessions, setBookedSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');

            try {
                const response = await fetch('https://personal-training-app-444808.appspot.com/api/users/profile', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data); // Set the full user object
                    console.log("user profile", data);
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

    // Fetch booked sessions
    useEffect(() => {
        const fetchBookedSessions = async () => {
            try {
                const response = await fetch('https://personal-training-app-444808.appspot.com/api/availability/bookings', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch booked sessions.');

                const data = await response.json();
                setBookedSessions(data.bookings);
            } catch (error) {
                console.error('Error fetching booked sessions:', error);
                setError('Error fetching your booked sessions.');
            }
        };

        fetchBookedSessions();
    }, []);

    // Log out functionality
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login'; // Redirect to login page
    };

    if (loading) {
        return <div className="profile-page">Loading...</div>;
    }

    if (error) {
        return <div className="profile-page error">{error}</div>;
    }

    console.log("Debug user email", user.email);

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-header">
                    <h1 className="user-name">{user?.name}</h1>
                    <p className="user-email"><strong>Email:</strong> {user?.email || 'Not Provided'}</p>
                    <p className="user-role"><strong>Role:</strong> {user?.role || 'Not Assigned'}</p>
                </div>

                {/* Log Out Action */}
                <div className="profile-actions">
                    <button className="logout-button" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            </div>

            <div className="booked-sessions">
                <h1 className="dashboard-title">Your Booked Sessions</h1>
                {bookedSessions.length === 0 ? (
                    <p className="no-sessions">No sessions booked yet.</p>
                ) : (
                    <div className="session-table"> 
                        <div className="session-header">
                            <div className="header-item">Date</div>
                            <div className="header-item">Time</div>
                        </div>
                        {bookedSessions.map((session, index) => (
                            <div key={index} className="session-row">
                                <div className="row-item">
                                    {new Intl.DateTimeFormat('en-GB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                    }).format(new Date(session.date))}
                                </div>
                                <div className="row-item">{session.time}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
