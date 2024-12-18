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
        const bookings = await Availability.find({
            'slots.bookedBy': req.user.id,
        });

        const userBookings = bookings.flatMap((availability) =>
            availability.slots
                .filter((slot) => String(slot.bookedBy) === String(req.user.id))
                .map((slot) => ({
                    date: availability.date,
                    time: slot.time,
                }))
        );

        res.status(200).json({ bookings: userBookings });
    } catch (error) {
        console.error('Error fetching bookings:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.delete('/cancel', authenticateToken, async (req, res) => {
    const { date, slot } = req.body;

    if (!date || !slot) {
        return res.status(400).json({ message: 'Date and slot are required for cancellation' });
    }

    try {
        const availability = await Availability.findOneAndUpdate(
            { date, 'slots.time': slot, 'slots.bookedBy': req.user.id },
            { $set: { 'slots.$.bookedBy': null } }, // Unbook the slot
            { new: true }
        );

        if (!availability) {
            return res.status(404).json({ message: 'No booking found to cancel' });
        }

        res.status(200).json({ message: 'Booking cancelled successfully', availability });
    } catch (error) {
        console.error('Error cancelling booking:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.get('/all', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
        const availability = await Availability.find({}).sort({ date: 1 });
        res.status(200).json({ availability });
    } catch (error) {
        console.error('Error fetching all availability:', error.message);
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

module.exports = router;
