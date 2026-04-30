import { Spinner } from "@/components/ui/spinner";

const CENTER_CLASS = "flex h-[calc(100svh-8rem)] items-center justify-center";

export function PageLoadingState() {
  return (
    <div className={CENTER_CLASS}>
      <Spinner />
    </div>
  );
}

export function PageErrorState({
  message = "Something went wrong. Please try again.",
}: {
  message?: string;
}) {
  return (
    <div className={CENTER_CLASS}>
      <p className="text-lg">{message}</p>
    </div>
  );
}

export function PageNotFoundState({
  message = "Request not found",
}: {
  message?: string;
}) {
  return (
    <div className={CENTER_CLASS}>
      <p className="text-lg">{message}</p>
    </div>
  );
}
