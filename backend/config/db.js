require('dotenv').config({ path: '../.env' }); // Adjust the path as necessary

const mongoose = require('mongoose');

console.log('connectDB loaded');

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('Error: MONGO_URI is not defined in .env file');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error(`Stack Trace: ${error.stack}`);
        process.exit(1);
    }
};

// Main function to test connectivity if run directly
if (require.main === module) {
    (async () => {
        try {
            await connectDB();
        } catch (err) {
            console.error('Error in main function:', err);
            process.exit(1);
        }
    })();
}

module.exports = connectDB;
