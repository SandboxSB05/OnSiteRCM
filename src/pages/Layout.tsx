import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  MessageSquare,
  ArrowRight,
  RefreshCw // Added for role switcher
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
  currentPageName?: string;
}

const getUserNavigationItems = (role: 'admin' | 'contractor' | 'client') => {
  // Homeowner (client) only sees My Projects and Feature Request
  if (role === 'client') {
    return [
      {
        title: "My Projects",
        url: createPageUrl("MyProjects"),
        icon: FolderOpen,
      },
      {
        title: "Feature Request",
        url: createPageUrl("FeatureRequest"),
        icon: MessageSquare,
      },
    ];
  }

  // Contractor (user) sees base items
  const baseItems = [
    {
      title: "Dashboard",
      url: createPageUrl("Dashboard"),
      icon: Home,
    },
    {
      title: "My Projects",
      url: createPageUrl("MyProjects"),
      icon: FolderOpen,
    },
    {
      title: "Create Update",
      url: createPageUrl("DailyUpdates"),
      icon: Upload,
    },
    {
      title: "Client Updates",
      url: createPageUrl("ClientUpdates"),
      icon: MessageSquare,
    },
    // {
    //   title: "My Analytics", // Added "My Analytics"
    //   url: createPageUrl("MyAnalytics"),
    //   icon: BarChart3,
    // }
  ];

  // Admin sees everything
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

  return role === 'admin' ? [...baseItems, ...adminItems] : baseItems;
};

