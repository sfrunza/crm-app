import {
  ContentHeader,
  ContentTab,
  ContentTabs,
  ContentTabTitle,
} from "@/components/content-tabs"
import { useMemo } from "react"
import { useSearchParams } from "react-router"

export type Tab = "all" | "admin" | "manager" | "foreman" | "driver" | "helper"

const tabs: Tab[] = ["all", "admin", "manager", "foreman", "driver", "helper"]

export function FilterTabs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = searchParams.get("role") as Tab
  const activeTab = filter || "all"

  const tabsData = useMemo(() => {
    return (
      tabs.map((tab) => ({
        value: tab,
        label: tab,
        count: 0,
      })) ?? []
    )
  }, [tabs])

  return (
    <ContentTabs>
      {tabsData.map((tab) => (
        <ContentTab
          key={tab.value}
          isActive={activeTab === tab.value}
          onTabClick={() => {
            if (tab.value === "all") {
              setSearchParams((prev) => {
                prev.delete("role")
                return prev
              })
            } else {
              setSearchParams((prev) => {
                prev.set("role", tab.value)
                return prev
              })
            }
          }}
        >
          <ContentHeader>
            <ContentTabTitle className="capitalize">
              {tab.label}
            </ContentTabTitle>
          </ContentHeader>
        </ContentTab>
      ))}
    </ContentTabs>
  )
}
