require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const contactRoutes = require('./routes/contactRoute'); 

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON requests

// Connect to MongoDB
connectDB();

// Root route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Use API routes
app.use('/api/users', userRoutes);
app.use('/api/availability', availabilityRoutes); // Availability endpoints
app.use('/api', contactRoutes); // Mount contact routes under /api/contact
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
