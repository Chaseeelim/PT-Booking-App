import React, { useState, useEffect } from 'react';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
    const [bookedSessions, setBookedSessions] = useState([]);

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
            alert('Error fetching your booked sessions. Please try again.');
        }
    };

    useEffect(() => {
        fetchBookedSessions();
    }, []);

    return (
        <div className="user-dashboard">
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
    );
};

export default UserDashboard;
