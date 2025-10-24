import { LoginForm } from '@/components/auth/LoginForm';
import Logo from '@/components/Logo';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="xl" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="bg-card border-2 border-border rounded-lg p-8 shadow-lg">
          <LoginForm />

          <div className="mt-6 text-center space-y-2">
            <Link
              to="/reset-password"
              className="text-sm text-[hsl(var(--accent))] hover:underline block"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[hsl(var(--accent))] hover:underline font-semibold">
                Sign up
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

export default Login;
