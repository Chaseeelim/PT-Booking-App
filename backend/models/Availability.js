const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String, // Store as a string (YYYY-MM-DD)
        required: true,
        index: true, // Index for optimized queries
    },
    slots: [
        {
            time: { type: String, required: true },
            bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

availabilitySchema.index({ date: 1, 'slots.time': 1 }, { unique: true });

const Availability = mongoose.model('Availability', availabilitySchema);
module.exports = Availability;
