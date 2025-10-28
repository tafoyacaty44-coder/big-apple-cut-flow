import { supabase } from "@/integrations/supabase/client";

export interface Client {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  barber_id: string | null;
  note: string | null;
  photo_url: string | null;
  created_at: string;
}

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getClientById = async (id: string): Promise<Client | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const getClientNotes = async (clientId: string): Promise<ClientNote[]> => {
  const { data, error } = await supabase
    .from('client_notes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createClientNote = async (
  clientId: string,
  barberId: string | null,
  note: string,
  photoUrl?: string
): Promise<ClientNote> => {
  const { data, error } = await supabase
    .from('client_notes')
    .insert({
      client_id: clientId,
      barber_id: barberId,
      note,
      photo_url: photoUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const uploadClientPhoto = async (
  file: File,
  clientId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${clientId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('client-photos')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('client-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
