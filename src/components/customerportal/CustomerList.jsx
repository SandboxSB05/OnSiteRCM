import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FolderOpen, DollarSign, Mail, Search, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CustomerList({ customers, onSelectCustomer }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search customers..."
              className="pl-9 bg-gray-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => (
          <Card 
            key={customer.email || customer.name}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => onSelectCustomer(customer)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">{customer.name}</h3>
                {customer.email && <p className="text-sm text-gray-500 flex items-center gap-1 truncate"><Mail className="w-3 h-3" /> {customer.email}</p>}
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" /> {customer.projectCount} Projects
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> ${customer.totalValue.toLocaleString()}
                  </Badge>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 ml-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredCustomers.length === 0 && (
          <div className="text-center col-span-full py-10">
              <p className="text-gray-500">No customers found.</p>
          </div>
      )}
    </div>
  );
}