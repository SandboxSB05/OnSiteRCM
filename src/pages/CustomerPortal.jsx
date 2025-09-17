import React, { useState, useEffect, useMemo } from "react";
import { Project } from "@/api/entities";
import { DailyUpdate } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BarChart3, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import CustomerList from "../components/customerportal/CustomerList";
import CustomerDetailView from "../components/customerportal/CustomerDetailView";

export default function CustomerPortal() {
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectsAndDeriveCustomers = async () => {
      setIsLoading(true);
      try {
        const allProjects = await Project.list();
        setProjects(allProjects);

        const customerMap = new Map();
        allProjects.forEach(project => {
          const email = project.client_email || project.client_name; // Use name as fallback key
          if (!customerMap.has(email)) {
            customerMap.set(email, {
              name: project.client_name,
              email: project.client_email,
              projectIds: [],
              totalValue: 0,
              projectCount: 0,
            });
          }
          const customerData = customerMap.get(email);
          customerData.projectIds.push(project.id);
          customerData.projectCount += 1;
          customerData.totalValue += project.project_budget || 0;
        });
        
        const sortedCustomers = Array.from(customerMap.values()).sort((a, b) => b.totalValue - a.totalValue);
        setCustomers(sortedCustomers);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
      setIsLoading(false);
    };

    fetchProjectsAndDeriveCustomers();
  }, []);
  
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
  };
  
  const handleBackToList = () => {
    setSelectedCustomer(null);
  };

  const customerProjects = useMemo(() => {
      if (!selectedCustomer) return [];
      return projects.filter(p => selectedCustomer.projectIds.includes(p.id));
  }, [selectedCustomer, projects]);

  return (
    <div className="p-4 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4">
        {selectedCustomer && (
          <Button variant="outline" size="icon" onClick={handleBackToList}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedCustomer ? `Customer Details: ${selectedCustomer.name}` : "Customer Portal"}
          </h1>
          <p className="text-gray-600 mt-1">
            {selectedCustomer ? "View holistic analytics and project history." : "Track and analyze every customer and their projects."}
          </p>
        </div>
      </div>

      {isLoading && <CustomerPortalSkeleton />}
      
      {!isLoading && !selectedCustomer && (
        <CustomerList 
          customers={customers} 
          onSelectCustomer={handleSelectCustomer} 
        />
      )}

      {!isLoading && selectedCustomer && (
        <CustomerDetailView 
          customer={selectedCustomer} 
          projects={customerProjects}
        />
      )}
    </div>
  );
}

const CustomerPortalSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
    </div>
);