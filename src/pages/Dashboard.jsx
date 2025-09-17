import React, { useState, useEffect } from "react";
import { Project } from "@/api/entities";
import { DailyUpdate } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  FolderOpen, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import StatsOverview from "../components/dashboard/StatsOverview";
import RecentProjects from "../components/dashboard/RecentProjects";
import RecentUpdates from "../components/dashboard/RecentUpdates";
import UpcomingTasks from "../components/dashboard/UpcomingTasks";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      let projectsData, updatesData;
      
      if (currentUser.role === 'admin') {
        // Admin sees all projects and updates
        [projectsData, updatesData] = await Promise.all([
          Project.list("-created_date", 20),
          DailyUpdate.list("-update_date", 10)
        ]);
      } else {
        // Regular user sees only their projects and updates
        projectsData = await Project.filter({ owner_user_id: currentUser.id });
        const projectIds = projectsData.map(p => p.id);
        
        if (projectIds.length > 0) {
          updatesData = await Promise.all(
            projectIds.map(id => DailyUpdate.filter({ project_id: id }))
          );
          updatesData = updatesData.flat().sort((a, b) => 
            new Date(b.update_date) - new Date(a.update_date)
          ).slice(0, 10);
        } else {
          updatesData = [];
        }
      }
      
      setProjects(projectsData);
      setDailyUpdates(updatesData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.project_status === 'in_progress').length;
    const completed = projects.filter(p => p.project_status === 'completed').length;
    const onHold = projects.filter(p => p.project_status === 'on_hold').length;
    const totalRevenue = projects.reduce((sum, p) => sum + (p.project_budget || 0), 0);
    
    return { total, active, completed, onHold, totalRevenue };
  };

  const stats = getProjectStats();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-4 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin 
              ? "Overview of all projects and system activity." 
              : "Welcome back! Here's what's happening with your projects."
            }
          </p>
        </div>
        <div className="flex gap-3">
          <Link to={createPageUrl("DailyUpdates")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Clock className="w-4 h-4 mr-2" />
              Add Daily Update
            </Button>
          </Link>
          <Link to={createPageUrl(isAdmin ? "Projects" : "MyProjects")}>
            <Button variant="outline">
              <FolderOpen className="w-4 h-4 mr-2" />
              {isAdmin ? 'All Projects' : 'My Projects'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={stats} isLoading={isLoading} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentProjects 
            projects={projects} 
            isLoading={isLoading} 
            title={isAdmin ? "Recent Projects" : "My Recent Projects"}
          />
          <RecentUpdates 
            dailyUpdates={dailyUpdates} 
            projects={projects} 
            isLoading={isLoading} 
            title="Recent Updates"
          />
        </div>
        <div className="space-y-6">
          <UpcomingTasks projects={projects} isLoading={isLoading} />
          
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={createPageUrl(isAdmin ? "Projects" : "MyProjects")} className="block">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">New Project</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
              
              {isAdmin && (
                <>
                  <Link to={createPageUrl("Analytics")} className="block">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-medium">View Analytics</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                  
                  <Link to={createPageUrl("Users")} className="block">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Manage Users</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                </>
              )}
              
              <Link to={createPageUrl("CustomerPortal")} className="block">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Customer Portal</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}