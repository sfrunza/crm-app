import { PlusIcon } from "@/components/icons"
import { InventoryItemGrid } from "@/components/inventory-manager/inventory-item-grid"
import { InventoryManager } from "@/components/inventory-manager/inventory-manager"
import { useInventoryStore } from "@/components/inventory-manager/use-inventory-store"
import { Button } from "@/components/ui/button"
import {
  useCreateItemRoomCategory,
  useDeleteItemRoomCategory,
} from "@/domains/item-room-categories/item-room-category.mutations"
import { useGetItemRoomCategories } from "@/domains/item-room-categories/item-room-category.queries"
import {
  useCreateItem,
  useDeleteItem,
  useUpdateItem,
} from "@/domains/items/item.mutations"
import { useGetItems } from "@/domains/items/item.queries"
import type { Item } from "@/domains/items/item.types"
import type { Room } from "@/domains/rooms/room.types"
import {
  useCreateRoom,
  useDeleteRoom,
  useUpdateRoom,
} from "@/domains/rooms/room.mutations"
import { useGetRooms } from "@/domains/rooms/room.queries"
import { queryClient } from "@/lib/query-client"
import { itemKeys } from "@/domains/items/item.keys"
import { roomKeys } from "@/domains/rooms/room.keys"
import { itemRoomCategoryKeys } from "@/domains/item-room-categories/item-room-category.keys"
import { PencilLine } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  EMPTY_ITEM_FORM,
  itemFromRecord,
  type ItemForm,
} from "./_components/inventory-settings.utils"
import { ItemDialog } from "./_components/item-dialog"
import { RoomDialog } from "./_components/room-dialog"
import { PageContent } from "@/components/page-component"

export function groupItemsByRoom(
  items: Item[],
  selectedRoomId: number | null
): [string, Item[]][] {
  const suggested: Item[] = []
  const other: Item[] = []

  for (const item of items) {
    if (selectedRoomId && item.category_ids?.includes(selectedRoomId)) {
      suggested.push(item)
    } else {
      other.push(item)
    }
  }

  return [
    ["Suggested items", suggested],
    ["Other items", other],
  ]
}

type RoomDraft = {
  name: string
  image: File | null
  imagePreview: string | null
}

const EMPTY_ROOM_DRAFT: RoomDraft = {
  name: "",
  image: null,
  imagePreview: null,
}

