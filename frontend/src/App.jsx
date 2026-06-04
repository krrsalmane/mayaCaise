import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Purchases from './pages/Purchases';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
        <Route path="/clients/:id" element={<PrivateRoute><ClientDetail /></PrivateRoute>} />
        <Route path="/purchases" element={<PrivateRoute><Purchases /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
