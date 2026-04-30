import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRequest } from '@/hooks/use-request';
import { useMemo } from 'react';
import { CalculatorSwitch } from './calculator-switch';
import { CustomerTab } from './tabs/customer-tab/customer-tab';
import { DetailsTab } from './tabs/details-tab/details-tab';
import { InventoryTab } from './tabs/inventory-tab/inventory-tab';
import { LogsTab } from './tabs/logs-tab/logs-tab';
import { MainTab } from './tabs/main-tab/main-tab';
import { MessagesTab } from './tabs/messages-tab/messages-tab';
import { PhotosTab } from './tabs/photos-tab/photos-tab';
import { Separator } from '@/components/ui/separator';

export function NavigationTabs() {
  const { request } = useRequest();

  const hasDetails = request?.details?.is_touched ?? false;
  const hasPhotos = request?.image_urls
    ? request?.image_urls?.length > 0
    : false;
  const hasRequests = request?.customer
    ? request?.customer?.requests_count > 1
    : false;
  const hasMessages = request && request.unread_messages_count > 0;

  const hasClientInventory = (request?.request_rooms ?? []).some(
    (room) => (room.request_items?.length ?? 0) > 0
  );

  const inventoryBadge = hasClientInventory
    ? `${Number(request?.totals?.volume || 0).toFixed(2)} cu ft`
    : null;

  const tabsData = useMemo(() => {
    return [
      {
        value: 'request',
        label: `Request #${request?.id}`,
      },
      {
        value: 'customer',
        label: 'Customer',
        showDot: hasRequests,
      },
      {
        value: 'messages',
        label: 'Messages',
        showDot: hasMessages,
      },
      {
        value: 'logs',
        label: 'Logs',
      },
      {
        value: 'details',
        label: 'Details',
        showDot: hasDetails,
      },
      {
        value: 'photos',
        label: 'Photos',
        showDot: hasPhotos,
      },
      {
        value: 'inventory',
        label: 'Inventory',
        badge: inventoryBadge,
      },
    ];
  }, [
    request,
    hasRequests,
    hasMessages,
    hasDetails,
    hasPhotos,
    inventoryBadge,
  ]);

  return (
    <Tabs defaultValue="request" className="gap-0">
      <div className="flex flex-col-reverse justify-between gap-y-4 px-4 md:flex-row">
        <ScrollArea className="h-10">
          <TabsList variant="line">
            {tabsData.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                <div className="relative flex items-center gap-2">
                  {tab.label}
                  {tab.badge && (
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-[10px]"
                    >
                      {tab.badge}
                    </Badge>
                  )}
                  {tab.showDot && (
                    <span className="absolute top-0 -right-1.5 size-1.5 rounded-full bg-green-600" />
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
        <div className="flex w-full flex-1 items-center justify-end gap-3 px-4 md:pb-2">
          <CalculatorSwitch />
        </div>
      </div>
      <Separator className="-mt-1" />
      <div>
        <TabsContent value="request">
          <MainTab />
        </TabsContent>
        <TabsContent value="customer">
          <CustomerTab />
        </TabsContent>
        <TabsContent value="messages">
          <MessagesTab />
        </TabsContent>
        <TabsContent value="logs">
          <LogsTab />
        </TabsContent>
        <TabsContent value="details">
          <DetailsTab />
        </TabsContent>
        <TabsContent value="photos">
          <PhotosTab />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryTab />
        </TabsContent>
      </div>
    </Tabs>
  );
}
