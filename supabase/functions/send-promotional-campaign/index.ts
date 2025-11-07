import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import twilio from 'https://esm.sh/twilio@5.3.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendCampaignRequest {
  campaign_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize Twilio
    const twilioClient = twilio(
      Deno.env.get('TWILIO_ACCOUNT_SID'),
      Deno.env.get('TWILIO_AUTH_TOKEN')
    );
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');
    
    console.log('Twilio configured:', !!twilioClient, 'Phone:', twilioPhone);

    const { campaign_id }: SendCampaignRequest = await req.json();
    
    console.log('Starting campaign send:', campaign_id);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('promotional_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new Error('Campaign has already been sent or is in progress');
    }

    // Update status to sending
    await supabase
      .from('promotional_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaign_id);

    // Get target clients based on audience filter
    let recipients: any[] = [];

    // Handle custom recipients
    if (campaign.target_audience === 'custom') {
      // Fetch specific clients by IDs
      if (campaign.custom_recipient_ids && Array.isArray(campaign.custom_recipient_ids) && campaign.custom_recipient_ids.length > 0) {
        const { data: customClients, error: customClientsError } = await supabase
          .from('clients')
          .select('id, full_name, email, phone, opt_in_email, opt_in_sms')
          .in('id', campaign.custom_recipient_ids);

        if (customClientsError) {
          console.error('Error fetching custom clients:', customClientsError);
        } else {
          recipients = customClients || [];
        }
      }

      // Add manually entered phone numbers as temporary client records
      if (campaign.custom_phone_numbers && Array.isArray(campaign.custom_phone_numbers) && campaign.custom_phone_numbers.length > 0) {
        const manualClients = campaign.custom_phone_numbers.map((phone: string) => ({
          id: `manual-${phone}`,
          full_name: phone,
          email: null,
          phone: phone,
          opt_in_email: false,
          opt_in_sms: true
        }));
        recipients = [...recipients, ...manualClients];
      }
    } else {
      // Original audience-based logic
      let clientsQuery = supabase
        .from('clients')
        .select('id, full_name, email, phone, opt_in_email, opt_in_sms');

      // Apply audience filters
      if (campaign.target_audience === 'vip_only') {
        const { data: vipProfiles } = await supabase
          .from('profiles')
          .select('id')
          .gte('rewards_points', 500);
        
        if (vipProfiles && vipProfiles.length > 0) {
          const vipIds = vipProfiles.map(p => p.id);
          clientsQuery = clientsQuery.in('linked_profile_id', vipIds);
        }
      } else if (campaign.target_audience === 'recent_customers') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        const { data: recentAppointments } = await supabase
          .from('appointments')
          .select('client_id')
          .gte('appointment_date', ninetyDaysAgo.toISOString().split('T')[0])
          .not('client_id', 'is', null);
        
        if (recentAppointments && recentAppointments.length > 0) {
          const clientIds = [...new Set(recentAppointments.map(a => a.client_id))];
          clientsQuery = clientsQuery.in('id', clientIds);
        }
      } else if (campaign.target_audience === 'inactive_customers') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const { data: recentAppointments } = await supabase
          .from('appointments')
          .select('client_id')
          .gte('appointment_date', sixMonthsAgo.toISOString().split('T')[0])
          .not('client_id', 'is', null);
        
        const recentClientIds = recentAppointments?.map(a => a.client_id) || [];
        
        if (recentClientIds.length > 0) {
          clientsQuery = clientsQuery.not('id', 'in', `(${recentClientIds.join(',')})`);
        }
      }

      const { data: clients, error: clientsError } = await clientsQuery;

      if (clientsError) {
        throw clientsError;
      }

      recipients = clients || [];
    }

    console.log(`Found ${recipients.length} potential recipients`);

    let sentCount = 0;
    let failedCount = 0;

    // Filter by opt-in preferences and channel (SMS only for now)
    const validRecipients = recipients.filter(client => {
      if (campaign.channel === 'sms') {
        return client.opt_in_sms && client.phone;
      }
      return false;
    });
    
    console.log(`Filtered to ${validRecipients.length} valid SMS recipients`);

    // Update total recipients count
    await supabase
      .from('promotional_campaigns')
      .update({ total_recipients: validRecipients.length })
      .eq('id', campaign_id);

    // Process in batches of 50 to avoid timeouts
    const batchSize = 50;
    for (let i = 0; i < validRecipients.length; i += batchSize) {
      const batch = validRecipients.slice(i, i + batchSize);
      
      for (const client of batch) {
        // Only process SMS channel
        if (campaign.channel !== 'sms' || !client.opt_in_sms || !client.phone) {
          continue;
        }

        try {
          console.log(`Processing SMS for ${client.full_name} at ${client.phone}`);
          
          // Create recipient record
          await supabase
            .from('campaign_recipients')
            .insert({
              campaign_id: campaign_id,
              client_id: client.id,
              channel: 'sms',
              status: 'queued',
            });

          // Send SMS via Twilio
          let smsBody = campaign.message_body;
          if (campaign.promo_code) {
            smsBody += `\n\nPromo Code: ${campaign.promo_code}`;
          }
          
          // Truncate if too long (SMS limit is 1600 chars)
          if (smsBody.length > 1600) {
            smsBody = smsBody.substring(0, 1597) + '...';
          }

          // Normalize phone to E.164 format for Twilio
          const normalizedPhone = client.phone!.replace(/\D/g, '');
          const e164Phone = normalizedPhone.length === 10 
            ? `+1${normalizedPhone}` 
            : normalizedPhone.startsWith('1') 
              ? `+${normalizedPhone}` 
              : `+1${normalizedPhone}`;

          const message = await twilioClient.messages.create({
            body: smsBody,
            to: e164Phone,
            from: twilioPhone,
          });

          console.log(`✓ SMS sent to ${client.full_name} at ${client.phone}, SID: ${message.sid}`);

          // Mark as sent
          await supabase
            .from('campaign_recipients')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('campaign_id', campaign_id)
            .eq('client_id', client.id)
            .eq('channel', 'sms');

          sentCount++;
        } catch (error) {
          console.error(`✗ Failed to send SMS to ${client.full_name}:`, error);
          
          await supabase
            .from('campaign_recipients')
            .update({ 
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('campaign_id', campaign_id)
            .eq('client_id', client.id)
            .eq('channel', 'sms');

          failedCount++;
        }
      }

      // Update progress
      await supabase
        .from('promotional_campaigns')
        .update({ 
          sent_count: sentCount,
          failed_count: failedCount,
        })
        .eq('id', campaign_id);
    }

    // Mark campaign as sent
    await supabase
      .from('promotional_campaigns')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_count: sentCount,
        failed_count: failedCount,
      })
      .eq('id', campaign_id);

    console.log(`Campaign sent: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        sent_count: sentCount,
        failed_count: failedCount,
        total_recipients: validRecipients.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
