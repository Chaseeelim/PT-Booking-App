import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/CalendarBooking.css';

const CalendarBooking = ({ isAdmin }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch available slots for the selected date
    const fetchAvailableSlots = async (date) => {
        const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        const formattedDate = adjustedDate.toISOString().split('T')[0]; // Format back to YYYY-MM-DD

        console.log('Fetching slots for UTC date:', formattedDate);

        try {
            const response = await fetch(`http://localhost:5000/api/availability?date=${formattedDate}`);
            if (!response.ok) throw new Error('Failed to fetch available slots.');

            const data = await response.json();
            console.log('Available Slots (Response):', data);

            const slots = Array.isArray(data.slots)
                ? data.slots.map((slot) => ({
                    ...slot,
                    status: slot.bookedBy ? 'Booked' : 'Available',
                }))
                : [];

            setAvailableSlots(slots);
            setError('');
        } catch (error) {
            console.error('Error fetching slots:', error);
            setAvailableSlots([]);
            setError('Unable to load available slots. Please try again later.');
        } finally {
            setLoading(false);
        }
    };



    // Handle date change
    const handleDateChange = (formattedDate) => {
        setSelectedDate(formattedDate);
        setSelectedTime('');
        fetchAvailableSlots(formattedDate);
    };

    // Handle booking a slot
    const handleBooking = async () => {
        if (!selectedTime) {
            alert('Please select a time slot.');
            return;
        }
    
        // Convert the selected date to UTC
        const utcDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
        const formattedDate = utcDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
        const payload = {
            date: formattedDate, // Send date in YYYY-MM-DD format
            slot: selectedTime, // Send the time field directly (e.g., "10:00 AM")
        };
    
        console.log('Payload being sent:', payload); // Debugging log
    
        try {
            const response = await fetch('http://localhost:5000/api/availability/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
    
            alert(`Booking confirmed for ${formattedDate} at ${selectedTime}`);
            fetchAvailableSlots(selectedDate); // Refresh available slots
        } catch (error) {
            console.error('Error booking slot:', error.message);
            alert(`Error: ${error.message}`);
        }
    };
    


    useEffect(() => {
        const adjustedDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
        fetchAvailableSlots(adjustedDate);
    }, [selectedDate]);

    return (
        <div className="calendar-booking">
            <h1>{isAdmin ? 'Set Your Availability' : 'Book Your Training Session'}</h1>

            <div className="calendar-container">
                <Calendar onChange={handleDateChange} value={selectedDate} />
            </div>

            <h2>{isAdmin ? 'Available Time Slots' : 'Select Time'}</h2>
            {error && <p className="error-message">{error}</p>}
            {loading ? (
                <p>Loading slots...</p>
            ) : (
                <div className="time-input-container">
                    <label htmlFor="time-select">Select a time slot:</label>
                    <select
                        id="time-select"
                        aria-label="Time Slot Selection"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                    >
                        <option value="" disabled={!availableSlots.length}>
                            {availableSlots.length ? '--Select a time--' : 'No slots available'}
                        </option>
                        {availableSlots.map((slot, index) => {
                            // Convert UTC time to local time for display
                            const localTime = new Date(`1970-01-01T${slot.time}Z`).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true, // Change to false for 24-hour format
                            });

                            return (
                                <option
                                    key={index}
                                    value={slot.time} // Keep original UTC time value for backend
                                    disabled={slot.status === 'Booked'}
                                >
                                    {`${slot.time} (${slot.status})`} {/* Display in local time */}
                                </option>
                            );
                        })}

                    </select>
                </div>
            )}

            <button className="book-button" onClick={handleBooking} disabled={!selectedTime}>
                Confirm Booking
            </button>
        </div>
    );

};

export default CalendarBooking;
