import { useExtraServices } from "@/hooks/api/use-extra-services"
import { ItemsDialog, type ItemsDialogConfig } from "./items-dialog"

export function ExtraServicesDialog() {
  const config: ItemsDialogConfig = {
    searchParamKey: "edit_extra_services",
    itemsFieldName: "extra_services",
    totalFieldName: "extra_services_total",
    title: "Extra services",
    description: "Add extra services to the request.",
    sidebarLabel: "Extra services",
    customItemPlaceholder: "Custom extra service",
    customItemLabel: "Custom extra service name",
    totalLabel: "Total services",
    useItemsHook: () =>
      useExtraServices({
        select(data) {
          return data.filter((item) => item.active)
        },
      }),
  }

  return <ItemsDialog config={config} />
}
