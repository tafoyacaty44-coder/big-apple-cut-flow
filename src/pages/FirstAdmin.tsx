import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { promoteToAdmin } from '@/lib/api/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const FirstAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isPromoting, setIsPromoting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handlePromote = async () => {
    if (!user?.email) return;

    setIsPromoting(true);
    try {
      await promoteToAdmin(user.email);
      toast.success('Success! You are now an admin.');
      setTimeout(() => {
        navigate('/staff-login');
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to promote to admin';
      
      if (errorMessage.includes('admin already exists') || errorMessage.includes('Admin user already exists')) {
        toast.error('An admin already exists. Ask any admin to grant you access, or use Staff Login if you already have access.');
      } else {
        toast.error(errorMessage);
      }
      setIsPromoting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create First Admin</CardTitle>
          <CardDescription>
            Promote yourself to admin. This only works if no admin exists yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Your Email</p>
            <p className="text-base font-medium">{user.email}</p>
          </div>
          <GoldButton
            onClick={handlePromote}
            disabled={isPromoting}
            className="w-full"
          >
            {isPromoting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Promoting...
              </>
            ) : (
              'Make Me Admin'
            )}
          </GoldButton>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirstAdmin;
