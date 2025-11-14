import React from 'react';
import { AddCrewLead } from '@/components/contractorportal/AddCrewLead';

/**
 * CrewLeads Page
 * Wrapper page for the crew lead management component
 * Accessible only to contractors
 */
export default function CrewLeads() {
  return (
    <div className="w-full">
      <AddCrewLead />
    </div>
  );
}
