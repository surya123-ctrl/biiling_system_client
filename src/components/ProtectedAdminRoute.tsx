'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/lib/features/authSlice';
import type { RootState } from '@/lib/store';

const ProtectedAdminRoute = ({ children }) => {
    const router = useRouter();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true)
    const dispatch = useDispatch();
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        if(isAuthenticated && user?.role === 'admin') {
            setLoading(false);
            return;
        }

        if(!isAuthenticated && token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log(parsedUser, "paresd")
                if(parsedUser.role === 'admin') {
                    dispatch(loginSuccess({
                        token: token,
                        user: parsedUser,
                    }))
                    setLoading(false);
                    return;
                }
                else {
                    console.log('🚫 User is not an admin');
                    router.push('/admin/unauthorized');
                }
            }
            catch (err) {
                console.error("❌ Invalid auth data in localStorage", err);
                router.push('/admin/login');
            }
        }

        if(!token || !storedUser) {
            console.log("🔒 No token found");
            router.push('/admin/login');
        }

        if(isAuthenticated && user?.role !== 'admin') {
            router.push('/admin/unauthorized');
        }

        // setLoading(false);
    }, [isAuthenticated, user, router]);

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying admin access...</p>
            </div>
        </div>
        );
    }
    return <>{children}</>;
}

export default ProtectedAdminRoute;
