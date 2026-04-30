import { PageContent } from "@/components/page-component";
import { MoveSizes } from "./move-sizes/page";
import { EntranceTypes } from "./entrance-types/page";

function CalculatorPage() {
  return (
    <PageContent className="space-y-8">
      <MoveSizes />
      <EntranceTypes />
    </PageContent>
  );
}

export const Component = CalculatorPage;
