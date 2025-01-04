const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const Availability = require('../models/Availability');

// Save or update availability route
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { date, slots } = req.body;

        if (!date || !slots || !Array.isArray(slots)) {
            return res.status(400).json({ message: 'Invalid input: Date and slots are required' });
        }

        // Debugging log for slots
        console.log('Received Slots:', slots);

        // Validate slots
        const validSlots = slots.filter((slot) => slot && typeof slot.time === 'string');
        if (!validSlots.length) {
            throw new Error('Invalid slots: Ensure all slots have a valid time format.');
        }

        // Ensure all slots have valid time strings
        const parsedSlots = validSlots.map((slot) => {
            if (!slot.time) {
                throw new Error('Each slot must have a time field.');
            }
            return { time: slot.time }; // Keep time as a string
        });

        let availability = await Availability.findOne({ date });

        if (availability) {
            // Merge slots with existing availability
            const newSlots = parsedSlots.filter(
                (newSlot) => !availability.slots.some((existing) => existing.time === newSlot.time)
            );
            availability.slots.push(...newSlots);
        } else {
            // Create new availability
            availability = new Availability({
                admin: req.user.id,
                date,
                slots: parsedSlots,
            });
        }

        await availability.save();
        res.status(201).json({ message: 'Availability saved successfully', availability });
    } catch (error) {
        console.error('Error saving availability:', error.message);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Availability route: Fetch slots for a specific date
router.get('/', async (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ message: 'Date query parameter is required' });
    }

    try {
        const availability = await Availability.findOne({ date });
        if (!availability) {
            return res.status(404).json({ message: 'No availability found for this date' });
        }
        res.status(200).json({ date: availability.date, slots: availability.slots });
    } catch (error) {
        console.error('Error fetching availability:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Book a slot
router.post('/book', authenticateToken, async (req, res) => {
    try {
        const { date, slot } = req.body;

        if (!date || !slot) {
            return res.status(400).json({ message: 'Date and slot are required' });
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        // Fetch availability for the given date
        const availability = await Availability.findOne({ date });

        if (!availability) {
            return res.status(404).json({ message: 'No availability found for this date' });
        }

        // Find and book the slot atomically to prevent race conditions
        const slotToBook = await Availability.findOneAndUpdate(
            { date, 'slots.time': slot, 'slots.bookedBy': null },
            { $set: { 'slots.$.bookedBy': req.user.id } },
            { new: true }
        );

        if (!slotToBook) {
            return res.status(400).json({ message: 'Slot not available or already booked' });
        }

        res.status(200).json({ message: 'Slot booked successfully', availability: slotToBook.slots });
    } catch (error) {
        console.error('Error booking slot:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Fetch user's booked slots
router.get('/bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await Availability.find({})
            .populate('slots.bookedBy', 'name role') // Populate user details (name and role)
            .exec();

        const allBookings = bookings.flatMap((availability) =>
            availability.slots.map((slot) => ({
                _id: slot._id, // Include the unique ID for the slot
                user: slot.bookedBy?.name || 'Unknown User', // Safely access user's name
                date: availability.date,
                time: slot.time,
            }))
        );

        res.status(200).json({ bookings: allBookings });
    } catch (error) {
        console.error('Error fetching bookings:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});


router.delete('/slots/:id', authenticateToken, async (req, res) => {
    try {
        const slotId = req.params.id;

        // Find the slot by ID and ensure it is unbooked
        const availability = await Availability.findOneAndUpdate(
            { 'slots._id': slotId, 'slots.bookedBy': null },
            { $pull: { slots: { _id: slotId } } },
            { new: true }
        );

        if (!availability) {
            return res.status(404).json({ message: 'Slot not found or already booked' });
        }

        res.status(200).json({ message: 'Slot deleted successfully!' });
    } catch (error) {
        console.error('Error deleting slot:', error.message);
        res.status(500).json({ message: 'Failed to delete slot.' });
    }
});

router.get('/all', authenticateToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Admin access required.' });
        }

        // Fetch all availability sorted by date, populating booked user details
        const availability = await Availability.find({})
            .sort({ date: 1 })
            .populate('slots.bookedBy', 'name email'); // Populate user details for booked slots

        // Check if no availability exists
        if (!availability.length) {
            return res.status(200).json({ message: 'No availability found.', availability: [] });
        }

        // Respond with availability data
        res.status(200).json({ availability });
    } catch (error) {
        console.error('Error fetching all availability:', error.message, { userId: req.user.id });
        res.status(500).json({ message: 'Server error.' });
    }
});


// Fetch all dates with available slots
router.get('/highlights', async (req, res) => {
    try {
        console.log('Fetching all availabilities with unbooked slots...');
        const availabilities = await Availability.find({ 'slots.bookedBy': null });
        console.log('Raw availabilities:', availabilities);

        const datesWithAvailableSlots = availabilities
            .filter((availability) =>
                availability.slots.some((slot) => slot.bookedBy === null)
            )
            .map((availability) =>
                new Date(availability.date).toISOString().split('T')[0]
            );

        const uniqueDates = [...new Set(datesWithAvailableSlots)];
        console.log('Unique dates with available slots:', uniqueDates);

        res.status(200).json({ dates: uniqueDates });
    } catch (error) {
        console.error('Error fetching highlighted dates:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

//delete a slot
router.delete('/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const bookingId = req.params.id;

        // Find the slot and clear the `bookedBy` field
        const availability = await Availability.findOneAndUpdate(
            { 'slots._id': bookingId },
            { $set: { 'slots.$.bookedBy': null } }, // Unbook the slot
            { new: true }
        );

        if (!availability) {
            return res.status(404).json({ message: 'Booking not found or already deleted.' });
        }

        res.status(200).json({ message: 'Booking deleted successfully!', availability });
    } catch (error) {
        console.error('Error deleting booking:', error.message);
        res.status(500).json({ message: 'Failed to delete booking.' });
    }
});

//updating a slot
router.put('/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const { date, time } = req.body;
        const bookingId = req.params.id;

        // Update the slot with the new date and time
        const availability = await Availability.findOneAndUpdate(
            { 'slots._id': bookingId },
            {
                $set: {
                    'slots.$.time': time, // Update time
                    date, // Update date if needed (might require additional logic)
                },
            },
            { new: true }
        );

        if (!availability) {
            return res.status(404).json({ message: 'Booking not found or update failed.' });
        }

        res.status(200).json({ message: 'Booking updated successfully!', availability });
    } catch (error) {
        console.error('Error updating booking:', error.message);
        res.status(500).json({ message: 'Failed to update booking.' });
    }
});



module.exports = router;
