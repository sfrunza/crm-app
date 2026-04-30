import { RequestDetails } from "@/components/request/request-details";
import { useRequest } from "@/hooks/use-request";

export function Details() {
  const { request } = useRequest();

  if (!request) return null;

  return <RequestDetails request={request} />;
}
