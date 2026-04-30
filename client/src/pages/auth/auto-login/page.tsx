import { autoLogin } from '@/api/endpoints/auth';
import { getCurrentUser } from '@/api/endpoints/users';
import { GlobalFallback } from '@/components/global-fallback';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';

function AutoLoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, clearAuth } = useAuthStore();

  const token = searchParams.get('token');
  const returnTo = searchParams.get('return_to') || '/account';

  useEffect(() => {
    if (!token) {
      toast.error('Missing login token');
      navigate('/auth/login', { replace: true });
      return;
    }

    (async () => {
      try {
        const data = await autoLogin(token);
        if (!data.token) return;

        localStorage.setItem('session_token', data.token);

        const currentUser = await getCurrentUser();
        setUser(currentUser);
        navigate(returnTo, { replace: true });
      } catch {
        toast.error('Invalid or expired login link');
        navigate('/auth/login', { replace: true });
        clearAuth();
      }
    })();
  }, [token, returnTo, navigate, setUser]);

  return <GlobalFallback />;
}

export const Component = AutoLoginPage;
