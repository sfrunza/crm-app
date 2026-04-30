import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFolders } from "@/hooks/api/use-folders"
import { Controller, type UseFormReturn } from "react-hook-form"

interface TemplateFormProps {
  form: UseFormReturn<any>
  folderId: string | null
}

export function TemplateForm({ form, folderId }: TemplateFormProps) {
  const { data: folders } = useFolders({
    enabled: !!folderId,
  })
  return (
    <form className="space-y-4">
      <Controller
        control={form.control}
        name="subject"
        render={({ field }) => (
          <Input {...field} placeholder="Enter email subject" />
        )}
      />
      <Controller
        control={form.control}
        name="name"
        render={({ field }) => (
          <Input {...field} placeholder="Enter template name" />
        )}
      />
      <Controller
        control={form.control}
        name="folder_id"
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {folders?.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id.toString()}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
      <Controller
        control={form.control}
        name="event_key"
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select event key" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[
                  "manager_new_request",
                  "customer_request_confirmed",
                  "customer_move_reminder_5_days",
                  "customer_move_reminder_1_day",
                  "manager_added_message",
                  "customer_added_message",
                ]?.map((event_key) => (
                  <SelectItem key={event_key} value={event_key}>
                    {event_key}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
    </form>
  )
}
