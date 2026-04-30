import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ActionIcons } from "./_components/action-icons";
import { Addresses } from "./_components/addresses/addresses";
import { DeliveryDateTime } from "./_components/date-time/delivery-date-time";
import { PickupDateTime } from "./_components/date-time/pickup-date-time";
import { TransitDateTime } from "./_components/date-time/transit-date-time";
import { Details } from "./_components/details";
import { Extras } from "./_components/extras";
import { Notes } from "./_components/notes";
// import { Parklot } from "./_components/parklot";
import { ServiceSelect } from "./_components/service-select";
import { StatusSelect } from "./_components/status-select";
import { TabFooter } from "./_components/tab-footer";
import { UpdateRequestButton } from "./_components/update-request-button";
import { getRequestUIBehavior } from "@/domains/requests/request.behavior";
import { useRequest } from "@/hooks/use-request";
import { Parklot } from "./_components/parklot";

export function MainTab() {
  const { draft } = useRequest();
  const { showDeliveryDateTime, showTransitDateTime } =
    getRequestUIBehavior(draft);
  return (
    <div className="pb-10">
      {/* <Parklot /> */}
      <Parklot />

      <div className="divide-y shadow-md">
        <PickupDateTime />
        {showDeliveryDateTime && <DeliveryDateTime />}
        {showTransitDateTime && <TransitDateTime />}
      </div>

      <div className="z-0 px-4 py-6">
        <div className="flex flex-col flex-wrap justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <StatusSelect />
            <ServiceSelect />
            <ActionIcons />
          </div>
          <UpdateRequestButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <Addresses />
            <CardContent className="space-y-6">
              <Separator />
              <Notes />
              <Separator />
              <Details />
            </CardContent>
          </Card>
        </div>
        <div>
          <Extras />
        </div>
        <div className="lg:col-span-2">
          <TabFooter />
        </div>
      </div>
    </div>
  );
}
