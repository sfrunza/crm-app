import { TABLE_CONFIG } from '@/components/data-table/table.config';
import {
  ContentHeader,
  ContentTab,
  ContentTabCount,
  ContentTabIndicator,
  ContentTabs,
  ContentTabTitle,
} from '@/components/content-tabs';
import { getStatusCounts } from '@/domains/requests/request.api';
import {
  STATUS_BG_COLOR,
  STATUS_FILTER_OPTIONS,
} from '@/domains/requests/request.constants';
import { requestKeys } from '@/domains/requests/request.keys';
import { cn } from '@/lib/utils';
import {
  useTableRequestsStore,
  type StatusFilter,
} from '@/stores/use-table-requests-store';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export function StatusTabs() {
  const { statusFilter, setStatusFilter, setPage } = useTableRequestsStore(
    (state) => state
  );

  const { data: statusCounts } = useQuery({
    queryKey: requestKeys.statusCounts(),
    queryFn: getStatusCounts,
    staleTime: TABLE_CONFIG.STALE_TIME,
    gcTime: TABLE_CONFIG.GC_TIME,
    refetchOnMount: true,
  });

  const handleTabClick = useCallback(
    (value: string) => {
      setStatusFilter(value as StatusFilter);
      setPage(1);
    },
    [setStatusFilter, setPage]
  );

  const tabs = useMemo(() => {
    return STATUS_FILTER_OPTIONS.map((tab) => ({
      value: tab.value,
      label: tab.label,
      count: statusCounts?.[tab.value] ?? 0,
    }));
  }, [statusCounts]); // STATUS_OPTIONS is static, remove from deps

  return (
    <ContentTabs>
      {tabs.map((tab) => (
        <ContentTab
          key={tab.value}
          isActive={statusFilter === tab.value}
          onTabClick={() => handleTabClick(tab.value)}
        >
          <ContentHeader>
            <ContentTabTitle>{tab.label}</ContentTabTitle>
            <ContentTabCount>{tab.count}</ContentTabCount>
            <ContentTabIndicator>
              <div
                className={cn(
                  'size-2 rounded-full',
                  STATUS_BG_COLOR[tab.value]
                )}
              />
            </ContentTabIndicator>
          </ContentHeader>
        </ContentTab>
      ))}
    </ContentTabs>
  );
}
