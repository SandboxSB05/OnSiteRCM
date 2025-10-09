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

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';

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
    const currentPage = _getCurrentPage(location.pathname);
    
    // Check if user is logged in (simple check - can be enhanced)
    const isAuthenticated = () => {
        return localStorage.getItem('roof_tracker_user') !== null;
    };
    
    // Get user role from localStorage
    const getUserRole = () => {
        const userStr = localStorage.getItem('roof_tracker_user');
        if (!userStr) return null;
        try {
            const user = JSON.parse(userStr);
            return user.role;
        } catch {
            return null;
        }
    };
    
    // Public routes that don't need authentication
    const publicRoutes = ['/', '/login', '/register', '/clientupdatedetail'];
    const isPublicRoute = publicRoutes.some(route => 
        location.pathname.toLowerCase() === route.toLowerCase()
    );
    
    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated() && !isPublicRoute) {
        return (
            <Routes>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }
    
    // If authenticated and trying to access login/register, redirect based on role
    if (isAuthenticated() && (location.pathname === '/login' || location.pathname === '/register')) {
        const userRole = getUserRole();
        const redirectPath = userRole === 'client' ? '/MyProjects' : '/Dashboard';
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
                <Route path="/ClientUpdateDetail" element={<ClientUpdateDetail />} />
            </Routes>
        );
    }
    
    // Protected routes with Layout
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/DailyUpdates" element={<DailyUpdates />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/CustomerPortal" element={<CustomerPortal />} />
                
                <Route path="/MyProjects" element={<MyProjects />} />
                
                <Route path="/Users" element={<Users />} />
                
                <Route path="/Project" element={<Project />} />
                
                <Route path="/MyAnalytics" element={<MyAnalytics />} />
                
                <Route path="/ClientUpdates" element={<ClientUpdates />} />
                
                <Route path="/ClientUpdateDetail" element={<ClientUpdateDetail />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}