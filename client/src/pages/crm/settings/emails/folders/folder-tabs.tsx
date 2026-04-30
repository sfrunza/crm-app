import {
  ContentHeader,
  ContentTab,
  ContentTabCount,
  ContentTabs,
  ContentTabTitle,
} from "@/components/content-tabs"
import { useFolders } from "@/hooks/api/use-folders"
import { useMemo } from "react"
import { useSearchParams } from "react-router"

export function FolderTabs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const folderId = searchParams.get("folder_id")

  const { data: folders } = useFolders()

  const defaultFolderId = useMemo(() => {
    return folders?.find((folder) => folder.is_default)?.id
  }, [folders])

  const activeTab = useMemo(() => {
    return folderId ? Number(folderId) : defaultFolderId
  }, [folderId, defaultFolderId])

  const handleTabClick = (value: number) => {
    setSearchParams((prev) => {
      prev.set("folder_id", value.toString())
      return prev
    })
  }

  const tabs = useMemo(() => {
    return (
      folders?.map((folder) => ({
        value: folder.id,
        label: folder.name,
        count: folder.email_templates_count,
      })) ?? []
    )
  }, [folders])

  return (
    <ContentTabs>
      {tabs.map((tab) => (
        <ContentTab
          key={tab.value}
          isActive={activeTab === tab.value}
          onTabClick={() => handleTabClick(tab.value)}
        >
          <ContentHeader>
            <ContentTabTitle>{tab.label}</ContentTabTitle>
            <ContentTabCount>{tab.count}</ContentTabCount>
          </ContentHeader>
        </ContentTab>
      ))}
    </ContentTabs>
  )
}
