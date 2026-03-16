import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoadingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate a brief delay so the user sees the loading state, or wait for any global data
        const timer = setTimeout(() => {
            if (user?.role === 'ADMIN') {
                navigate('/admin', { replace: true });
            } else if (user?.role === 'PA') {
                navigate('/pa', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [user, navigate]);

    return (
        <div className="flex h-screen items-center justify-center bg-slate-900">
            <div className="text-center flex flex-col items-center">
                <img src="/assets/logo.png" alt="ISRO/CHBS Logo" className="h-24 w-auto object-contain mb-6 animate-pulse" />
                <div className="mb-4 text-4xl font-bold tracking-widest text-white animate-pulse">
                    Human Space Flight Centre <br />
                    <span className="text-blue-500">HALL BOOKING SYSTEM</span>
                </div>
                <div className="flex justify-center gap-2">
                    <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '-0.3s' }}></div>
                    <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '-0.15s' }}></div>
                    <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500"></div>
                </div>
            </div>
        </div>
    );
}