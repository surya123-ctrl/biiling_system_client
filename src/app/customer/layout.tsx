import React from 'react';
import ProtectedCustomerRoute from '@/components/ProtectedCustomerRoute';
import { ReactNode } from 'react';
interface LayoutProps {
  children: ReactNode;
}
const Layout = ({children}: LayoutProps) => {
    return (
        <ProtectedCustomerRoute>
            {children}
        </ProtectedCustomerRoute>
    );
}

export default Layout;
