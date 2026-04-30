import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useServices } from "@/hooks/api/use-services"
import { useRequest } from "@/hooks/use-request"

export function ServiceSelect() {
  const { data: services } = useServices()
  const { draft, setField } = useRequest()

  return (
    <Select
      value={draft?.service_id?.toString() ?? ""}
      onValueChange={(val) => {
        setField("service_id", Number(val))
      }}
    >
      <SelectTrigger className="w-full bg-background font-medium md:w-56">
        <SelectValue placeholder="select service" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {services?.map((service, i) => {
            return (
              <SelectItem key={i} value={service.id.toString()}>
                {service.name}
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
