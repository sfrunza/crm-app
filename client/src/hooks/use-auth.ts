import { login, logout, type LoginResponse } from '@/api/endpoints/auth';
import { getCurrentUser } from '@/api/endpoints/users';
import { extractError } from '@/lib/axios';
import { getPortalForRole } from '@/lib/role-guards';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth-store';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';

function safeReturnPath(returnTo: string | null): string | null {
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return null;
  }
  return returnTo;
}

export function useAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnToParam = safeReturnPath(searchParams.get('return_to'));
  const { user, clearAuth } = useAuthStore();

  const { mutate: loginMutation, isPending: isPendingLogin } = useMutation<
    LoginResponse,
    Error,
    { email_address: string; password: string }
  >({
    mutationFn: ({ email_address, password }) => login(email_address, password),
    onSuccess: async (data) => {
      if (!data.token) return;

      localStorage.setItem('session_token', data.token);

      try {
        const currentUser = await getCurrentUser();
        useAuthStore.getState().setUser(currentUser);

        const portal = getPortalForRole(currentUser.role);
        const destination = returnToParam ?? portal;
        navigate(destination, { replace: true });
      } catch (err) {
        localStorage.removeItem('session_token');
        clearAuth();
        toast.error(extractError(err));
      }
    },
    onError: (err) => {
      toast.error(extractError(err));
    },
  });

  const { mutate: logoutMutation, isPending: isPendingLogout } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      localStorage.removeItem('session_token');
      queryClient.clear();
      navigate('/auth/login', { replace: true });
    },
  });

  return {
    user,
    login: loginMutation,
    isPendingLogin,
    logout: logoutMutation,
    isPendingLogout
  };
}; 