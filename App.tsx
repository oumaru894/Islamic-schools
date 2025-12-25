import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Home from './pages/Home';
import Directory from './pages/Directory';
import SchoolProfile from './pages/SchoolProfile';
import SchoolHome from './pages/SchoolHome';
import SchoolAdmissions from './pages/SchoolAdmissions';
import SchoolContact from './pages/SchoolContact';
import AdminLogin from './pages/AdminLogin';
import AdminProfile from './pages/AdminProfile';
import AdminCreate from './pages/AdminCreate';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminManageSchool from './pages/AdminManageSchool';
import ProtectedRoute from './components/ProtectedRoute';
import Staff from './pages/Staff';
import GalleryPage from './pages/GalleryPage';
import TestimonialPage from './pages/TestimonialPage';
import SchoolAbout from './pages/SchoolAbout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schools" element={<Directory />} />
          <Route path="/school/:id" element={<SchoolHome />} />
          <Route path="/school/:id/home" element={<SchoolHome />} />
          <Route path="/school/:id/admissions" element={<SchoolAdmissions />} />
          <Route path="/school/:id/contact" element={<SchoolContact />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/school/:id/about" element={<SchoolAbout />} />
          <Route path="/school/:id/staff" element={<Staff />} />
          <Route path="/school/:id/gallery" element={<GalleryPage />} />
          <Route path='/school/:id/testimonials' element={<TestimonialPage />} />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/admin/create"
            element={
              <ProtectedRoute requiredRole="superadmin">
                <AdminCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute requiredRole="superadmin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-school"
            element={
              <ProtectedRoute>
                <AdminManageSchool />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-school/:id"
            element={
              <ProtectedRoute>
                <AdminManageSchool />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
  
}

export default App;