import { MoveSizes } from "./move-sizes/page"
import { EntranceTypes } from "./entrance-types/page"

function CalculatorPage() {
  return (
    <div className="space-y-8">
      <MoveSizes />
      <EntranceTypes />
    </div>
  )
}

export const Component = CalculatorPage
