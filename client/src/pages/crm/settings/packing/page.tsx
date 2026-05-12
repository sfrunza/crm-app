import { PackingItems } from "./packing-items/page"
import { PackingTypes } from "./packing-types/page"

function PackingPage() {
  return (
    <div className="space-y-8">
      <PackingItems />
      <PackingTypes />
    </div>
  )
}

export const Component = PackingPage
