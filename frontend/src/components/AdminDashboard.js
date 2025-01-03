import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [highlightDates, setHighlightDates] = useState([]);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        generateTimeSlots();
        fetchHighlightDates();
        fetchExistingAvailability(selectedDate);
        fetchAllBookings();
    }, [selectedDate]);

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour < 17; hour++) {
            slots.push(`${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`);
            slots.push(`${hour % 12 || 12}:30 ${hour < 12 ? 'AM' : 'PM'}`);
        }
        setAvailableSlots(slots);
    };

    const fetchHighlightDates = async () => {
        try {
            const response = await fetch('https://personal-training-app-444808.appspot.com/api/availability/highlights');
            if (response.ok) {
                const data = await response.json();
                setHighlightDates(data.dates);
            }
        } catch (error) {
            console.error('Error fetching highlight dates:', error);
        }
    };

    const fetchExistingAvailability = async (date) => {
        try {
            const formattedDate = date.toISOString().split('T')[0];
            const response = await fetch(`https://personal-training-app-444808.appspot.com/api/availability?date=${formattedDate}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedSlots(data.slots.map((slot) => slot.time));
            } else {
                setSelectedSlots([]);
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
            setSelectedSlots([]);
        }
    };

    const fetchAllBookings = async () => {
        try {
            const response = await fetch('https://personal-training-app-444808.appspot.com/api/availability/bookings', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                console.log('API Response:', data);
                setBookings(data.bookings);
            } else {
                console.error('Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setSelectedSlots([]);
    };

    const toggleTimeSlot = (slot) => {
        setSelectedSlots((prevSlots) =>
            prevSlots.includes(slot) ? prevSlots.filter((s) => s !== slot) : [...prevSlots, slot]
        );
    };

    const saveAvailability = async () => {
        try {
            if (!selectedSlots.length) {
                alert('No slots selected to save.');
                return;
            }

            const validSlots = selectedSlots.filter((time) => time && typeof time === 'string');
            if (!validSlots.length) {
                alert('No valid time slots to save.');
                return;
            }

            const newDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);

            const payload = {
                date: newDate.toISOString().split('T')[0],
                slots: validSlots.map((time) => ({ time })),
            };

            const response = await fetch('https://personal-training-app-444808.appspot.com/api/availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Availability saved successfully!');
                fetchExistingAvailability(selectedDate);
                fetchHighlightDates();
            } else {
                const errorData = await response.json();
                alert(`Failed to save availability: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error saving availability:', error);
            alert('An error occurred while saving availability. Please try again.');
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        try {
            const response = await fetch(`https://personal-training-app-444808.appspot.com/api/availability/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                alert('Booking deleted successfully!');
                fetchAllBookings();
            } else {
                const errorData = await response.json();
                alert(`Failed to delete booking: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('An error occurred while deleting booking. Please try again.');
        }
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin! Manage your availability and bookings here.</p>

            <div className="calendar-container">
                <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    tileClassName={({ date }) => {
                        const dateStr = date.toISOString().split('T')[0];
                        return highlightDates.includes(dateStr) ? 'highlight' : '';
                    }}
                />
            </div>

            <div className="time-slots-container">
                <h2>Select Available Time Slots</h2>
                <div className="time-slots">
                    {availableSlots.map((slot, index) => (
                        <button
                            key={index}
                            className={`time-slot ${selectedSlots.includes(slot) ? 'selected' : ''}`}
                            onClick={() => toggleTimeSlot(slot)}
                        >
                            {slot}
                        </button>
                    ))}
                </div>
            </div>

            <button className="save-button" onClick={saveAvailability} disabled={selectedSlots.length === 0}>
                Save Availability
            </button>

            <div className="bookings-container">
                <h2>Manage Bookings</h2>
                {bookings.length === 0 ? (
                    <p>No bookings available.</p>
                ) : (
                    <table className="bookings-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Date</th>
                                <th>Time Slot</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking, index) => (
                                <tr key={index}>
                                    <td>{booking.user}</td>
                                    <td>{new Date(booking.date).toLocaleDateString()}</td>
                                    <td>{booking.time}</td>
                                    <td>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteBooking(booking._id)}
                                        >
                                            Delete
                                        </button>
                                        <button className="edit-button">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