function InventorySettingsPage() {
  const {
    search,
    setSearch,
    selectedRoomId,
    setSelectedRoomId,
    typeFilter,
    setTypeFilter,
    openItemModal,
    closeItemModal,
    openRoomModal,
    closeRoomModal,
    editingRoom,
    isRoomModalOpen,
    editingItem,
    isItemModalOpen,
  } = useInventoryStore()

  const { data: rooms, isLoading: isRoomsLoading } = useGetRooms()
  const { data: items, isLoading: isItemsLoading } = useGetItems()
  const { data: categories = [] } = useGetItemRoomCategories()

  const { mutateAsync: createRoom, isPending: isCreatingRoom } = useCreateRoom()
  const { mutateAsync: updateRoom, isPending: isUpdatingRoom } = useUpdateRoom()
  const { mutateAsync: deleteRoom, isPending: isDeletingRoom } = useDeleteRoom()

  const { mutateAsync: createItem, isPending: isCreatingItem } = useCreateItem()
  const { mutateAsync: updateItem, isPending: isUpdatingItem } = useUpdateItem()
  const { mutateAsync: deleteItem, isPending: isDeletingItem } = useDeleteItem({
    onSuccess: () => toast.success("Item deleted"),
  })

  const { mutateAsync: createCategory } = useCreateItemRoomCategory()
  const { mutateAsync: deleteCategory } = useDeleteItemRoomCategory()

  const [roomDraft, setRoomDraft] = useState<RoomDraft>(EMPTY_ROOM_DRAFT)
  const [itemForm, setItemForm] = useState<ItemForm>(EMPTY_ITEM_FORM)
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null)
  const [removeEditItemImage, setRemoveEditItemImage] = useState(false)

  const roomDialogMode = editingRoom ? "edit" : "create"
  const itemDialogMode = editingItem ? "edit" : "create"

  const categoryIdByPair = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of categories) {
      map.set(`${c.item_id}:${c.room_id}`, c.id)
    }
    return map
  }, [categories])

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: roomKeys.all })
    queryClient.invalidateQueries({ queryKey: itemKeys.all })
    queryClient.invalidateQueries({ queryKey: itemRoomCategoryKeys.all })
  }, [])

  function openAddRoomModal() {
    setRoomDraft(EMPTY_ROOM_DRAFT)
    openRoomModal()
  }

  function openEditRoomModal(room: Room) {
    setRoomDraft({
      name: room.name,
      image: null,
      imagePreview: room.image_url,
    })
    openRoomModal(room)
  }

  function closeRoomDialog() {
    setRoomDraft(EMPTY_ROOM_DRAFT)
    closeRoomModal()
  }

  async function onSaveRoom() {
    const name = roomDraft.name.trim()
    if (!name) return

    try {
      if (roomDialogMode === "create") {
        await createRoom({ name, image: roomDraft.image })
        toast.success("Room created")
      } else if (editingRoom) {
        await updateRoom({
          id: editingRoom.id,
          data: {
            name,
            image: roomDraft.image,
            remove_image:
              !roomDraft.image &&
              !roomDraft.imagePreview &&
              Boolean(editingRoom.image_url),
          },
        })
        toast.success("Room updated")
      }
      invalidate()
      closeRoomDialog()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save room")
    }
  }

  async function onDeleteRoom() {
    if (!editingRoom) return
    try {
      await deleteRoom({ id: editingRoom.id })
      toast.success("Room deleted")
      invalidate()
      closeRoomDialog()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete room")
    }
  }

  function openAddItemModal() {
    setItemForm({
      ...EMPTY_ITEM_FORM,
      room_tag_ids: selectedRoomId ? [selectedRoomId] : [],
    })
    setItemImagePreview(null)
    setRemoveEditItemImage(false)
    openItemModal()
  }

  function openEditItemModal(item: Item) {
    setItemForm(itemFromRecord(item))
    setItemImagePreview(item.image_url ?? null)
    setRemoveEditItemImage(false)
    openItemModal(item)
  }

  function closeItemDialog() {
    setItemForm(EMPTY_ITEM_FORM)
    setItemImagePreview(null)
    setRemoveEditItemImage(false)
    closeItemModal()
  }

  function toggleItemRoomTag(roomId: number) {
    setItemForm((prev) => {
      const exists = prev.room_tag_ids.includes(roomId)
      return {
        ...prev,
        room_tag_ids: exists
          ? prev.room_tag_ids.filter((id) => id !== roomId)
          : [...prev.room_tag_ids, roomId],
      }
    })
  }

  async function onSaveItem() {
    const form = itemForm
    if (!form.name.trim()) return
    if (form.room_tag_ids.length === 0) {
      toast.error("Select at least one room for this item.")
      return
    }

    try {
      if (itemDialogMode === "create") {
        const created = await createItem({
          name: form.name.trim(),
          description: form.description || null,
          volume: Math.max(0, form.volume),
          weight: Math.max(0, form.weight),
          is_box: form.item_type === "box",
          is_furniture: form.item_type === "furniture",
          is_special_handling: false,
          active: true,
          image: form.image,
        })
        await Promise.all(
          form.room_tag_ids.map((roomId) =>
            createCategory({ item_id: created.id, room_id: roomId })
          )
        )
        toast.success("Item created")
      } else if (editingItem) {
        await updateItem({
          id: editingItem.id,
          data: {
            name: form.name.trim(),
            description: form.description || null,
            volume: Math.max(0, form.volume),
            weight: Math.max(0, form.weight),
            is_box: form.item_type === "box",
            is_furniture: form.item_type === "furniture",
            image: form.image,
            remove_image: removeEditItemImage,
          },
        })
        const currentRoomIds = new Set(editingItem.category_ids ?? [])
        const nextRoomIds = new Set(form.room_tag_ids)
        const toCreate = [...nextRoomIds].filter(
          (id) => !currentRoomIds.has(id)
        )
        const toDelete = [...currentRoomIds].filter(
          (id) => !nextRoomIds.has(id)
        )
        await Promise.all(
          toCreate.map((roomId) =>
            createCategory({ item_id: editingItem.id, room_id: roomId })
          )
        )
        await Promise.all(
          toDelete
            .map((roomId) =>
              categoryIdByPair.get(`${editingItem.id}:${roomId}`)
            )
            .filter((id): id is number => typeof id === "number")
            .map((id) => deleteCategory({ id }))
        )
        toast.success("Item updated")
      }
      invalidate()
      closeItemDialog()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save item")
    }
  }

  async function onDeleteItem() {
    if (!editingItem) return
    try {
      await deleteItem({ id: editingItem.id })
      invalidate()
      closeItemDialog()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete item")
    }
  }

  function handleSelectRoom(roomId: number) {
    setSelectedRoomId(roomId)
  }

  const filteredItems = useMemo(() => {
    return items?.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchesType =
        typeFilter === "all" ||
        (item.is_box && typeFilter === "box") ||
        (item.is_furniture && typeFilter === "furniture")
      return matchesSearch && matchesType
    })
  }, [items, search, typeFilter])

  const grouped = groupItemsByRoom(filteredItems ?? [], selectedRoomId)

  const itemImagePreviewResolved =
    itemImagePreview ??
    (editingItem?.image_url && !removeEditItemImage
      ? editingItem.image_url
      : null)

  const itemCount = filteredItems?.length ?? 0
  const rightTitle = selectedRoomId
    ? `${itemCount} item${itemCount === 1 ? "" : "s"}`
    : "Select a room"

  // const normalizedRooms = useMemo(
  //   () => buildAdminInventory(rooms ?? [], items ?? []),
  //   [rooms, items],
  // );

  return (
    <PageContent>
      <InventoryManager
        variant="admin"
        rooms={rooms}
        isLoading={isRoomsLoading}
        selectedRoomId={selectedRoomId}
        onSelectRoom={(roomId) => handleSelectRoom(Number(roomId))}
        onAddRoom={openAddRoomModal}
        renderRoomAction={(room) => (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={() => openEditRoomModal(room)}
          >
            <PencilLine />
          </Button>
        )}
        rightHeaderTitle={rightTitle}
        rightHeaderAction={
          <Button size="sm" onClick={openAddItemModal}>
            <PlusIcon />
            Add Item
          </Button>
        }
        hideLeftOnMobileWhenActive={false}
      >
        <InventoryItemGrid
          variant="admin"
          items={grouped}
          isLoading={isItemsLoading}
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onEdit={openEditItemModal}
          emptyText="No items matched your filters."
        />
      </InventoryManager>

      <RoomDialog
        open={isRoomModalOpen}
        mode={roomDialogMode}
        draft={roomDraft}
        editingRoomId={editingRoom?.id ?? null}
        isCreatingRoom={isCreatingRoom}
        isUpdatingRoom={isUpdatingRoom}
        isDeletingRoom={isDeletingRoom}
        onOpenChange={(open) => !open && closeRoomDialog()}
        onDraftChange={setRoomDraft}
        onSave={onSaveRoom}
        onDelete={onDeleteRoom}
        onCancel={closeRoomDialog}
      />

      <ItemDialog
        mode={itemDialogMode}
        open={isItemModalOpen}
        item={itemForm}
        roomOptions={rooms?.map((r) => ({ id: r.id, name: r.name })) ?? []}
        imagePreview={itemImagePreviewResolved}
        isSubmitting={isCreatingItem || isUpdatingItem}
        isDeleting={isDeletingItem}
        hasServerImage={
          Boolean(editingItem?.image_url) &&
          !itemForm.image &&
          !removeEditItemImage
        }
        onOpenChange={(open) => !open && closeItemDialog()}
        onItemChange={setItemForm}
        onToggleRoomTag={toggleItemRoomTag}
        onImagePreviewChange={setItemImagePreview}
        onMarkRemoveImage={setRemoveEditItemImage}
        onCancel={closeItemDialog}
        onDelete={itemDialogMode === "edit" ? onDeleteItem : undefined}
        onSave={onSaveItem}
      />
    </PageContent>
  )
}

export const Component = InventorySettingsPage
