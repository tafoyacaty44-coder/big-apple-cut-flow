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
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTI0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMCAyNGMtMi4yMSAwLTQgMS43OS00IDRzMS43OSA0IDQgNCA0LTEuNzkgNC00LTEuNzktNC00LTR6bTAtMjRjLTIuMjEgMC00IDEuNzktNCA0czEuNzkgNCA0IDQgNC0xLjc5IDQtNC0xLjc5LTQtNC00eiIvPjwvZz48L2c+PC9zdmc+')]"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[hsl(var(--accent))] opacity-20 blur-2xl rounded-full"></div>
              <div className="relative bg-primary/50 backdrop-blur-sm rounded-full p-4 border-2 border-[hsl(var(--accent))]">
                <Logo size="lg" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-primary-foreground">Welcome Back</h1>
          <p className="text-primary-foreground/70">Sign in to your account</p>
        </div>

        <div className="bg-card/95 backdrop-blur-sm border-2 border-[hsl(var(--accent))]/30 rounded-lg p-8 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
          <LoginForm />

          <div className="mt-6 text-center space-y-2">
            <Link
              to="/reset-password"
              className="text-sm text-[hsl(var(--accent))] hover:underline block transition-colors"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[hsl(var(--accent))] hover:underline font-semibold transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-primary-foreground/70 hover:text-[hsl(var(--accent))] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
