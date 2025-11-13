import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendRequest {
  appointment_id: string;
  channel: 'email' | 'sms';
  template: string;
}

async function sendClickSendSMS(to: string, body: string, from: string, username: string, apiKey: string) {
  const url = 'https://rest.clicksend.com/v3/sms/send';
  
  // Basic Auth: username:apiKey encoded in base64
  const auth = btoa(`${username}:${apiKey}`);
  
  const payload = {
    messages: [
      {
        source: "big-apple-barbers",
        from: from, // Sender ID (alphanumeric or number)
        body: body,
        to: to.replace(/\D/g, ''), // ClickSend expects digits only
      }
    ]
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ClickSend API error: ${response.status} - ${error}`);
  }
  
  const result = await response.json();
  return result;
}

async function sendClickSendEmail(
  to: string, 
  subject: string, 
  htmlBody: string, 
  fromEmail: string,
  fromName: string,
  username: string, 
  apiKey: string
) {
  const url = 'https://rest.clicksend.com/v3/email/send';
  
  const auth = btoa(`${username}:${apiKey}`);
  
  const payload = {
    to: [{ email: to, name: to.split('@')[0] }],
    from: { email_address_id: fromEmail, name: fromName },
    subject: subject,
    body: htmlBody,
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ClickSend Email error: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

// Template rendering helpers
function renderTemplate(template: string, data: any): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
}

function getSmsTemplate(templateName: string): string {
  const templates = {
    confirmation: `Big Apple Barbers: Hi {{first_name}}! Your {{service_name}} with {{barber_name}} is booked for {{local_start}}.
Reschedule: {{reschedule_url}}
Cancel: {{cancel_url}}
Reply STOP to opt out.`,
    reminder_24h: `Reminder: {{service_name}} at {{local_start}}. See you soon at Big Apple Barbers.
Reschedule: {{reschedule_url}} | Cancel: {{cancel_url}}`,
    reminder_2h: `Reminder: {{service_name}} in 2 hours at {{local_start}}. See you soon!
Reschedule: {{reschedule_url}} | Cancel: {{cancel_url}}`,
    rescheduled: `Big Apple Barbers: Your appointment has been rescheduled to {{local_start}}. See you then!`,
    canceled: `Big Apple Barbers: Your {{service_name}} appointment has been canceled. Book again anytime!`,
  };
  return templates[templateName as keyof typeof templates] || '';
}

function getEmailHtml(templateName: string, data: any): string {
  const baseUrl = Deno.env.get('APP_BASE_URL') || 'http://localhost:8080';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Big Apple Barbers</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Big Apple Barbers</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px;">
          ${templateName.includes('confirmation') ? 'Appointment Confirmed!' : 
            templateName.includes('reminder') ? 'Appointment Reminder' :
            templateName.includes('rescheduled') ? 'Appointment Rescheduled' :
            'Appointment Canceled'}
        </h2>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin: 24px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0;"><strong>Service:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${data.service_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Barber:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${data.barber_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Date & Time:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${data.local_start}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Price:</strong></td>
              <td style="padding: 8px 0; text-align: right;">$${data.price}</td>
            </tr>
          </table>
        </div>
        
        ${!templateName.includes('canceled') ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
          <tr>
            <td style="padding: 8px;">
              <a href="${data.reschedule_url}" style="display: block; padding: 12px 24px; background-color: #0ea5e9; color: #ffffff; text-decoration: none; border-radius: 6px; text-align: center;">Reschedule</a>
            </td>
            <td style="padding: 8px;">
              <a href="${data.cancel_url}" style="display: block; padding: 12px 24px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 6px; text-align: center;">Cancel</a>
            </td>
          </tr>
        </table>
        ` : ''}
        
        <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px; text-align: center;">
          <a href="${baseUrl}/notifications/manage" style="color: #0ea5e9; text-decoration: none;">Manage notification preferences</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0;">
        Big Apple Barbers<br>
        Premium barbershop services
      </td>
    </tr>
  </table>
</body>
</html>`;
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

    // Initialize ClickSend credentials
    const clicksendUsername = Deno.env.get('CLICKSEND_USERNAME')!;
    const clicksendApiKey = Deno.env.get('CLICKSEND_API_KEY')!;
    const clicksendSenderId = Deno.env.get('CLICKSEND_SENDER_ID') || 'BigApple';
    const clicksendFromEmail = Deno.env.get('CLICKSEND_FROM_EMAIL') || '';
    
    console.log('ClickSend configured - Sender ID:', clicksendSenderId);

    const { appointment_id, channel, template }: SendRequest = await req.json();
    
    console.log('Sending notification:', { appointment_id, channel, template });

    // Get appointment with all related data
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        *,
        clients (
          full_name,
          email,
          phone,
          opt_in_email,
          opt_in_sms
        ),
        barbers (
          full_name
        ),
        services (
          name
        )
      `)
      .eq('id', appointment_id)
      .single();

    if (fetchError || !appointment) {
      throw new Error('Appointment not found');
    }

    const client = appointment.clients as any;
    const barber = appointment.barbers as any;
    const service = appointment.services as any;

    // Generate action tokens
    const tokenResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/issue-action-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ appointment_id, action: 'reschedule' }),
    });
    const rescheduleData = await tokenResponse.json();

    const cancelResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/issue-action-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ appointment_id, action: 'cancel' }),
    });
    const cancelData = await cancelResponse.json();

    // Format date/time for local display (EST)
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}Z`);
    const localStart = appointmentDate.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const templateData = {
      first_name: client.full_name.split(' ')[0],
      service_name: service.name,
      barber_name: barber.full_name,
      local_start: localStart,
      price: appointment.payment_amount ? (appointment.payment_amount / 100).toFixed(2) : '0.00',
      reschedule_url: rescheduleData.action_url || '#',
      cancel_url: cancelData.action_url || '#',
    };

    let providerMessageId = null;
    let error = null;
    let notificationSent = false;

    try {
      // Send SMS via ClickSend
      if (channel === 'sms' && client.opt_in_sms && client.phone) {
        const smsText = renderTemplate(getSmsTemplate(template), templateData);
        
        console.log('Sending SMS to:', client.phone);
        
        const smsResult = await sendClickSendSMS(
          client.phone,
          smsText,
          clicksendSenderId,
          clicksendUsername,
          clicksendApiKey
        );
        
        console.log('ClickSend SMS result:', smsResult);
        providerMessageId = smsResult.data?.messages?.[0]?.message_id || null;
        notificationSent = true;
      }
      
      // Send email via ClickSend
      if (channel === 'email' && client.opt_in_email && client.email) {
        console.log('Sending email to:', client.email);
        
        const emailHtml = getEmailHtml(template, templateData);
        const subject = `Big Apple Barbers - ${template.includes('confirmation') ? 'Appointment Confirmed' : 
                         template.includes('reminder') ? 'Appointment Reminder' : 'Appointment Update'}`;
        
        const emailResult = await sendClickSendEmail(
          client.email,
          subject,
          emailHtml,
          clicksendFromEmail,
          'Big Apple Barbers',
          clicksendUsername,
          clicksendApiKey
        );
        
        console.log('ClickSend Email result:', emailResult);
        providerMessageId = emailResult.data?.message_id || null;
        notificationSent = true;
      }

      if (!notificationSent) {
        console.log('No notification sent - client not opted in or missing contact info');
      }
    } catch (sendError) {
      error = sendError instanceof Error ? sendError.message : 'Send failed';
      console.error('Send error:', error);
    }

    // Log notification attempt
    await supabase.from('notifications').insert({
      appointment_id,
      channel,
      template,
      provider_message_id: providerMessageId,
      sent_at: notificationSent ? new Date().toISOString() : null,
      error,
    });

    return new Response(
      JSON.stringify({ 
        success: notificationSent,
        message: notificationSent ? 'Notification sent' : 'Notification not sent',
        error 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: notificationSent ? 200 : 400,
      }
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
