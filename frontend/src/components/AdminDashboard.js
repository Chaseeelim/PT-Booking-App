import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [highlightDates, setHighlightDates] = useState([]); // Highlight available dates

    useEffect(() => {
        generateTimeSlots();
        fetchHighlightDates();
        fetchExistingAvailability(selectedDate);
    }, [selectedDate]);

    // Generate time slots (9 AM to 4 PM in 30-minute intervals)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour < 17; hour++) {
            slots.push(`${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`);
            slots.push(`${hour % 12 || 12}:30 ${hour < 12 ? 'AM' : 'PM'}`);
        }
        setAvailableSlots(slots);
    };

    // Fetch highlighted dates
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

    // Fetch availability for the selected date
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
    
            const validSlots = selectedSlots.filter((time) => time && typeof time === 'string'); // Filter valid slots
            if (!validSlots.length) {
                alert('No valid time slots to save.');
                return;
            }

            const newDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);

            const payload = {
                date: newDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
                slots: validSlots.map((time) => ({ time })), // Map valid slots
            };

    // Debugging 
            console.log('new date', newDate);
            console.log('new date to ISO String', newDate.toISOString());
            console.log('Payload to save:', payload); 
            console.log('selectedDate to save:', selectedDate); 
            console.log('selectedDate toISOString to save:', selectedDate.toISOString());

    
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
    
    
    

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin! Manage your availability here.</p>

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
        </div>
    );
};

export default AdminDashboard;
