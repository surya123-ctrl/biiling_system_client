"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { GET } from '@/services/api';
const OrderQueuePage = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    console.log(user, isAuthenticated)
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('processing');
    const [paymentFilter, setPaymentFilter] = useState('paid');
    const [updatingOrder, setUpdatingOrder] = useState(null);
    useEffect(() => {
        if(!isAuthenticated || user?.role !== 'user') {
            router.push('/login');
        }
    }, []);
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await GET(`/menu/getProcessingOrders/${user?._id}?status=${statusFilter}&paymentStatus=${paymentFilter}`);
            console.log(response);
        }
        catch (error) {
            setError('Failed to fetch orders');
            console.error('Error in fetching orders: ', error);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if(isAuthenticated && user?.role === 'user') {
            fetchOrders();
        }
    }, [isAuthenticated, user?.role]);
    return (
        <div>
            
        </div>
    );
}

export default OrderQueuePage;
