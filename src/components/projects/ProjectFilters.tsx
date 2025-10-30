import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjectFilters({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  typeFilter, 
  setTypeFilter,
  updatesFilter,
  setUpdatesFilter
}) {
  return (
    <Card className="border border-[rgba(0,0,0,0.08)] bg-white shadow-sm rounded-2xl">
      <CardContent className="p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#717182]" />
            <Input
              placeholder="Search projects, clients, or addresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#f9fafb] border border-[rgba(0,0,0,0.08)] focus:border-emerald-300 focus:ring-emerald-200 text-[#030213] placeholder:text-[#717182]"
            />
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 border-[rgba(0,0,0,0.08)] hover:border-emerald-300 focus:ring-emerald-200">
                <Filter className="w-4 h-4 mr-2 text-emerald-600" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 border-[rgba(0,0,0,0.08)] hover:border-emerald-300 focus:ring-emerald-200">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="residential_replacement">Residential Replace</SelectItem>
                <SelectItem value="residential_repair">Residential Repair</SelectItem>
                <SelectItem value="commercial_replacement">Commercial Replace</SelectItem>
                <SelectItem value="commercial_repair">Commercial Repair</SelectItem>
                <SelectItem value="new_construction">New Construction</SelectItem>
              </SelectContent>
            </Select>

            {setUpdatesFilter && (
              <Select value={updatesFilter || "all"} onValueChange={setUpdatesFilter}>
                <SelectTrigger className="w-36 border-[rgba(0,0,0,0.08)] hover:border-emerald-300 focus:ring-emerald-200">
                  <MessageSquare className="w-4 h-4 mr-2 text-emerald-600" />
                  <SelectValue placeholder="Updates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="has_updates">Has Updates</SelectItem>
                  <SelectItem value="no_updates">No Updates</SelectItem>
                  <SelectItem value="recent_updates">Recent (7d)</SelectItem>
                  <SelectItem value="stale_updates">Stale (&gt;7d)</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}