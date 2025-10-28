import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    let clientsQuery = supabase
      .from('clients')
      .select('id, full_name, email, phone, opt_in_email, opt_in_sms');

    // Apply audience filters
    if (campaign.target_audience === 'vip_only') {
      // Get VIP customers (those with rewards points > threshold)
      const { data: vipProfiles } = await supabase
        .from('profiles')
        .select('id')
        .gte('rewards_points', 500);
      
      if (vipProfiles && vipProfiles.length > 0) {
        const vipIds = vipProfiles.map(p => p.id);
        clientsQuery = clientsQuery.in('linked_profile_id', vipIds);
      }
    } else if (campaign.target_audience === 'recent_customers') {
      // Customers with appointments in last 90 days
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
      // Customers with no appointments in last 6 months
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

    console.log(`Found ${clients?.length || 0} potential recipients`);

    // Create recipient records and send notifications
    let sentCount = 0;
    let failedCount = 0;
    const recipients = clients || [];

    // Filter by opt-in preferences and channel
    const validRecipients = recipients.filter(client => {
      if (campaign.channel === 'email' || campaign.channel === 'both') {
        return client.opt_in_email && client.email;
      }
      if (campaign.channel === 'sms') {
        return client.opt_in_sms && client.phone;
      }
      return false;
    });

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
        const channels: ('email' | 'sms')[] = [];
        
        if ((campaign.channel === 'email' || campaign.channel === 'both') && client.opt_in_email && client.email) {
          channels.push('email');
        }
        if ((campaign.channel === 'sms' || campaign.channel === 'both') && client.opt_in_sms && client.phone) {
          channels.push('sms');
        }

        for (const channel of channels) {
          try {
            // Create recipient record
            await supabase
              .from('campaign_recipients')
              .insert({
                campaign_id: campaign_id,
                client_id: client.id,
                channel: channel,
                status: 'queued',
              });

            // Send notification via placeholder (actual sending would use Resend/Twilio)
            console.log(`Would send ${channel} to ${client.full_name}:`, {
              to: channel === 'email' ? client.email : client.phone,
              subject: campaign.subject,
              message: campaign.message_body,
              promo_code: campaign.promo_code,
            });

            // Mark as sent
            await supabase
              .from('campaign_recipients')
              .update({ 
                status: 'sent',
                sent_at: new Date().toISOString(),
              })
              .eq('campaign_id', campaign_id)
              .eq('client_id', client.id)
              .eq('channel', channel);

            sentCount++;
          } catch (error) {
            console.error(`Failed to send to ${client.full_name}:`, error);
            
            await supabase
              .from('campaign_recipients')
              .update({ 
                status: 'failed',
                error_message: error instanceof Error ? error.message : 'Unknown error',
              })
              .eq('campaign_id', campaign_id)
              .eq('client_id', client.id)
              .eq('channel', channel);

            failedCount++;
          }
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
