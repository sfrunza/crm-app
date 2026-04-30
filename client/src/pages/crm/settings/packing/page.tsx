import { PageContent } from "@/components/page-component";
import { PackingItems } from "./packing-items/page";
import { PackingTypes } from "./packing-types/page";

function PackingPage() {
  return (
    <PageContent className="space-y-8">
      <PackingItems />
      <PackingTypes />
    </PageContent>
  );
}

export const Component = PackingPage;
