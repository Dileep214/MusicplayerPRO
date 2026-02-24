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

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useMusic();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = formData;

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
            }

            if (response.ok) {
                // Update context state AND localStorage via login()
                login(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
                navigate('/home');
            } else {
                alert(data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login Error:', error);
            if (error.message.includes('404')) {
                alert('Server endpoint not found (404). Please try again in a moment as the server might be waking up.');
            } else {
                alert('Failed to connect to the server. The backend might be starting up (Cold Start). Please wait 30-60 seconds and try again.');
            }
        } finally {
            setLoading(false);
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

                        <Button type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-full flex justify-center">
                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
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
                                                alert(data.message || 'Google login failed');
                                            }
                                        } catch (err) {
                                            console.error('Google Auth Error:', err);
                                            alert('Google authentication failed. Please try again.');
                                        }
                                    }}
                                    onError={() => {
                                        console.log('Login Failed');
                                        alert('Google login failed');
                                    }}
                                    theme="filled_black"
                                    shape="pill"
                                    text="continue_with"
                                />
                            </div>

                            <a href="#" className="text-xs text-white/40 hover:text-white transition-colors">
                                Forgot your password?
                            </a>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </BackgroundWrapper>
    );
};

export default LoginPage;
