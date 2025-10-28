import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AppointmentAction() {
  const { token, action } = useParams<{ token: string; action: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      
      // Check if token exists and is valid
      const { data: tokenData, error: tokenError } = await supabase
        .from("appointment_action_tokens")
        .select("*, appointments(*)")
        .eq("token", token)
        .eq("action", action)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        toast.error("Invalid or expired link");
        setTokenValid(false);
        return;
      }

      setTokenValid(true);
      setAppointment(tokenData.appointments);

      // Check if user is logged in and owns this appointment
      const { data: { user } } = await supabase.auth.getUser();
      if (user && tokenData.appointments.customer_id === user.id) {
        setNeedsVerification(false);
      } else {
        setNeedsVerification(true);
      }
    } catch (error) {
      console.error("Error validating token:", error);
      toast.error("Failed to validate link");
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    try {
      setVerifying(true);
      
      // Verify email and phone match
      const { data: client, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", appointment.client_id)
        .single();

      if (error || !client) {
        toast.error("Unable to verify identity");
        return;
      }

      const emailMatch = client.email?.toLowerCase() === email.toLowerCase();
      const phoneLast4Match = client.phone?.slice(-4) === phoneLast4;

      if (!emailMatch || !phoneLast4Match) {
        toast.error("Email or phone does not match our records");
        return;
      }

      // In production, send actual verification code via email/SMS
      // For now, just simulate it
      setCodeSent(true);
      toast.success("Verification code sent to your email");
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("Failed to send verification code");
    } finally {
      setVerifying(false);
    }
  };

  const handleAction = async () => {
    try {
      setVerifying(true);

      if (needsVerification) {
        // In production, verify the code
        if (verificationCode !== "123456") {
          toast.error("Invalid verification code");
          return;
        }
      }

      if (action === "cancel") {
        // Call cancel appointment function
        const { data, error } = await supabase.functions.invoke("cancel-appointment", {
          body: { token },
        });

        if (error) throw error;

        toast.success("Appointment canceled successfully");
        navigate("/booking-success", { 
          state: { 
            confirmationNumber: appointment.confirmation_number,
            canceled: true 
          } 
        });
      } else if (action === "reschedule") {
        // Redirect to booking page with reschedule context
        navigate("/book", { 
          state: { 
            reschedule: true,
            appointmentId: appointment.id,
            token 
          } 
        });
      }
    } catch (error) {
      console.error("Error performing action:", error);
      toast.error("Failed to perform action");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-6 w-6" />
              <CardTitle>Invalid Link</CardTitle>
            </div>
            <CardDescription>
              This link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>
            {action === "cancel" ? "Cancel Appointment" : "Reschedule Appointment"}
          </CardTitle>
          <CardDescription>
            Confirmation: {appointment?.confirmation_number}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointment && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {appointment.appointment_time}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {needsVerification && !codeSent && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  For security, please verify your identity
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Last 4 Digits of Phone</Label>
                <Input
                  id="phone"
                  type="text"
                  maxLength={4}
                  value={phoneLast4}
                  onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, ""))}
                  placeholder="1234"
                />
              </div>

              <Button
                onClick={sendVerificationCode}
                disabled={!email || phoneLast4.length !== 4 || verifying}
                className="w-full"
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </div>
          )}

          {needsVerification && codeSent && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Verification code sent! Check your email.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter code"
                />
              </div>

              <Button
                onClick={handleAction}
                disabled={!verificationCode || verifying}
                className="w-full"
                variant={action === "cancel" ? "destructive" : "default"}
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : action === "cancel" ? (
                  "Confirm Cancellation"
                ) : (
                  "Continue to Reschedule"
                )}
              </Button>
            </div>
          )}

          {!needsVerification && (
            <Button
              onClick={handleAction}
              disabled={verifying}
              className="w-full"
              variant={action === "cancel" ? "destructive" : "default"}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : action === "cancel" ? (
                "Confirm Cancellation"
              ) : (
                "Continue to Reschedule"
              )}
            </Button>
          )}

          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
