import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import cslLogo from './assets/logo.png';
import "./styles/landing_page.scss"
import { Link } from 'react-router-dom';

export default function LandingPage() {
    const poweredByRef = useRef(null);
    const getStartedRef = useRef(null);
    const logoRef = useRef(null);
    useEffect(() => {
        const poweredByElement = poweredByRef.current;
        const getStartedElement = getStartedRef.current;
        const logoElement = logoRef.current;
        const timeline = gsap.timeline({ paused: true });
        timeline
            .fromTo(poweredByElement, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 2 })
            .fromTo(logoElement, { opacity: 0 }, { opacity: 1, duration: 2 }, "-=1")
            .fromTo(getStartedElement, { x: 300, opacity: 0 }, { x: -100, opacity: 1, duration: 1 }, "-=2")
            .fromTo(getStartedElement, { x: -100 }, { x: 0, duration: 1 }, "-=1");

        timeline.play();

        return () => timeline.kill(); // Cleanup function
    }, []);
    return (
        <div className='landingpage'>
            <div className='bgpage'></div>
            <img ref={logoRef} src={cslLogo} alt="" />
            <h1>CyberSecuLearn</h1>
            <div className='CSL_texts'>
                <p className='h2'>Learning Cybersecurity and much more; the fun way</p>
                <p className='h2'>Play Games, Learn Skills, Earn Certificates.</p>
                <p ref={poweredByRef}>The COM 668 Submission</p>
                <Link ref={getStartedRef} className='getstarted' to="/login">Get Started</Link>
                <hr style={{ marginTop: "20vh", border: "2px solid black" }} />
            </div>
        </div>

    );
}