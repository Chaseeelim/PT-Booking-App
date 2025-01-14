import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import Modal from 'react-modal';
import 'react-calendar/dist/Calendar.css';
import '../styles/AdminDashboard.css';

// to ensure modal is linked to the root element for accessibility
Modal.setAppElement('#root');

const AdminDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [highlightDates, setHighlightDates] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [editingBooking, setEditingBooking] = useState(null);
    const [editedData, setEditedData] = useState({});

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
            const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                .toISOString()
                .split('T')[0];

            const response = await fetch(`https://personal-training-app-444808.appspot.com/api/availability?date=${adjustedDate}`);
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
                console.log('API Response with IDs:', data); // Confirm _id is included
                setBookings(data.bookings);
            } else {
                console.error('Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
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

            // Adjust selected date for local timezone
            const adjustedDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
                .toISOString()
                .split('T')[0];

            const payload = {
                date: adjustedDate,
                slots: selectedSlots.map((time) => ({ time })),
            };

            console.log('Saving availability with payload:', payload);

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
                console.error('Save availability error:', errorData);
                alert(`Failed to save availability: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error saving availability:', error);
            alert('An error occurred while saving availability. Please try again.');
        }
    };


    const handleEditClick = (booking) => {
        if (!booking || !booking._id) {
            console.error('Invalid booking object:', booking);
            alert('Unable to edit this booking. Missing identifier.');
            return;
        }
        setEditingBooking(booking);
        setEditedData({ date: booking.date, time: booking.time });
    };

    const handleEditSubmit = async () => {
        if (!editedData.date || !editedData.time) {
            alert('Both date and time are required.');
            return;
        }

        try {
            const response = await fetch(
                `https://personal-training-app-444808.appspot.com/api/availability/bookings/${editingBooking._id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(editedData),
                }
            );

            if (response.ok) {
                alert('Booking updated successfully!');
                setEditingBooking(null);
                fetchAllBookings();
            } else {
                const errorData = await response.json();
                alert(`Failed to update booking: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('An error occurred while updating booking. Please try again.');
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        try {
            const response = await fetch(
                `https://personal-training-app-444808.appspot.com/api/availability/bookings/${bookingId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.ok) {
                alert('Booking deleted successfully!');
                fetchAllBookings();
            } else {
                const errorData = await response.json();
                console.error('Delete error:', errorData);
                alert(`Failed to delete booking: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('An error occurred while deleting booking. Please try again.');
        }
    };

    const handleDeleteSlot = async (slotId) => {
        try {
            const response = await fetch(
                `https://personal-training-app-444808.appspot.com/api/availability/slots/${slotId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.ok) {
                alert('Slot deleted successfully!');
                fetchExistingAvailability(selectedDate);
                fetchHighlightDates();
                fetchAllBookings();
            } else {
                const errorData = await response.json();
                console.error('Delete error:', errorData);
                alert(`Failed to delete slot: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error deleting slot:', error);
            alert('An error occurred while deleting the slot. Please try again.');
        }
    };




    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin! Manage your availability and bookings here.</p>

            <div className="calendar-container">
                <Calendar
                    onChange={(date) => setSelectedDate(date)}
                    value={selectedDate}
                    tileClassName={({ date }) => {
                        const dateStr = date.toISOString().split('T')[0];
                        return highlightDates.includes(dateStr) ? 'highlight' : '';
                    }}
                />
            </div>

            {/* Time Slots Section */}
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
                <button className="save-button" onClick={saveAvailability} disabled={!selectedSlots.length}>
                    Save Availability
                </button>
            </div>

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
                            {bookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td>{booking.user}</td>
                                    <td>{new Date(booking.date).toLocaleDateString()}</td>
                                    <td>{booking.time}</td>
                                    <td>
                                        {booking.user === 'Unbooked' ? (
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteSlot(booking._id)}
                                            >
                                                Delete Slot
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleEditClick(booking)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDeleteBooking(booking._id)}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>


                    </table>
                )}
            </div>


            {/* Modal for Editing Booking */}
            <Modal
                isOpen={!!editingBooking}
                onRequestClose={() => setEditingBooking(null)}
                contentLabel="Edit Booking Modal"
                className="edit-modal"
                overlayClassName="edit-modal-overlay"
            >
                <h3>Edit Booking</h3>
                <label>
                    Date:
                    <input
                        type="date"
                        value={editedData.date}
                        onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
                    />
                </label>
                <label>
                    Time:
                    <input
                        type="text"
                        value={editedData.time}
                        onChange={(e) => setEditedData({ ...editedData, time: e.target.value })}
                    />
                </label>
                <button onClick={handleEditSubmit}>Save</button>
                <button onClick={() => setEditingBooking(null)}>Cancel</button>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
