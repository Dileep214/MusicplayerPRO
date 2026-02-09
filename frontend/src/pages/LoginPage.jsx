import React, { useState } from 'react';
import BackgroundWrapper from '../components/BackgroundWrapper';
import GlassCard from '../components/GlassCard';
import InputField from '../components/InputField';
import Button from '../components/Button';
import AuthNavbar from '../components/AuthNavbar';
import { useNavigate } from 'react-router-dom';
import API_URL from '../api/config';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (response.ok) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/home');
            } else {
                alert(data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login Error:', error);
            alert('Failed to connect to the server.');
        }
    };

    return (
        <BackgroundWrapper>
            <AuthNavbar
                label="Don't have an account?"
                linkText="Sign up"
                linkPath="/signup"
            />

            <div className="flex items-center justify-center min-h-screen px-4">
                <GlassCard>
                    {/* Heading */}
                    <h2 className="text-3xl font-bold text-white text-center mb-2 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="text-white/60 text-center mb-8 text-sm">
                        Sign in to continue your journey
                    </p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
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
                            placeholder="Enter your password"
                            value={password}
                            onChange={handleChange}
                        />

                        <Button type="submit">
                            Sign In
                        </Button>
                    </form>

                    {/* Footer/Divider */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <a href="#" className="text-xs text-white/40 hover:text-white transition-colors">
                            Forgot your password?
                        </a>
                    </div>
                </GlassCard>
            </div>
        </BackgroundWrapper>
    );
};

export default LoginPage;
