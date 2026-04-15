import React from 'react';
import Hero from './landing/Hero';
import Catalog from './landing/Catalog';
import Topics from './landing/Topics';
import HowItWorks from './landing/HowItWorks';
import Designer from './landing/Designer';
import Reviews from './landing/Reviews';
import Footer from './landing/Footer';

export const MainPage: React.FC = () => {
    return (
        <div className="landing-page main flex flex-col min-h-screen bg-white">
            <Hero />
            <Catalog />
            <Topics />
            <HowItWorks />
            <Designer />
            <Reviews />
            <Footer />
        </div>
    );
};
