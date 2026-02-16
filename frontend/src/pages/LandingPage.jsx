import React from 'react';
import BackgroundWrapper from '../components/BackgroundWrapper';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        const user = localStorage.getItem('user');
        if (user && user !== 'undefined') {
            navigate('/home');
        }
    }, [navigate]);

    return (
        <BackgroundWrapper>
            <Navbar />
            <Hero />
        </BackgroundWrapper>
    );
};

export default LandingPage;
