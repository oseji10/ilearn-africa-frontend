"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ProtectedRoute = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
      }
    }, [router]);

    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default ProtectedRoute;
