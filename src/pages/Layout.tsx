

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Home, 
  FolderOpen, 
  Upload, 
  BarChart3, 
  Users, 
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Plus, // Added Plus icon
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const getUserNavigationItems = (isAdmin) => {
  const baseItems = [
    {
      title: "My Projects",
      url: createPageUrl("MyProjects"),
      icon: FolderOpen,
    },
    {
      title: "Daily Updates",
      url: createPageUrl("DailyUpdates"),
      icon: Upload,
    },
    {
      title: "Client Updates",
      url: createPageUrl("ClientUpdates"),
      icon: MessageSquare,
    },
    {
      title: "My Analytics", // Added "My Analytics"
      url: createPageUrl("MyAnalytics"),
      icon: BarChart3,
    }
  ];

  const adminItems = [
    {
      title: "Admin Analytics", // Renamed "Analytics" to "Admin Analytics"
      url: createPageUrl("Analytics"),
      icon: BarChart3,
    },
    {
      title: "All Projects",
      url: createPageUrl("Projects"),
      icon: FolderOpen,
    },
    {
      title: "Users",
      url: createPageUrl("Users"),
      icon: Users,
    },
    {
      title: "Customer Portal",
      url: createPageUrl("CustomerPortal"),
      icon: Users,
    }
  ];

  return isAdmin ? [...baseItems, ...adminItems] : baseItems;
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast(); // Initialize useToast

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setIsAdmin(currentUser.role === 'admin');
      } catch (error) {
        console.error("Error loading user:", error);
        toast({
          title: "Authentication Error",
          description: "Could not load user data. Please try logging in again.",
          variant: "destructive",
        });
      }
    };
    loadUser();
  }, [toast]); // Add toast to dependency array

  const handleLogout = async () => {
    try {
      await User.logout();
      // Clear localStorage
      localStorage.removeItem('roof_tracker_user');
      localStorage.removeItem('roof_tracker_remember');
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
        variant: "success",
      });
      
      // Redirect to home page after logout
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error("Error logging out:", error);
      // Even if User.logout() fails, clear localStorage and redirect
      localStorage.removeItem('roof_tracker_user');
      localStorage.removeItem('roof_tracker_remember');
      window.location.href = '/';
    }
  };

  const navigationItems = getUserNavigationItems(isAdmin);

  return (
    <div className="min-h-screen bg-gray-50">
       <Toaster />
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">OnSite RCM</span>
            </div>
          </div>
          <div className="flex items-center gap-2"> {/* Added div for grouping */}
            {isAdmin && <Badge variant="secondary" className="bg-purple-100 text-purple-800">Admin</Badge>}
            <Link to={`${createPageUrl("MyProjects")}?new=true`}> {/* New Project Button */}
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1" />
                New Project
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-64 bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">OnSite RCM</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.url
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleLogout}>
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-72">
            <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
              {/* Logo */}
              <div className="flex items-center h-16 flex-shrink-0 px-6 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">OnSite RCM</h1>
                    <p className="text-xs text-blue-100">Project Management</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-6 py-4 border-b border-gray-100">
                <Link to={`${createPageUrl("MyProjects")}?new=true`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-6 py-6 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${
                      location.pathname === item.url
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </Link>
                ))}
              </nav>

              {/* User Profile */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.full_name?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.full_name || 'User'}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || ''}
                      </p>
                      {isAdmin && <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">Admin</Badge>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="flex-shrink-0">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

