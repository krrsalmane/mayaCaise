import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const user = localStorage.getItem('cm_user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
