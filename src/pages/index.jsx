import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Projects from "./Projects";

import DailyUpdates from "./DailyUpdates";

import Analytics from "./Analytics";

import CustomerPortal from "./CustomerPortal";

import MyProjects from "./MyProjects";

import Users from "./Users";

import Project from "./Project";

import MyAnalytics from "./MyAnalytics";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Projects: Projects,
    
    DailyUpdates: DailyUpdates,
    
    Analytics: Analytics,
    
    CustomerPortal: CustomerPortal,
    
    MyProjects: MyProjects,
    
    Users: Users,
    
    Project: Project,
    
    MyAnalytics: MyAnalytics,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
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
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/DailyUpdates" element={<DailyUpdates />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/CustomerPortal" element={<CustomerPortal />} />
                
                <Route path="/MyProjects" element={<MyProjects />} />
                
                <Route path="/Users" element={<Users />} />
                
                <Route path="/Project" element={<Project />} />
                
                <Route path="/MyAnalytics" element={<MyAnalytics />} />
                
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