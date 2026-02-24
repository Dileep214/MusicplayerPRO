import React, { useState } from 'react';
import BackgroundWrapper from '../components/BackgroundWrapper';
import GlassCard from '../components/GlassCard';
import InputField from '../components/InputField';
import Button from '../components/Button';
import AuthNavbar from '../components/AuthNavbar';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import { useMusic } from '../context/MusicContext';

const SignUpPage = () => {
    const navigate = useNavigate();
    const { login } = useMusic();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const { name, email, password } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);

            // Send to backend
            const res = await fetch(`${API_URL}/api/auth/google-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: decoded.name,
                    email: decoded.email,
                    googleId: decoded.sub,
                    profilePhoto: decoded.picture
                })
            });

            const data = await res.json();
            if (res.ok) {
                // Update context state AND localStorage via login()
                login(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
                navigate('/home');
            } else {
                alert(data.message || 'Google signup failed');
            }
        } catch (err) {
            console.error('Google Auth Error:', err);
            alert('Google authentication failed. Please try again.');
        }
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
                // Update context state AND localStorage via login()
                login(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
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
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-full flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => {
                                        console.log('Login Failed');
                                        alert('Google login failed');
                                    }}
                                    theme="filled_black"
                                    shape="pill"
                                    text="signup_with"
                                />
                            </div>
                            <p className="text-xs text-white/40">
                                By signing up, you agree to our Terms & Conditions
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </BackgroundWrapper>
    );
};

export default SignUpPage;
