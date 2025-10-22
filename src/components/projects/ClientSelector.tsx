import React, { useState, useEffect } from 'react';
import { User } from '@/api/supabaseEntities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddClientModal from './AddClientModal';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface ClientSelectorProps {
  value: string | null;
  onChange: (clientId: string | null) => void;
}

export default function ClientSelector({ value, onChange }: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      // Load all users with role='client'
      const clientUsers = await User.filter({ role: 'client' });
      setClients(clientUsers || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    }
    setIsLoading(false);
  };

  const handleClientCreated = (newClient: Client) => {
    // Add to list
    setClients(prev => [...prev, newClient]);
    // Select the new client
    onChange(newClient.id);
    // Close modal
    setShowAddModal(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <Select 
            value={value || 'none'} 
            onValueChange={(val) => onChange(val === 'none' ? null : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading clients..." : "Select a client"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No client (optional)</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Client
        </Button>
      </div>

      {/* Display selected client info */}
      {value && clients.find(c => c.id === value) && (
        <div className="text-sm text-gray-600 pl-3 border-l-2 border-gray-300">
          <div>
            <strong>{clients.find(c => c.id === value)?.name}</strong>
          </div>
          <div>{clients.find(c => c.id === value)?.email}</div>
          {clients.find(c => c.id === value)?.phone && (
            <div>{clients.find(c => c.id === value)?.phone}</div>
          )}
        </div>
      )}

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
}
