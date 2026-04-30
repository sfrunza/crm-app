import { ErrorBoundary } from "@/components/shared/error-boundary";
import { useRequestsSubscription } from "@/hooks/use-requests-subscription";
import { router } from "@/routes/index";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { Toaster } from "./components/ui/sonner";
import { RouterProvider } from "react-router";

function AppSubscriptions() {
  useRequestsSubscription();
  // later:
  // useDispatchSubscription()
  // useTrucksSubscription()
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppSubscriptions />
        <RouterProvider router={router} />
      </ErrorBoundary>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
