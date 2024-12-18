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
    const [availableDates, setAvailableDates] = useState([]); // Track dates with available slots



    // Fetch dates with available slots
    const fetchAvailableDates = async () => {
        try {
            console.log('Fetching available dates...'); // Debug log
            const response = await fetch('https://personal-training-app-444808.appspot.com/api/availability/highlights');
            console.log('Fetch response received:', response); // Debug log

            if (!response.ok) throw new Error(`Failed to fetch dates with availability. Status: ${response.status}`);

            const data = await response.json();
            console.log('Available Dates Response:', data); // Debug log

            // Use the dates directly as provided by the API
            const formattedDates = (data.dates || []).map((date) => {
                console.log('Date without conversion:', date); // Debug log for each date
                return date; // Use the date as-is
            });

            setAvailableDates(formattedDates); // Set the dates as provided by the API
        } catch (error) {
            console.error('Error fetching available dates:', error.message); // Debug log
        }
    };





    // Fetch available slots for the selected date
    const fetchAvailableSlots = async (date) => {
        const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        const formattedDate = adjustedDate.toISOString().split('T')[0]; // Format back to YYYY-MM-DD

        console.log('Fetching slots for UTC date:', formattedDate);

        try {
            setLoading(true);
            const response = await fetch(`https://personal-training-app-444808.appspot.com/api/availability?date=${formattedDate}`);
            if (!response.ok) throw new Error('Failed to fetch available slots.');

            const data = await response.json();
            console.log('Available Dates:', data.dates); // Debug log
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
            setError('No available slots');
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        console.log('useEffect for fetchAvailableDates is running'); // Debug log
        fetchAvailableDates(); // Fetch dates with available slots on mount
    }, []);

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
            const response = await fetch('https://personal-training-app-444808.appspot.com/api/availability/book', {
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

    // Handle date change
    const handleDateChange = (formattedDate) => {
        setSelectedDate(formattedDate);
        setSelectedTime('');
        fetchAvailableSlots(formattedDate);
    };

    useEffect(() => {
        const adjustedDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
        fetchAvailableSlots(adjustedDate);
    }, [selectedDate]);



    return (
        <div className="calendar-booking">
            <h1>{isAdmin ? 'Set Your Availability' : 'Book Your Training Session'}</h1>

            <div className="calendar-container">
                <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    tileClassName={({ date, view }) => {
                        const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                        const formattedDate = adjustedDate.toISOString().split('T')[0];
                        return availableDates.includes(formattedDate) ? 'highlight-date' : null;
                    }}
                />

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
console.log('CalendarBooking component mounted');


export default CalendarBooking;
