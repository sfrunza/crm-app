import { CableIcon } from "@/components/icons";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/lib/query-client";
import { useRequest } from "@/hooks/use-request";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { usePairRequests } from "@/domains/requests/request.mutations";
import { requestKeys } from "@/domains/requests/request.keys";

export const formSchema = z.object({
  pairedRequestId: z.string().min(1),
});

export type Inputs = z.infer<typeof formSchema>;

export function ConnectRequestForm() {
  const { request } = useRequest();

  const { mutate: pairRequestsMutation, isPending: isPairing } =
    usePairRequests({
      onSettled: async (data, error) => {
        if (error) {
          await queryClient.cancelQueries({ queryKey: requestKeys.lists() });
        }
        if (data) {
          // queryClient.setQueryData(requestKeys.detail(data.id), data);
          await queryClient.invalidateQueries({
            queryKey: requestKeys.lists(),
          });
          await queryClient.invalidateQueries({
            queryKey: requestKeys.statusCounts(),
          });
        }
      },
    });

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { pairedRequestId: "" },
  });

  async function _onSubmit(data: Inputs) {
    if (!request) return;

    pairRequestsMutation({
      requestId: request.id,
      pairedRequestId: Number(data.pairedRequestId),
    });
  }

  return (
    <form
      autoComplete="off"
      onSubmit={form.handleSubmit(_onSubmit)}
      className="space-y-2"
      id="connect-request-form"
    >
      <Controller
        name="pairedRequestId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            type="number"
            aria-invalid={fieldState.invalid ? true : false}
            title="Please enter Request ID"
            placeholder="Request ID"
          />
        )}
      />
      <Button
        disabled={isPairing || !form.formState.isValid}
        variant="outline"
        type="submit"
        className="w-full"
        form="connect-request-form"
      >
        <LoadingSwap
          isLoading={isPairing}
          className="inline-flex items-center justify-center gap-1.5"
        >
          <CableIcon />
          Connect delivery request
        </LoadingSwap>
      </Button>
    </form>
  );
}
