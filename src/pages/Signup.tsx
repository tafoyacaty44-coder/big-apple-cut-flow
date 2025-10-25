import { SignupForm } from '@/components/auth/SignupForm';
import Logo from '@/components/Logo';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const Signup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join Big Apple Barbers today</p>
        </div>

        <div className="bg-card border-2 border-border rounded-lg p-8 shadow-lg">
          <SignupForm />

          <div className="mt-6 text-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-[hsl(var(--accent))] hover:underline font-semibold">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-[hsl(var(--accent))]">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
