import { useGetItems } from "@/domains/items/item.queries";
import type { Item } from "@/domains/items/item.types";
import { useCreateMoveSizeRoom, useDeleteMoveSizeRoom, useUpdateMoveSizeRoom } from "@/domains/move-size-rooms/move-size-room.mutations";
import type { MoveSizeRoomItems } from "@/domains/move-size-rooms/move-size-room.types";
import { useGetRooms } from "@/domains/rooms/room.queries";
import { useEntranceTypes } from "@/hooks/api/use-entrance-types";
import { useCreateMoveSize, useMoveSizes, useUpdateMoveSize } from "@/hooks/api/use-move-sizes";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { MoveSize } from '@/types/index';
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  dispersion: z.coerce.number<number>().int().min(0).max(100),
  truck_count: z.coerce.number<number>().int().min(1),
  crew_size_settings: z.array(z.array(z.number().int().min(2))).optional(),
  default_room_ids: z.array(z.number().int()),
  suggested_room_ids: z.array(z.number().int()),
  default_room_items: z.record(
    z.string(),
    z.record(z.string(), z.coerce.number<number>().int().min(0)),
  ),
  suggested_room_items: z.record(
    z.string(),
    z.record(z.string(), z.coerce.number<number>().int().min(0)),
  ),
  image: z.instanceof(File).optional().nullable(),
});

export type MoveSizeFormValues = z.infer<typeof formSchema>;

function deriveDefaultRoomIds(moveSize: MoveSize | undefined): number[] {
  if (!moveSize?.default_rooms?.length) return [];
  return [...moveSize.default_rooms]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((r) => r.room_id);
}

function deriveSuggestedRoomIds(moveSize: MoveSize | undefined): number[] {
  if (!moveSize?.suggested_rooms?.length) return [];
  return [...moveSize.suggested_rooms]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((r) => r.room_id);
}

function deriveRoomItems(
  rooms: { room_id: number; items?: MoveSizeRoomItems }[] | undefined,
): Record<string, MoveSizeRoomItems> {
  if (!rooms?.length) return {};
  const result: Record<string, MoveSizeRoomItems> = {};
  for (const r of rooms) {
    if (r.items && Object.keys(r.items).length > 0) {
      result[r.room_id.toString()] = r.items;
    }
  }
  return result;
}

function buildDefaultCrewSizeSettings(entranceTypesLength: number): number[][] {
  return Array.from({ length: entranceTypesLength }, () =>
    Array(entranceTypesLength).fill(2),
  );
}

