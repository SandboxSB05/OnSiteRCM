import Layout from "./Layout";

import Home from "./Home";

import Login from "./Login";

import Register from "./Register";

import Dashboard from "./Dashboard";

import Projects from "./Projects";

import DailyUpdates from "./DailyUpdates";

import Analytics from "./Analytics";

import CustomerPortal from "./CustomerPortal";

import MyProjects from "./MyProjects";

import Users from "./Users";

import Project from "./Project";

import MyAnalytics from "./MyAnalytics";

import ClientUpdates from "./ClientUpdates";

import ClientUpdateDetail from "./ClientUpdateDetail";

import { PaymentRequired } from "./PaymentRequired";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const PAGES = {
    
    Home: Home,
    
    Login: Login,
    
    Register: Register,
    
    Dashboard: Dashboard,
    
    Projects: Projects,
    
    DailyUpdates: DailyUpdates,
    
    Analytics: Analytics,
    
    CustomerPortal: CustomerPortal,
    
    MyProjects: MyProjects,
    
    Users: Users,
    
    Project: Project,
    
    MyAnalytics: MyAnalytics,
    
    ClientUpdates: ClientUpdates,
    
    ClientUpdateDetail: ClientUpdateDetail,
    
}

function _getCurrentPage(url: string) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop() || '';
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const currentPage = _getCurrentPage(location.pathname);
    
    // Public routes that don't need authentication
    const publicRoutes = ['/', '/login', '/register', '/clientupdatedetail', '/payment-required'];
    const isPublicRoute = publicRoutes.some(route => 
        location.pathname.toLowerCase() === route.toLowerCase()
    );
    
    // If authenticated and trying to access login/register, redirect based on role
    if (isAuthenticated && user && (location.pathname === '/login' || location.pathname === '/register')) {
        const redirectPath = user.role === 'client' ? '/MyProjects' : '/Dashboard';
        return (
            <Routes>
                <Route path="*" element={<Navigate to={redirectPath} replace />} />
            </Routes>
        );
    }
    
    // Public routes without Layout
    if (isPublicRoute && location.pathname !== '/clientupdatedetail') {
        return (
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/payment-required" element={<PaymentRequired />} />
                <Route path="/ClientUpdateDetail" element={<ClientUpdateDetail />} />
            </Routes>
        );
    }
    
    // Protected routes with Layout
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                {/* Admin & Contractor Routes */}
                <Route path="/Dashboard" element={
                    <ProtectedRoute allowedRoles={['admin', 'contractor']}>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                
                {/* Admin & Contractor Routes */}
                <Route path="/Projects" element={
                    <ProtectedRoute allowedRoles={['admin', 'contractor']}>
                        <Projects />
                    </ProtectedRoute>
                } />
                
                {/* Admin & Contractor Routes */}
                <Route path="/DailyUpdates" element={
                    <ProtectedRoute allowedRoles={['admin', 'contractor']}>
                        <DailyUpdates />
                    </ProtectedRoute>
                } />
                
                {/* Admin & Contractor Routes */}
                <Route path="/Analytics" element={
                    <ProtectedRoute allowedRoles={['admin', 'contractor']}>
                        <Analytics />
                    </ProtectedRoute>
                } />
                
                {/* Admin & Contractor Routes */}
                <Route path="/CustomerPortal" element={
                    <ProtectedRoute allowedRoles={['admin', 'contractor']}>
                        <CustomerPortal />
                    </ProtectedRoute>
                } />
                
                {/* Client Routes (also accessible by admin/contractor) */}
                <Route path="/MyProjects" element={
                    <ProtectedRoute allowedRoles={['admin', 'contractor', 'client']}>
                        <MyProjects />
                    </ProtectedRoute>
                } />
                
                {/* Admin Only Route */}
                <Route path="/Users" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Users />
                    </ProtectedRoute>
                } />
                
                {/* Admin & Contractor Routes */}
                <Route path="/Project" element={
                    <ProtectedRoute allowedRoles={['admin', 'contractor']}>
                        <Project />
                    </ProtectedRoute>
                } />
                
                {/* Client Routes (also accessible by admin/contractor) */}
                <Route path="/MyAnalytics" element={
                    <ProtectedRoute allowedRoles={['admin', 'contractor', 'client']}>
                        <MyAnalytics />
                    </ProtectedRoute>
                } />
                
                {/* Admin & Contractor Routes */}
                <Route path="/ClientUpdates" element={
                    <ProtectedRoute allowedRoles={['admin', 'contractor']}>
                        <ClientUpdates />
                    </ProtectedRoute>
                } />
                
                {/* All authenticated users can view client update details */}
                <Route path="/ClientUpdateDetail" element={
                    <ProtectedRoute allowedRoles={['admin', 'contractor', 'client']}>
                        <ClientUpdateDetail />
                    </ProtectedRoute>
                } />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <AuthProvider>
                <PagesContent />
            </AuthProvider>
        </Router>
    );
}