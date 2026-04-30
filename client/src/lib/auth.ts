import { useAuthStore } from '@/stores/auth-store';
import { redirect } from 'react-router';
import { queryClient } from './query-client';
import { getPortalForRole } from '@/lib/role-guards';
import { getSettings } from '@/api/endpoints/settings';
import { queryKeys } from './query-keys';
import { getCurrentUser } from '@/api/endpoints/users';

export interface AuthLoaderParams {
  request: Request;
  redirectTo?: string;
}

/**
 * Creates a redirect response to login page
 */
export const createLoginRedirect = (returnTo: string) => {
  return redirect(`/auth/login?return_to=${encodeURIComponent(returnTo)}`);
};

/**
 * Creates a redirect response to home page
 */
export const createHomeRedirect = () => {
  return redirect('/');
};

/**
 * Prefetches settings data for auth pages with error handling
 */
export const prefetchSettings = async (): Promise<void> => {
  try {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.settings.all,
      queryFn: getSettings,
      staleTime: Infinity,
    });

    // await queryClient.prefetchQuery({
    //   queryKey: ['trucks'],
    //   queryFn: getTrucks,
    //   staleTime: Infinity,
    // });

    // await queryClient.prefetchQuery({
    //   queryKey: ['packings'],
    //   queryFn: getPackings,
    //   staleTime: Infinity,
    // });

    // await queryClient.prefetchQuery({
    //   queryKey: ['extra-services'],
    //   queryFn: getExtraServices,
    //   staleTime: Infinity,
    // });

    // await queryClient.prefetchQuery({
    //   queryKey: ['rates'],
    //   queryFn: getRates,
    //   staleTime: Infinity,
    // });

    // await queryClient.prefetchQuery({
    //   queryKey: ['calendar-rates'],
    //   queryFn: getCalendarRates,
    //   staleTime: Infinity,
    // });

    // await queryClient.prefetchQuery({
    //   queryKey: ['move-sizes'],
    //   queryFn: getMoveSizes,
    //   staleTime: Infinity,
    // });

    // await queryClient.prefetchQuery({
    //   queryKey: ['entrance-types'],
    //   queryFn: getEntranceTypes,
    //   staleTime: Infinity,
    // });

    // await queryClient.prefetchQuery({
    //   queryKey: ['folders'],
    //   queryFn: getFolders,
    //   staleTime: Infinity,
    // });

    // await queryClient.prefetchQuery({
    //   queryKey: ['emails'],
    //   queryFn: getEmails,
    //   staleTime: Infinity,
    // });



  } catch (error) {
    console.error('Failed to prefetch settings:', error);
    // Don't throw here as settings are not critical for auth pages
  }
};

/**
 * Root `/` route loader — redirects to the user's portal or login.
 * Redirect happens in the loader so the component never renders with stale store state.
 */
export const rootLoader = async () => {
  prefetchSettings();

  try {
    const user = await getCurrentUser();
    useAuthStore.getState().setUser(user);
  } catch {
    useAuthStore.getState().clearAuth();
  }

  return null;
};

/**
 * CRM, Acc route loader
 */
export const appLoader = async ({ request }: AuthLoaderParams) => {
  const url = new URL(request.url);
  const returnTo = `${url.pathname}${url.search}`;

  prefetchSettings();

  try {
    const user = await getCurrentUser();
    useAuthStore.getState().setUser(user);
    return null;
  } catch {
    useAuthStore.getState().clearAuth();
    return createLoginRedirect(returnTo);
  }
};


/**
 * Auth route loader
 */
export const authLoader = async () => {
  prefetchSettings();

  try {
    const user = await getCurrentUser();
    useAuthStore.getState().setUser(user);
    return redirect(getPortalForRole(user.role));
  } catch {
    useAuthStore.getState().clearAuth();
    return null;
  }
};

/**
 * Should revalidate the app loader
 */
export function shouldRevalidate({
  currentUrl,
  nextUrl,
}: {
  currentUrl: URL;
  nextUrl: URL;
}) {
  return currentUrl.pathname !== nextUrl.pathname;
}