export function useMoveSizeForm() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: moveSizes } = useMoveSizes();
  const { data: entranceTypes } = useEntranceTypes();
  const { data: rooms = [] } = useGetRooms();
  const { data: items = [] } = useGetItems();

  const activeItems = items.filter((item) => item.active);
  const moveSize = moveSizes?.find((m) => m.id === editId);

  const form = useForm<MoveSizeFormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      dispersion: 0,
      truck_count: 1,
      crew_size_settings: [],
      default_room_ids: [],
      suggested_room_ids: [],
      default_room_items: {},
      suggested_room_items: {},
      image: null,
    },
  });

  useEffect(() => {
    if (moveSize) {
      const defaultRoomIds = deriveDefaultRoomIds(moveSize);
      const suggestedRoomIds = deriveSuggestedRoomIds(moveSize);
      const defaultRoomItems = deriveRoomItems(moveSize.default_rooms);
      const suggestedRoomItems = deriveRoomItems(moveSize.suggested_rooms);
      const crewSettings =
        moveSize.crew_size_settings ??
        buildDefaultCrewSizeSettings(entranceTypes?.length ?? 0);

      form.reset({
        name: moveSize.name ?? "",
        description: moveSize.description ?? "",
        dispersion: moveSize.dispersion ?? 0,
        truck_count: moveSize.truck_count ?? 1,
        crew_size_settings: crewSettings,
        default_room_ids: defaultRoomIds,
        suggested_room_ids: suggestedRoomIds,
        default_room_items: defaultRoomItems,
        suggested_room_items: suggestedRoomItems,
        image: null,
      });
      setImagePreview(moveSize.image_url ?? null);
    } else if (isOpen && editId === null) {
      form.reset({
        name: "",
        description: "",
        dispersion: 0,
        truck_count: 1,
        crew_size_settings: buildDefaultCrewSizeSettings(
          entranceTypes?.length ?? 0,
        ),
        default_room_ids: [],
        suggested_room_ids: [],
        default_room_items: {},
        suggested_room_items: {},
        image: null,
      });
      setImagePreview(null);
    }
  }, [moveSize, isOpen, editId, form, entranceTypes?.length]);

  useEffect(() => {
    const editParam = searchParams.get("edit_move_size");
    const createParam = searchParams.get("create_move_size");

    if (editParam) {
      setEditId(Number(editParam));
      setIsOpen(true);
    } else if (createParam) {
      setEditId(null);
      setIsOpen(true);
    }
  }, [searchParams]);

  const { mutateAsync: createMoveSizeMutation } = useCreateMoveSize();
  const { mutateAsync: updateMoveSizeMutation } = useUpdateMoveSize();
  const { mutateAsync: createMoveSizeRoom } = useCreateMoveSizeRoom();
  const { mutateAsync: updateMoveSizeRoom } = useUpdateMoveSizeRoom();
  const { mutateAsync: deleteMoveSizeRoom } = useDeleteMoveSizeRoom();

  async function syncMoveSizeRooms(
    moveSizeId: number,
    existingDefaultRooms: MoveSize["default_rooms"],
    existingSuggestedRooms: MoveSize["suggested_rooms"],
    newDefaultRoomIds: number[],
    newSuggestedRoomIds: number[],
    newDefaultRoomItems: Record<string, MoveSizeRoomItems>,
    newSuggestedRoomItems: Record<string, MoveSizeRoomItems>,
  ) {
    const existingDefaultByRoomId = new Map(
      (existingDefaultRooms ?? []).map((r) => [r.room_id, r]),
    );
    const existingSuggestedByRoomId = new Map(
      (existingSuggestedRooms ?? []).map((r) => [r.room_id, r]),
    );

    const toCreate: {
      room_id: number;
      kind: 0 | 1;
      position: number;
      items?: MoveSizeRoomItems;
    }[] = [];
    const toUpdate: { id: number; items: MoveSizeRoomItems }[] = [];
    const toDelete: { id: number }[] = [];

    // Default rooms
    const newDefaultRoomIdSet = new Set(newDefaultRoomIds);
    for (const [roomId, existing] of existingDefaultByRoomId) {
      if (!newDefaultRoomIdSet.has(roomId)) {
        toDelete.push({ id: existing.id });
      }
    }
    for (let index = 0; index < newDefaultRoomIds.length; index++) {
      const roomId = newDefaultRoomIds[index];
      const items = newDefaultRoomItems[roomId.toString()] || {};
      const existing = existingDefaultByRoomId.get(roomId);

      if (existing) {
        toUpdate.push({ id: existing.id, items });
      } else {
        toCreate.push({ room_id: roomId, kind: 0, position: index, items });
      }
    }

    // Suggested rooms
    const newSuggestedRoomIdSet = new Set(newSuggestedRoomIds);
    for (const [roomId, existing] of existingSuggestedByRoomId) {
      if (!newSuggestedRoomIdSet.has(roomId)) {
        toDelete.push({ id: existing.id });
      }
    }
    for (let index = 0; index < newSuggestedRoomIds.length; index++) {
      const roomId = newSuggestedRoomIds[index];
      const items = newSuggestedRoomItems[roomId.toString()] || {};
      const existing = existingSuggestedByRoomId.get(roomId);

      if (existing) {
        toUpdate.push({ id: existing.id, items });
      } else {
        toCreate.push({ room_id: roomId, kind: 1, position: index, items });
      }
    }

    await Promise.all([
      ...toDelete.map((r) => deleteMoveSizeRoom({ moveSizeId, id: r.id })),
      ...toCreate.map((r) => createMoveSizeRoom({ moveSizeId, data: r })),
      ...toUpdate.map((r) =>
        updateMoveSizeRoom({ moveSizeId, id: r.id, data: { items: r.items } }),
      ),
    ]);
  }

  function handleClose() {
    form.reset();
    setIsOpen(false);
    setEditId(null);
    setImagePreview(null);
    setSearchParams();
  }

  async function handleSubmit(values: MoveSizeFormValues) {
    setIsSubmitting(true);

    try {
      const removeImage = !values.image && !imagePreview;
      const payload = {
        name: values.name,
        description: values.description,
        dispersion: values.dispersion,
        truck_count: values.truck_count,
        crew_size_settings: values.crew_size_settings,
        image: values.image,
      };

      if (moveSize) {
        await syncMoveSizeRooms(
          moveSize.id,
          moveSize.default_rooms ?? [],
          moveSize.suggested_rooms ?? [],
          values.default_room_ids || [],
          values.suggested_room_ids || [],
          values.default_room_items || {},
          values.suggested_room_items || {},
        );

        await updateMoveSizeMutation({
          id: moveSize.id,
          data: { ...payload, remove_image: removeImage },
        });

        toast.success("Move size updated");
      } else {
        const newMoveSize = await createMoveSizeMutation(payload);

        const defaultRoomIds = values.default_room_ids || [];
        const suggestedRoomIds = values.suggested_room_ids || [];
        const defaultRoomItems = values.default_room_items || {};
        const suggestedRoomItems = values.suggested_room_items || {};

        const roomPromises = [
          ...defaultRoomIds.map((roomId, index) =>
            createMoveSizeRoom({
              moveSizeId: newMoveSize.id,
              data: {
                room_id: roomId,
                kind: 0,
                position: index,
                items: defaultRoomItems[roomId.toString()] || {},
              },
            }),
          ),
          ...suggestedRoomIds.map((roomId, index) =>
            createMoveSizeRoom({
              moveSizeId: newMoveSize.id,
              data: {
                room_id: roomId,
                kind: 1,
                position: index,
                items: suggestedRoomItems[roomId.toString()] || {},
              },
            }),
          ),
        ];

        if (roomPromises.length > 0) {
          await Promise.all(roomPromises);
        }

        toast.success("Move size created");
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.moveSizes.all });
      handleClose();
    } catch (error) {
      toast.error("Failed to save move size");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleRemoveImage() {
    form.setValue("image", null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function calculateTotals(
    itemQuantities: Record<string, Record<string, number>>,
    allItems: Item[],
  ) {
    let totalVolume = 0;
    let totalWeight = 0;

    const itemsById = new Map(allItems.map((item) => [item.id, item]));

    for (const roomItems of Object.values(itemQuantities)) {
      for (const [itemIdStr, quantity] of Object.entries(roomItems)) {
        const item = itemsById.get(Number(itemIdStr));
        if (item && quantity > 0) {
          totalVolume += (item.volume || 0) * quantity;
          totalWeight += (item.weight || 0) * quantity;
        }
      }
    }

    return { volume: totalVolume, weight: totalWeight };
  }

  return {
    form,
    rooms,
    items: activeItems,
    isOpen,
    moveSize,
    isSubmitting,
    imagePreview,
    fileInputRef,
    entranceTypes,
    calculateTotals,
    handleClose,
    handleSubmit,
    handleImageChange,
    handleRemoveImage,
  };
}