export default function Layout({ children, currentPageName }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: authLogout, setUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // Debug: Log whenever user changes
  useEffect(() => {
    console.log('👤 Layout: User changed:', {
      role: user?.role,
      name: user?.name,
      id: user?.id
    });
  }, [user]);

  const handleLogout = async () => {
    try {
      await authLogout();
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
      
      // Redirect to home page after logout
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Error",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // DEV ONLY: Role switcher function
  const handleRoleSwitch = () => {
    if (!user) return;
    
    const roles: Array<'admin' | 'contractor' | 'client'> = ['admin', 'contractor', 'client'];
    const currentIndex = roles.indexOf(user.role);
    const nextRole = roles[(currentIndex + 1) % roles.length];
    
    console.log('🔄 Role Switch:', {
      currentRole: user.role,
      nextRole,
      currentIndex
    });
    
    // Update user role (in a real app, this would call an API)
    const updatedUser = { ...user, role: nextRole };
    
    console.log('📝 Updated User:', updatedUser);
    
    // Update the auth context (Supabase session will be handled separately)
    setUser(updatedUser);
    
    const roleLabels: Record<'admin' | 'contractor' | 'client', string> = {
      'admin': 'Admin',
      'contractor': 'Contractor',
      'client': 'Client'
    };
    
    toast({
      title: "Role Switched",
      description: `Now viewing as: ${roleLabels[nextRole]}`,
    });
    
    console.log('🚀 Navigating to:', nextRole === 'client' ? '/MyProjects' : '/Dashboard');
    
    // Navigate to appropriate page based on role
    if (nextRole === 'client') {
      navigate('/MyProjects');
    } else {
      navigate('/Dashboard');
    }
  };

  // Recalculate navigation items when user role changes
  const navigationItems = useMemo(() => {
    const items = getUserNavigationItems(user?.role || 'contractor');
    console.log('📋 Navigation Items Updated:', {
      role: user?.role,
      itemCount: items.length,
      items: items.map(i => i.title)
    });
    return items;
  }, [user?.role]);

  const isContractorLayout = user?.role === 'contractor';

  if (isContractorLayout) {
    return (
      <div className="min-h-screen bg-white">
        <Toaster />
        <div className="sticky top-0 z-40 border-b border-[rgba(0,0,0,0.08)] bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="text-[#030213] hover:bg-[#ececf0]"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#717182]">OnSite</p>
                  <p className="text-base font-semibold text-[#030213]">Contractor Hub</p>
                </div>
              </div>
            </div>
            <Link to={`${createPageUrl("MyProjects")}?new=true`}>
              <Button className="h-10 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:from-emerald-600 hover:to-teal-700">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-[#030213]/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative ml-auto flex h-full w-[18rem] flex-col rounded-l-3xl border border-[rgba(0,0,0,0.08)] bg-white/95 p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#717182]">
                      OnSite
                    </p>
                    <p className="text-base font-semibold text-[#030213]">Contractor Hub</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#717182] hover:bg-[#ececf0]"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="mt-6 flex-1 space-y-2.5">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all ${
                        isActive
                          ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-[#030213] shadow-lg'
                          : 'border-transparent text-[#717182] hover:border-[rgba(0,0,0,0.08)] hover:bg-[#f9fafb] hover:text-[#030213]'
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow'
                            : 'bg-[#ececf0] text-[#030213] group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 space-y-3 border-t border-[rgba(0,0,0,0.06)] pt-6">
                {import.meta.env.DEV && (
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[rgba(130,71,229,0.2)] text-[#7c3aed] hover:bg-[#f3e8ff]"
                    onClick={handleRoleSwitch}
                  >
                    <RefreshCw className="mr-3 h-5 w-5" />
                    Switch Role ({user?.role === 'admin' ? 'Admin' : user?.role === 'contractor' ? 'Contractor' : 'Client'})
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex w-full">
          <aside className="hidden w-64 shrink-0 lg:block border-r border-[rgba(0,0,0,0.06)] bg-white">
            <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
              {/* Compact Header */}
              <div className="border-b border-[rgba(0,0,0,0.06)] bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/70 font-medium">
                      OnSite
                    </p>
                    <h2 className="text-lg font-bold">Contractor Hub</h2>
                  </div>
                </div>
                <Link to={`${createPageUrl("MyProjects")}?new=true`}>
                  <Button className="h-9 w-full bg-white/20 text-sm font-semibold text-white border border-white/30 hover:bg-white/30 backdrop-blur transition-all">
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    New Project
                  </Button>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-[#030213] shadow-sm border border-emerald-200'
                          : 'text-[#717182] hover:bg-[#f9fafb] hover:text-[#030213]'
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${
                          isActive
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md'
                            : 'bg-[#ececf0] text-[#030213] group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-500 group-hover:text-white'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className={`text-sm font-semibold ${isActive ? 'text-[#030213]' : ''}`}>
                        {item.title}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="border-t border-[rgba(0,0,0,0.06)] p-3 space-y-2 bg-[#fafafa]">
                {import.meta.env.DEV && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs border-[rgba(130,71,229,0.2)] text-[#7c3aed] hover:bg-[#f3e8ff]"
                    onClick={handleRoleSwitch}
                  >
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Switch Role
                  </Button>
                )}

                <div className="flex items-center gap-2.5 rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <span className="text-sm font-semibold">
                      {user?.name?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#030213] truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-[10px] text-[#717182] truncate">
                      {user?.email || ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-8 w-8 shrink-0 text-[#717182] hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </div>
    );
  }

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
            {user?.role === 'admin' && <Badge variant="secondary" className="bg-purple-100 text-purple-800">Admin</Badge>}
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
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {/* DEV: Role Switcher Button */}
                {import.meta.env.DEV && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-purple-600 border-purple-300 hover:bg-purple-50"
                    onClick={handleRoleSwitch}
                  >
                    <RefreshCw className="h-5 w-5 mr-3" />
                    Switch Role ({user?.role === 'admin' ? 'Admin' : user?.role === 'contractor' ? 'Contractor' : 'Client'})
                  </Button>
                )}
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
                {/* DEV: Role Switcher Button */}
                {import.meta.env.DEV && (
                  <div className="mb-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-purple-600 border-purple-300 hover:bg-purple-50"
                      onClick={handleRoleSwitch}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Switch Role ({user?.role === 'admin' ? 'Admin' : user?.role === 'contractor' ? 'Contractor' : 'Client'})
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.name?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || 'User'}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || ''}
                      </p>
                      {user?.role === 'admin' && <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">Admin</Badge>}
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
