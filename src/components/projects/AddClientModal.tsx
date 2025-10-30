import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (client: Client) => void;
}

export default function AddClientModal({ isOpen, onClose, onClientCreated }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [sendInvitation, setSendInvitation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '' });
    setSendInvitation(true);
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Check if email already exists
      const { data: existingUsers } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email);

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('A user with this email already exists');
      }

      // Step 1: Create auth user if sending invitation
      let authUserId: string | null = null;
      
      if (sendInvitation) {
        // Use Supabase Auth Admin API to invite user
        const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
          formData.email,
          {
            data: {
              name: formData.name,
              role: 'client',
            },
            redirectTo: `${window.location.origin}/login`,
          }
        );

        if (authError) {
          // Check if it's a permissions error (might not have admin access)
          if (authError.message.includes('admin') || authError.message.includes('permission')) {
            console.warn('Cannot send invitation - admin permissions required. Creating user record only.');
            setSuccess('Client created! Note: Email invitation requires admin setup.');
          } else {
            throw new Error(`Invitation error: ${authError.message}`);
          }
        } else {
          authUserId = authData?.user?.id || null;
          setSuccess('Client created and invitation email sent!');
        }
      }

      // Step 2: Create user record in users table
      const userId = authUserId || crypto.randomUUID();
      
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: formData.email,
          name: formData.name,
          phone: formData.phone || null,
          role: 'client',
        }])
        .select()
        .single();

      if (userError) {
        throw new Error(`Error creating client: ${userError.message}`);
      }

      if (!sendInvitation && !success) {
        setSuccess('Client created successfully!');
      }

      // Wait a moment to show success message
      setTimeout(() => {
        onClientCreated(newUser);
        handleClose();
      }, 1500);

    } catch (err: any) {
      console.error('Error creating client:', err);
      setError(err.message || 'Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Create a new client user. They can be invited to access the customer portal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <Mail className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="client-name">
                Client Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="client-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Smith"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="client-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-phone">Phone Number</Label>
              <Input
                id="client-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="send-invitation"
                checked={sendInvitation}
                onCheckedChange={(checked) => setSendInvitation(checked as boolean)}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="send-invitation"
                className="text-sm font-normal cursor-pointer"
              >
                Send invitation email (client can set their own password)
              </Label>
            </div>

            {!sendInvitation && (
              <Alert>
                <AlertDescription className="text-sm">
                  Client will be created but won't be able to log in until invited later.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating...' : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
