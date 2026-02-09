import React from 'react';
import BackgroundWrapper from '../components/BackgroundWrapper';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

const LandingPage = () => {
    return (
        <BackgroundWrapper>
            <Navbar />
            <Hero />
        </BackgroundWrapper>
    );
};

export default LandingPage;
