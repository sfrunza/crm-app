import { usePackingItems } from "@/hooks/api/use-packing-items"
import { ItemsDialog, type ItemsDialogConfig } from "./items-dialog"

export function PackingSuppliesDialog() {
  const config: ItemsDialogConfig = {
    searchParamKey: "edit_packing_supplies",
    itemsFieldName: "packing_items",
    totalFieldName: "packing_items_total",
    title: "Packing supplies",
    description: "Add packing supplies to the request.",
    sidebarLabel: "Packing supplies",
    customItemPlaceholder: "Custom packing supply",
    customItemLabel: "Custom packing supply name",
    totalLabel: "Total supplies",
    useItemsHook: usePackingItems,
  }

  return <ItemsDialog config={config} />
}
