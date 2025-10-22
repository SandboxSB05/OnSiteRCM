import React, { useState, useEffect } from 'react';
import { ClientUpdate, Project } from '@/api/supabaseEntities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar, DollarSign, FileText } from 'lucide-react';
import { format } from 'date-fns';

// Define types
interface AdditionalMaterial {
  description: string;
  cost: number;
  [key: string]: any;
}

interface ClientUpdateType {
  id: string;
  project_id: string;
  update_date: string;
  description: string;
  time_cost_labor?: number;
  time_cost_notes?: string;
  additional_materials?: AdditionalMaterial[];
  total_cost_to_date?: number;
  total_paid?: number;
  total_due?: number;
  photos?: string[];
  videos?: string[];
  [key: string]: any;
}

interface ProjectType {
  id: string;
  project_name: string;
  client_name?: string;
  [key: string]: any;
}

export default function ClientUpdateDetail() {
  const [update, setUpdate] = useState<ClientUpdateType | null>(null);
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUpdate();
  }, []);

  const loadUpdate = async () => {
    setIsLoading(true);
    try {
      // Get update ID from URL query params
      const params = new URLSearchParams(window.location.search);
      const updateId = params.get('id');
      
      if (!updateId) {
        setError('No update ID provided');
        setIsLoading(false);
        return;
      }

      // Load the client update
      const clientUpdate = await ClientUpdate.findOne(updateId);
      if (!clientUpdate) {
        setError('Update not found');
        setIsLoading(false);
        return;
      }
      setUpdate(clientUpdate);

      // Load the associated project
      if (clientUpdate.project_id) {
        const projectData = await Project.findOne(clientUpdate.project_id);
        setProject(projectData);
      }
    } catch (err) {
      console.error('Error loading update:', err);
      setError('Failed to load update');
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !update) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 font-medium">{error || 'Update not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <h1 className="text-3xl font-bold mb-2">Project Update</h1>
          {project && (
            <p className="text-blue-100 text-lg">{project.project_name}</p>
          )}
        </div>

        {/* Update Details */}
        <Card className="rounded-t-none shadow-lg">
          <CardContent className="p-6 space-y-6">
            {/* Date */}
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">
                {format(new Date(update.update_date), 'MMMM d, yyyy')}
              </span>
            </div>

            {/* Work Summary */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Work Summary
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {update.description}
              </p>
            </div>

            {/* Additional Costs */}
            {((update.time_cost_labor && update.time_cost_labor > 0) || 
              (update.additional_materials && update.additional_materials.length > 0)) && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Additional Project Costs</h2>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {update.time_cost_labor && update.time_cost_labor > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">
                        {update.time_cost_notes || 'Additional Labor'}
                      </span>
                      <span className="font-medium text-gray-900">
                        ${update.time_cost_labor.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {update.additional_materials?.map((item: AdditionalMaterial, index: number) => (
                    item.cost > 0 && (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-700">{item.description}</span>
                        <span className="font-medium text-gray-900">
                          ${item.cost.toFixed(2)}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Financial Summary
              </h2>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Cost to Date:</span>
                  <span className="font-semibold text-gray-900">
                    ${(update.total_cost_to_date || 0).toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Paid:</span>
                  <span className="font-semibold text-green-700">
                    ${(update.total_paid || 0).toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-900 font-medium">Remaining Balance:</span>
                  <span className="font-bold text-lg text-blue-600">
                    ${(update.total_due || 0).toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Photos */}
            {update.photos && update.photos.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Photos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {update.photos.map((photo: string, index: number) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-md">
                      <img 
                        src={photo} 
                        alt={`Update photo ${index + 1}`}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {update.videos && update.videos.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Videos</h2>
                <div className="space-y-2">
                  {update.videos.map((video: string, index: number) => (
                    <a 
                      key={index}
                      href={video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 underline"
                    >
                      Video {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Powered by OnSite | Roofing Contractor Management</p>
          {project && project.client_name && (
            <p className="mt-1">For: {project.client_name}</p>
          )}
        </div>
      </div>
    </div>
  );
}
