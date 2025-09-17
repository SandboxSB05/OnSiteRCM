import React from 'react';
import { Button } from "@/components/ui/button";
import { Clock, BarChart3, FileText, Folder } from "lucide-react";

export default function ProjectTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { key: 'timeline', label: 'Timeline', icon: Clock },
    { key: 'updates', label: 'Daily Updates', icon: FileText },
    { key: 'finances', label: 'Finances', icon: BarChart3 },
    { key: 'files', label: 'Files', icon: Folder }
  ];

  return (
    <div className="border-b border-gray-200 bg-white rounded-t-lg">
      <nav className="flex space-x-8 px-6" aria-label="Project tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}