import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';
import boxingImage1 from '../images/boxing_feature1.png';
import boxingImage2 from '../images/boxing_feature2.png';
import boxingImage3 from '../images/boxing_feature3.png';
import instagram from '../images/instagram_logo.png';
import boxingImage4 from '../images/coaching1.jpg';


const LandingPage = () => {
    const navigate = useNavigate();

    const handleBookSessionClick = (e) => {
        const token = localStorage.getItem('token'); // Check if the user is logged in
        if (!token) {
            e.preventDefault(); // Prevent navigation
            alert('You need to log in to book a session.');
            navigate('/login'); // Redirect to login page
        }
    };

    return (
        <div className="landing-page">
            <header className="header">
                <div className="header-content">
                    <h1 className="title">Personal Training with Chase</h1>
                    <p className="tagline">The ultimate personal training booking platform!</p>
                    <Link to="/book" className="cta-button" onClick={handleBookSessionClick}>
                        Book a Session
                    </Link>
                </div>
            </header>

            <section className="features">
                <div className="feature">
                    <img src={boxingImage3} alt="Seamless Scheduling" className="feature-icon" />
                    <h2>Seamless Scheduling</h2>
                    <p>Pick the perfect date and time for your training sessions.</p>
                </div>
                <div className="feature">
                    <img src={boxingImage1} alt="Professional Training" className="feature-icon" />
                    <h2>Professional Training</h2>
                    <p>Highly personalized training based on your unique goals.</p>
                </div>
                <div className="feature">
                    <img src={boxingImage2} alt="Stay Fit, Stay Healthy" className="feature-icon" />
                    <h2>Stay Fit, Stay Healthy</h2>
                    <p>Achieve your fitness goals with ease and convenience.</p>
                </div>
            </section>

            <section className="branded-app-section">
                <div className="branded-app-content">
                    <div className="app-description">
                        <h2>Try Before You Commit!</h2>
                        <p>
                            <strong>Enjoy exclusive discounted rates for first-time users of this app, even if you've trained with me before. </strong> 
                        </p>
                        <p>
                            Have questions? Feel free to reach out via the contact form or send me a direct message on Instagram!
                        </p>
                    </div>
                    <div className="app-mockup">
                        <img
                            src={boxingImage4}
                            alt="Branded Member App Mockup"
                            className="app-image"
                        />
                    </div>
                </div>
            </section>

            <footer className="footer">
                <div className="footer-content">
                    <p>© 2024 Chase Lim. All rights reserved.</p>
                    <div className="social-links">
                        <a
                            href="https://www.instagram.com/chaseeelim/?hl=en"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src={instagram} alt="Instagram" />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
