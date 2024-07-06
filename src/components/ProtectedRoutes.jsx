import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import Loader from './ui/Loader';

export default function ProtectedRoutes({ children }) {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                if (window.location.pathname === '/') {
                    navigate('/home/dashboard');
                }
            } else {
                if (window.location.pathname !== '/') {
                    navigate('/');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    if (loading) return <Loader />;

    return children;
}
