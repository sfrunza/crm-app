import { autoLogin } from '@/api/endpoints/auth';
import { GlobalFallback } from '@/components/global-fallback';
import { AuthLayout } from '@/pages/auth/layout';
import { useAuthStore } from '@/stores/auth-store';
import { authLoader } from '@/lib/auth';
import { Navigate, redirect, type LoaderFunctionArgs } from 'react-router';
import { getCurrentUser } from '@/api/endpoints/users';

export const authRoutes = [
  {
    path: 'auth',
    loader: authLoader,
    element: <AuthLayout />,
    hydrateFallbackElement: <GlobalFallback />,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" />,
      },
      {
        path: 'login',
        lazy: () => import('@/pages/auth/login/page.tsx'),
      },
      {
        path: 'forgot-password',
        lazy: () => import('@/pages/auth/forgot-password/page.tsx'),
      },
      {
        path: 'reset-password',
        lazy: () => import('@/pages/auth/reset-password/page.tsx'),
      },
    ],
  },
  {
    path: '/auth/auto-login',
    hydrateFallbackElement: <GlobalFallback />,
    loader: async ({ params, request }: LoaderFunctionArgs) => {
      console.log('params', params);
      console.log('request', request);
      const url = new URL(request.url);
      const searchParams = url.searchParams;
      const token = searchParams.get('token');
      const returnTo = searchParams.get('return_to') ?? '/';

      console.log('token', token);
      console.log('searchParams', searchParams);
      console.log('returnTo', returnTo);
      if (!token) {
        return redirect('/auth/login');
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        const data = await autoLogin(token);
        if (!data.token) return redirect('/auth/login');
        localStorage.setItem('session_token', data.token);
        const currentUser = await getCurrentUser();
        useAuthStore.getState().setUser(currentUser);
        return redirect(returnTo);
      } catch (error) {
        return redirect('/auth/login');
      } finally {
        useAuthStore.getState().clearAuth();
      }
    },
  },
];
