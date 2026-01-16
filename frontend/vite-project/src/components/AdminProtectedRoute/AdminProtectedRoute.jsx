import { Navigate } from 'react-router-dom';

function AdminProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    
    if (!token || !isAdmin) {
        return <Navigate to="/" replace />;
    }
    
    return children;
}

export default AdminProtectedRoute;