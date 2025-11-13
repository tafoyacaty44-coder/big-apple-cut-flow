import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, Mail, MessageSquare, Users, Gift, Send, Save } from "lucide-react";
import { getCampaign, createCampaign, updateCampaign, sendCampaign, generatePromoCode, getRecipientCount } from "@/lib/api/promotions";
import { useAuth } from "@/hooks/useAuth";
import { ManualRecipientSelector } from "./ManualRecipientSelector";

const campaignSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(['promotional', 'announcement', 'seasonal', 'loyalty']),
  channel: z.enum(['email', 'sms', 'both']),
  subject: z.string().optional(),
  message_body: z.string().min(1, "Message is required"),
  email_html: z.string().optional(),
  target_audience: z.enum(['all_customers', 'vip_only', 'recent_customers', 'inactive_customers', 'custom']),
  promo_code: z.string().optional(),
  promo_discount: z.number().optional(),
  promo_expires_at: z.string().optional(),
  scheduled_for: z.string().optional(),
  custom_recipient_ids: z.array(z.string()).optional(),
  custom_phone_numbers: z.array(z.string()).optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId?: string;
}

export function PromotionalCampaignForm({ open, onOpenChange, campaignId }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [enablePromo, setEnablePromo] = useState(false);
  const [scheduleLater, setScheduleLater] = useState(false);
  const [estimatedRecipients, setEstimatedRecipients] = useState(0);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [manualPhoneNumbers, setManualPhoneNumbers] = useState<string[]>([]);

  const { data: existingCampaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignId ? getCampaign(campaignId) : null,
    enabled: !!campaignId,
  });

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      type: "promotional",
      channel: "email",
      message_body: "",
      target_audience: "all_customers",
    },
  });

  useEffect(() => {
    if (existingCampaign) {
      form.reset({
        title: existingCampaign.title,
        type: existingCampaign.type,
        channel: existingCampaign.channel,
        subject: existingCampaign.subject || "",
        message_body: existingCampaign.message_body,
        email_html: existingCampaign.email_html || "",
        target_audience: existingCampaign.target_audience,
        promo_code: existingCampaign.promo_code || "",
        promo_discount: existingCampaign.promo_discount || 0,
        promo_expires_at: existingCampaign.promo_expires_at || "",
        scheduled_for: existingCampaign.scheduled_for || "",
        custom_recipient_ids: existingCampaign.custom_recipient_ids || [],
        custom_phone_numbers: existingCampaign.custom_phone_numbers || [],
      });
      setEnablePromo(!!existingCampaign.promo_code);
      setScheduleLater(!!existingCampaign.scheduled_for);
      setSelectedClientIds(existingCampaign.custom_recipient_ids || []);
      setManualPhoneNumbers(existingCampaign.custom_phone_numbers || []);
    }
  }, [existingCampaign, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const payload = {
        title: data.title,
        type: data.type,
        channel: data.channel,
        subject: data.subject,
        message_body: data.message_body,
        email_html: data.email_html,
        target_audience: data.target_audience,
        custom_recipient_ids: data.custom_recipient_ids || [],
        custom_phone_numbers: data.custom_phone_numbers || [],
        promo_code: data.promo_code,
        promo_discount: data.promo_discount,
        promo_expires_at: data.promo_expires_at,
        scheduled_for: data.scheduled_for,
        created_by: user!.id,
        status: 'draft' as const,
      };

      if (campaignId) {
        return updateCampaign(campaignId, payload);
      } else {
        return createCampaign(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-campaigns'] });
      toast.success(campaignId ? "Campaign updated" : "Campaign created");
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save campaign");
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      let id = campaignId;
      
      if (!id) {
        const payload = {
          title: data.title,
          type: data.type,
          channel: data.channel,
          subject: data.subject,
          message_body: data.message_body,
          email_html: data.email_html,
          target_audience: data.target_audience,
          custom_recipient_ids: data.custom_recipient_ids || [],
          custom_phone_numbers: data.custom_phone_numbers || [],
          promo_code: data.promo_code,
          promo_discount: data.promo_discount,
          promo_expires_at: data.promo_expires_at,
          scheduled_for: data.scheduled_for,
          created_by: user!.id,
          status: 'draft' as const,
        };
        const newCampaign = await createCampaign(payload);
        id = newCampaign.id;
      } else {
        // Update existing campaign with current form data before sending
        await updateCampaign(id, {
          title: data.title,
          type: data.type,
          channel: data.channel,
          subject: data.subject,
          message_body: data.message_body,
          email_html: data.email_html,
          target_audience: data.target_audience,
          custom_recipient_ids: data.custom_recipient_ids || [],
          custom_phone_numbers: data.custom_phone_numbers || [],
          promo_code: data.promo_code,
          promo_discount: data.promo_discount,
          promo_expires_at: data.promo_expires_at,
        });
      }

      if (scheduleLater && data.scheduled_for) {
        await updateCampaign(id, { status: 'scheduled', scheduled_for: data.scheduled_for });
        return { scheduled: true };
      } else {
        return sendCampaign(id);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['promotional-campaigns'] });
      if (result.scheduled) {
        toast.success("Campaign scheduled successfully");
      } else {
        toast.success("Campaign sent successfully");
      }
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to send campaign");
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    sendMutation.mutate(data);
  };

  const handleSaveDraft = () => {
    saveMutation.mutate(form.getValues());
  };

  const handleGeneratePromo = () => {
    const code = generatePromoCode();
    form.setValue('promo_code', code);
  };

  const watchTargetAudience = form.watch('target_audience');

  useEffect(() => {
    if (watchTargetAudience === 'custom') {
      setEstimatedRecipients(selectedClientIds.length + manualPhoneNumbers.length);
    } else {
      getRecipientCount(watchTargetAudience).then(count => {
        setEstimatedRecipients(count);
      });
    }
  }, [watchTargetAudience, selectedClientIds, manualPhoneNumbers]);

  // Update form when manual recipients change
  useEffect(() => {
    if (watchTargetAudience === 'custom') {
      const currentRecipientIds = form.getValues('custom_recipient_ids') || [];
      const currentPhoneNumbers = form.getValues('custom_phone_numbers') || [];
      
      // Only update if values actually changed
      if (JSON.stringify(currentRecipientIds) !== JSON.stringify(selectedClientIds)) {
        form.setValue('custom_recipient_ids', selectedClientIds, { shouldDirty: false });
      }
      if (JSON.stringify(currentPhoneNumbers) !== JSON.stringify(manualPhoneNumbers)) {
        form.setValue('custom_phone_numbers', manualPhoneNumbers, { shouldDirty: false });
      }
    }
  }, [selectedClientIds, manualPhoneNumbers, watchTargetAudience, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaignId ? "Edit Campaign" : "Create New Campaign"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={`step-${currentStep}`} onValueChange={(v) => setCurrentStep(parseInt(v.split('-')[1]))}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="step-1">Details</TabsTrigger>
              <TabsTrigger value="step-2">Message</TabsTrigger>
              <TabsTrigger value="step-3">Audience</TabsTrigger>
              <TabsTrigger value="step-4">Send</TabsTrigger>
            </TabsList>

            <TabsContent value="step-1" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title</Label>
                <Input 
                  id="title" 
                  {...form.register('title')} 
                  placeholder="e.g., Summer Special 2025"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select onValueChange={(value) => form.setValue('type', value as any)} defaultValue={form.watch('type')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                      <SelectItem value="loyalty">Loyalty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel">Channel</Label>
                  <Select onValueChange={(value) => form.setValue('channel', value as any)} defaultValue={form.watch('channel')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="sms">SMS Only</SelectItem>
                      <SelectItem value="both">Email & SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="step-2" className="space-y-4">
              {(form.watch('channel') === 'email' || form.watch('channel') === 'both') && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input 
                    id="subject" 
                    {...form.register('subject')} 
                    placeholder="e.g., Get 20% Off This Weekend!"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="message_body">Message</Label>
                <Textarea 
                  id="message_body" 
                  {...form.register('message_body')} 
                  placeholder="Your promotional message..."
                  rows={8}
                />
                {form.formState.errors.message_body && (
                  <p className="text-sm text-destructive">{form.formState.errors.message_body.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Use variables: {'{{customer_name}}'}, {'{{promo_code}}'}, {'{{shop_name}}'}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Promo Code</CardTitle>
                      <CardDescription>Add a discount code to track usage</CardDescription>
                    </div>
                    <Switch checked={enablePromo} onCheckedChange={setEnablePromo} />
                  </div>
                </CardHeader>
                {enablePromo && (
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        {...form.register('promo_code')} 
                        placeholder="PROMO CODE"
                      />
                      <Button type="button" onClick={handleGeneratePromo} variant="outline">
                        Generate
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Discount %</Label>
                        <Input 
                          type="number" 
                          {...form.register('promo_discount', { valueAsNumber: true })} 
                          placeholder="20"
                        />
                      </div>
                      <div>
                        <Label>Expires</Label>
                        <Input 
                          type="datetime-local" 
                          {...form.register('promo_expires_at')} 
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="step-3" className="space-y-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select onValueChange={(value) => form.setValue('target_audience', value as any)} defaultValue={form.watch('target_audience')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_customers">All Customers</SelectItem>
                    <SelectItem value="vip_only">VIP Members Only</SelectItem>
                    <SelectItem value="recent_customers">Recent Customers (90 days)</SelectItem>
                    <SelectItem value="inactive_customers">Inactive Customers (6+ months)</SelectItem>
                    <SelectItem value="custom">Custom Selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.watch('target_audience') === 'custom' && (
                <Card className="border-accent/20">
                  <CardHeader>
                    <CardTitle className="text-sm">Select Recipients</CardTitle>
                    <CardDescription>
                      Choose specific customers or manually enter phone numbers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ManualRecipientSelector
                      selectedClientIds={selectedClientIds}
                      onClientIdsChange={setSelectedClientIds}
                      manualPhoneNumbers={manualPhoneNumbers}
                      onManualPhoneNumbersChange={setManualPhoneNumbers}
                    />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Estimated Recipients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{estimatedRecipients.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {form.watch('target_audience') === 'custom' 
                      ? 'recipients selected'
                      : 'customers will receive this campaign'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="step-4" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Schedule for Later</CardTitle>
                      <CardDescription>Or send immediately</CardDescription>
                    </div>
                    <Switch checked={scheduleLater} onCheckedChange={setScheduleLater} />
                  </div>
                </CardHeader>
                {scheduleLater && (
                  <CardContent>
                    <Input 
                      type="datetime-local" 
                      {...form.register('scheduled_for')} 
                    />
                  </CardContent>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Campaign Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipients:</span>
                    <span className="font-semibold">{estimatedRecipients.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Channel:</span>
                    <span className="font-semibold capitalize">{form.watch('channel')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-semibold capitalize">{form.watch('type')}</span>
                  </div>
                  {enablePromo && form.watch('promo_code') && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Promo Code:</span>
                      <span className="font-semibold">{form.watch('promo_code')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              )}
              {currentStep < 4 && (
                <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
                  Next
                </Button>
              )}
              {currentStep === 4 && (
                <Button type="submit">
                  <Send className="mr-2 h-4 w-4" />
                  {scheduleLater ? "Schedule Campaign" : "Send Now"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
