import React from 'react';
import '../styles/CoachesPage.css';
import ChaseLim from '../images/coach_info.jpg';

const coaches = [
    {
        id: 1,
        name: 'Chase Lim',
        image: ChaseLim,
        bio: 'Chase is an amateur boxer with over 10 years of experience in boxing and 3 years of dedicated coaching, helping clients achieve their fitness goals and prepare for competitions.',
        highlights: [
            'Nationals 2024 Light Welterweight Silver Medalist (Developmental)',
            'SKBC 2022 Champion',
            '> 3 Years of coaching experience at Legends Fight Sport',
            'Prepared > 20 boxers for competitions',
            'Track record of 12 amateur bouts and 6 exhibition events'
        ],
    },
];

const CoachesPage = () => {
    return (
        <div className="coaches-page">
            <h1>Coach Info</h1>
            <div className="coaches-list">
                {coaches.map((coach) => (
                    <div key={coach.id} className="coach-card">
                        <div className="coach-image">
                            <img src={coach.image} alt={`${coach.name}`} />
                        </div>
                        <div className="coach-info">
                            <h2>{coach.name}</h2>
                            <p className="coach-bio">{coach.bio}</p>
                            <h3>Highlights:</h3>
                            <ul className="coach-highlights">
                                {coach.highlights.map((highlight, index) => (
                                    <li key={index}>{highlight}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoachesPage;
