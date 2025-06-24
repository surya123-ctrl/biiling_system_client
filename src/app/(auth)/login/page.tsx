'use client';
import React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { POST } from '../../../services/api';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '@/lib/features/authSlice';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        dispatch(loginStart());
        setIsLoading(true);
        setError('');
        try {
            const data = await POST('/auth/login', { email, password });
            console.log(data)
            if(data.success === true) {
                console.log(data)
                dispatch(loginSuccess({
                    token: data.data.token,
                    user: data.data.user,
                }))
                switch(data.data.user.role) {
                    case 'admin':
                        router.push('/admin/dashboard');
                        break;
                    case 'user':
                        router.push('/shop/dashboard');
                        break;
                }
            }
            else {
                const errorMsg = 'Invalid credentials. Please check your email and password.';
                setError(errorMsg);
                dispatch(loginFailure({
                    error: errorMsg
                }))
            }
        }
        catch (err: any) {
            const errorMessage = 'Network error or server unreachable. Please try again.';
            setError(errorMessage);
            dispatch(loginFailure({
                error: errorMessage
            }))
            console.error(err)
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center relative overflow-hidden'>
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
                <div className="absolute inset-0 bg-black/20"></div>
                {/* Floating Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-pink-400/30 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-32 right-20 w-16 h-16 bg-purple-400/30 rounded-full blur-lg animate-bounce"></div>
                <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl animate-pulse delay-75"></div>
                <div className="absolute bottom-40 right-1/3 w-12 h-12 bg-pink-300/40 rounded-full blur-lg animate-bounce delay-150"></div>
            </div>

            {/* Glass morphism container */}
            <div className='relative z-10 bg-white/10 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-3xl'>
                {/* Header with Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                    </div>
                    <h1 className='text-3xl font-bold text-white mb-2'>
                        Welcome Back
                    </h1>
                    <p className="text-white/70 text-sm">Sign in to your SweetSpot admin account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm backdrop-blur-sm animate-shake">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-white/90">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/50 hover:bg-white/15"
                                placeholder="admin@sweetspot.com"
                                required
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-white/90">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/50 hover:bg-white/15"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-white/80 transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Signing you in...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                Sign In
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                                </svg>
                            </span>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center space-y-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-white/70 hover:text-white transition-all duration-300 hover:scale-105"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Back to SweetSpot
                    </Link>
                </div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default AdminLoginPage;