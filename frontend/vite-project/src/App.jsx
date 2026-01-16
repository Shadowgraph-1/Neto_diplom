import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import Register from './pages/Registration/Registration.jsx'
import Dashboard from './pages/Dashboard/Dashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute/AdminProtectedRoute';

function App () {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/registration' element={<Register />}/>
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App