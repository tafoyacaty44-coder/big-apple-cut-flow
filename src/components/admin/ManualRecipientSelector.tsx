import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Client {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
}

interface ManualRecipientSelectorProps {
  selectedClientIds: string[];
  onClientIdsChange: (ids: string[]) => void;
  manualPhoneNumbers: string[];
  onManualPhoneNumbersChange: (numbers: string[]) => void;
}

export function ManualRecipientSelector({
  selectedClientIds,
  onClientIdsChange,
  manualPhoneNumbers,
  onManualPhoneNumbersChange,
}: ManualRecipientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Fetch all clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients-for-campaign'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name, email, phone')
        .order('full_name');

      if (error) throw error;
      return data as Client[];
    },
  });

  // Filter clients based on search
  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.full_name.toLowerCase().includes(query) ||
      (client.email && client.email.toLowerCase().includes(query)) ||
      (client.phone && client.phone.includes(query))
    );
  });

  // Handle client selection toggle
  const toggleClient = (clientId: string) => {
    if (selectedClientIds.includes(clientId)) {
      onClientIdsChange(selectedClientIds.filter((id) => id !== clientId));
    } else {
      onClientIdsChange([...selectedClientIds, clientId]);
    }
  };

  // Handle manual phone numbers input (debounced)
  const handlePhoneInputChange = (value: string) => {
    setPhoneInput(value);
  };

  // Debounce phone number parsing to prevent infinite re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      // Parse phone numbers (comma or newline separated)
      const numbers = phoneInput
        .split(/[,\n]/)
        .map((num) => num.trim())
        .filter((num) => num.length > 0);
      
      // Only update if different from current
      if (JSON.stringify(numbers) !== JSON.stringify(manualPhoneNumbers)) {
        onManualPhoneNumbersChange(numbers);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneInput, manualPhoneNumbers]);
  // onManualPhoneNumbersChange is a stable setState function and doesn't need to be in deps

  const totalSelectedCount = selectedClientIds.length + manualPhoneNumbers.length;

  return (
    <div className="space-y-6">
      {/* Search and select from existing clients */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Select Existing Customers
        </Label>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[300px] rounded-md border p-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading customers...</p>
          ) : filteredClients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No customers found matching your search.' : 'No customers available.'}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-start gap-3 p-2 hover:bg-accent/50 rounded-md cursor-pointer"
                  onClick={() => toggleClient(client.id)}
                >
                  <Checkbox
                    checked={selectedClientIds.includes(client.id)}
                    onCheckedChange={() => toggleClient(client.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{client.full_name}</p>
                    {client.email && (
                      <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                    )}
                    {client.phone && (
                      <p className="text-xs text-muted-foreground">{client.phone}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Manual phone number entry */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Add Phone Numbers Manually
        </Label>
        <Textarea
          placeholder="Enter phone numbers (one per line or comma-separated)&#10;Example:&#10;212-555-0100&#10;212-555-0101, 212-555-0102"
          value={phoneInput}
          onChange={(e) => handlePhoneInputChange(e.target.value)}
          rows={5}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Enter phone numbers separated by commas or new lines
        </p>
      </div>

      {/* Selection summary */}
      <div className="flex items-center gap-2 p-3 bg-accent/20 rounded-md">
        <Badge variant="secondary" className="text-sm">
          {totalSelectedCount} recipient{totalSelectedCount !== 1 ? 's' : ''} selected
        </Badge>
        {selectedClientIds.length > 0 && (
          <span className="text-xs text-muted-foreground">
            ({selectedClientIds.length} customer{selectedClientIds.length !== 1 ? 's' : ''})
          </span>
        )}
        {manualPhoneNumbers.length > 0 && (
          <span className="text-xs text-muted-foreground">
            ({manualPhoneNumbers.length} manual number{manualPhoneNumbers.length !== 1 ? 's' : ''})
          </span>
        )}
      </div>
    </div>
  );
}
