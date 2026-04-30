import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { useCreateFolder } from "@/hooks/api/use-folders";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export function FolderForm() {
  const form = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
    values: {
      name: "",
    },
  });

  const { mutate: createFolderMutation, isPending } = useCreateFolder({
    onSuccess: (data) => {
      console.log("data", data);
      toast.success("Folder created");
      form.reset();
    },
  });

  function onSubmit(values: FormValues) {
    createFolderMutation(values);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className="hidden">
                Folder name
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  placeholder="New folder..."
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    variant="default"
                    type="submit"
                    disabled={isPending}
                  >
                    <LoadingSwap isLoading={isPending}>Create</LoadingSwap>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
