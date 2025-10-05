
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Edit, Trash2, Calendar, Clock, Camera, AlertTriangle, Send } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function DayUpdatesList({ updates, selectedDate, onEdit, onDelete, onSend }) {
  const safeUpdates = Array.isArray(updates) ? updates : [];

  if (safeUpdates.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Updates for {format(new Date(selectedDate), 'MMM d, yyyy')}</h3>
        <p className="text-gray-500">Create the first update for this day.</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {safeUpdates.map((update) => (
        <Card key={update.id} className="shadow-md border-0 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{update.created_by}</p>
                  <p className="text-xs text-gray-500">
                    Posted at {format(new Date(update.created_date), 'h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!update.sent_to_customer && (
                  <Button variant="outline" size="sm" onClick={() => onSend(update)}>
                    <Send className="w-4 h-4 mr-2" /> Send
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => onEdit(update)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(update.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Show AI summary if available, otherwise show PM description */}
            <p className="text-gray-700 whitespace-pre-wrap">
              {update.ai_summary || update.pm_description}
            </p>

            {/* STATS */}
            <div className="flex items-center gap-6 text-sm">
              {(update.hours_worked || update.completion_percentage) && (
                <>
                  {update.hours_worked && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span><span className="font-semibold">{update.hours_worked}</span> hours worked</span>
                    </div>
                  )}
                  {update.completion_percentage && (
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${update.completion_percentage}%`}}></div>
                      </div>
                      <span className="font-semibold">{update.completion_percentage}%</span>
                      <span>complete</span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* PHOTOS */}
            {update.progress_photos && update.progress_photos.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
                  <Camera className="w-4 h-4 mr-2" />
                  Progress Photos ({update.progress_photos.length})
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {update.progress_photos.map((photo, index) => (
                    <a key={index} href={photo} target="_blank" rel="noopener noreferrer">
                      <img src={photo} alt={`progress ${index + 1}`} className="w-full h-24 object-cover rounded-md hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
