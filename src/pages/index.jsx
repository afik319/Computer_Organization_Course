import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Lessons from "./Lessons";

import Exams from "./Exams";

import UserManagement from "./UserManagement";

import Unauthorized from "./Unauthorized";

import StorageInfo from "./StorageInfo";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Lessons: Lessons,
    
    Exams: Exams,
    
    UserManagement: UserManagement,
    
    Unauthorized: Unauthorized,
    
    StorageInfo: StorageInfo,
    
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
                
                <Route path="/Lessons" element={<Lessons />} />
                
                <Route path="/Exams" element={<Exams />} />
                
                <Route path="/UserManagement" element={<UserManagement />} />
                
                <Route path="/Unauthorized" element={<Unauthorized />} />
                
                <Route path="/StorageInfo" element={<StorageInfo />} />
                
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