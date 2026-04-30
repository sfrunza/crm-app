import { TipTapEditor } from '@/components/tip-tap-editor';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { LoadingSwap } from '@/components/ui/loading-swap';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requestKeys } from '@/domains/requests/request.keys';
import { useUpdateRequest } from '@/domains/requests/request.mutations';
import { useRequest } from '@/hooks/use-request';
import { queryClient } from '@/lib/query-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  sales_notes: z.string().optional(),
  driver_notes: z.string().optional(),
  customer_notes: z.string().optional(),
  dispatch_notes: z.string().optional(),
});

type Inputs = z.infer<typeof formSchema>;

export function Notes() {
  const { draft, clear } = useRequest();
  const { mutate: updateRequestMutation, isPending: isUpdating } =
    useUpdateRequest({
      onSettled: (data, error) => {
        if (error) {
          if (draft?.id) {
            queryClient.cancelQueries({
              queryKey: requestKeys.detail(draft.id),
            });
          }
        }
        if (data) {
          // update store
          clear();
          queryClient.setQueryData(requestKeys.detail(data.id), data);
          toast.success('Notes saved');
        }
      },
    });

  // Then inside the component:

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    values: {
      sales_notes: draft?.sales_notes ?? '',
      driver_notes: draft?.driver_notes ?? '',
      customer_notes: draft?.customer_notes ?? '',
      dispatch_notes: draft?.dispatch_notes ?? '',
    },
  });

  const hasNotes = {
    sales_notes: useWatch({ control: form.control, name: 'sales_notes' }),
    driver_notes: useWatch({ control: form.control, name: 'driver_notes' }),
    customer_notes: useWatch({ control: form.control, name: 'customer_notes' }),
    dispatch_notes: useWatch({ control: form.control, name: 'dispatch_notes' }),
  };

  function onSubmit(values: Inputs) {
    if (!draft) return null;
    updateRequestMutation({
      id: draft.id,
      data: { ...values },
    });
  }

  function MyTabsContent({ name }: { name: keyof Inputs }) {
    return (
      <TabsContent value={name}>
        <Controller
          name={name}
          control={form.control}
          render={({ field }) => (
            <Field>
              <TipTapEditor
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            </Field>
          )}
        />
      </TabsContent>
    );
  }

  function MyTabsTrigger({ name }: { name: keyof typeof hasNotes }) {
    const notes = hasNotes[name];
    return (
      <TabsTrigger value={name}>
        <div className="relative capitalize">
          {name.replaceAll('_', ' ')}
          {!!notes?.length && (
            <span className="absolute top-0 -right-1.5 size-1.5 rounded-full bg-green-600" />
          )}
        </div>
      </TabsTrigger>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Tabs defaultValue="sales_notes">
        <ScrollArea className="h-10">
          <TabsList>
            {Object.keys(formSchema.shape).map((field) => (
              <MyTabsTrigger key={field} name={field as keyof Inputs} />
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
        {Object.keys(formSchema.shape).map((field) => (
          <MyTabsContent key={field} name={field as keyof Inputs} />
        ))}
      </Tabs>
      <div className="flex justify-end">
        <Button disabled={!form.formState.isDirty || isUpdating} type="submit">
          <LoadingSwap isLoading={isUpdating}>Save notes</LoadingSwap>
        </Button>
      </div>
    </form>
  );
}
