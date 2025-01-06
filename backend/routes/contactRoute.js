const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Define email options
        const mailOptions = {
            from: email, // Sender's email
            to: process.env.EMAIL_USER, // my email (recipient)
            subject: `New Contact Form Submission from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});

module.exports = router;
