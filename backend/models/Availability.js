const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String, // Store as a simple string (YYYY-MM-DD) to avoid timezone issues
        required: true,
        index: true, // Index for optimized queries
    },
    slots: [
        {
            time: { type: String, required: true }, // Store time as a simple string (e.g., "10:00 AM")
            bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure unique combinations of `date` and `slots.time`
availabilitySchema.index({ date: 1, 'slots.time': 1 }, { unique: true });

const Availability = mongoose.model('Availability', availabilitySchema);
module.exports = Availability;