import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Bell, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationPreferences() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    opt_in_email: true,
    opt_in_sms: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    
    if (user) {
      loadPreferences();
    }
  }, [user, authLoading, navigate]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      
      // Get the client record linked to this profile
      const { data: client, error } = await supabase
        .from("clients")
        .select("opt_in_email, opt_in_sms")
        .eq("linked_profile_id", user?.id)
        .single();

      if (error) throw error;

      if (client) {
        setPreferences({
          opt_in_email: client.opt_in_email ?? true,
          opt_in_sms: client.opt_in_sms ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast.error("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("clients")
        .update({
          opt_in_email: preferences.opt_in_email,
          opt_in_sms: preferences.opt_in_sms,
        })
        .eq("linked_profile_id", user?.id);

      if (error) throw error;

      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Manage how you receive appointment reminders and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive confirmations and reminders via email
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.opt_in_email}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, opt_in_email: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label htmlFor="sms-notifications" className="text-base font-medium">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive text message reminders (Reply STOP to unsubscribe)
                  </p>
                </div>
              </div>
              <Switch
                id="sms-notifications"
                checked={preferences.opt_in_sms}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, opt_in_sms: checked })
                }
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={savePreferences}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
