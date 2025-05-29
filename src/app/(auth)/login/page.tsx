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
    const dispatch = useDispatch();
    const router = useRouter();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        dispatch(loginStart());
        setIsLoading(true);
        try {
            const data = await POST('/admin/login', { email, password });
            console.log(data)
            if(data.success === true) {
                dispatch(loginSuccess({
                    token: data.data.token,
                    user: data.data.admin,
                }))
                switch(data.data.admin.role) {
                    case 'admin':
                        router.push('/admin/dashboard');
                        break;
                    case 'user':
                        router.push('/admin/settings');
                        break;
                }
                // router.push('/admin/dashboard');
            }
            else {
                dispatch(loginFailure({
                    error: 'Invalid credentials: Please Check Email & Password'
                }))
            }
        }
        catch (err: any) {
            const errorMessage = 'Network Error or server unreachable.';
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
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-300'>
            <div
                className='bg-white p-8 rounded-xl shadow-lg w-full max-w-md transform transition-all duration-500 hover:scale-105'
                style={{
                    animation: 'fadeInUp 0.5s ease-out'
                }}
            >
                <h1 className='text-2xl font-bold text-center mb-6 text-gray-800'>
                    🔐 SweetSpot Admin
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-purple-500"
                            placeholder="admin@sweetspot.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <Link
                        href="/"
                        className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
                    >
                        ← Back to SweetSpot
                    </Link>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

export default AdminLoginPage;