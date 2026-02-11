import React, { useState } from 'react';
import BackgroundWrapper from '../components/BackgroundWrapper';
import GlassCard from '../components/GlassCard';
import InputField from '../components/InputField';
import Button from '../components/Button';
import AuthNavbar from '../components/AuthNavbar';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const SignUpPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const { name, email, password } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (response.ok) {
                // Store user data in localStorage for auto-login
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/home');
            } else {
                alert(data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Signup Error:', error);
            alert('Failed to connect to the server.');
        }
    };

    return (
        <BackgroundWrapper>
            <AuthNavbar />

            <div className="flex items-center justify-center min-h-screen px-4">
                <GlassCard>
                    {/* Heading */}
                    <h2 className="text-3xl font-bold text-white text-center mb-2 tracking-tight">
                        Create Account
                    </h2>
                    <p className="text-white/60 text-center mb-8 text-sm">
                        Join the rhythm based revolution
                    </p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <InputField
                            label="Full Name"
                            id="name"
                            placeholder="Enter your name"
                            value={name}
                            onChange={handleChange}
                        />

                        <InputField
                            label="Email Address"
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={handleChange}
                        />

                        <InputField
                            label="Password"
                            id="password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={handleChange}
                        />

                        <Button type="submit">
                            Sign Up
                        </Button>
                    </form>

                    {/* Footer/Divider */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-xs text-white/40">
                            By signing up, you agree to our Terms & Conditions
                        </p>
                    </div>
                </GlassCard>
            </div>
        </BackgroundWrapper>
    );
};

export default SignUpPage;
