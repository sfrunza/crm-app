import type { Address } from "@/domains/requests/request.types"
import { useEntranceTypes } from "@/hooks/api/use-entrance-types"

interface AddressItemProps {
  title: string
  address: Address
  isCompanyStorage?: boolean
}

export function AddressItem({
  title,
  address,
  isCompanyStorage,
}: AddressItemProps) {
  const { data: entranceTypes } = useEntranceTypes()

  const floorName = address.floor_id
    ? entranceTypes?.find((f) => f.id === address.floor_id)?.name
    : "Floor not selected"

  if (isCompanyStorage)
    return (
      <div>
        <b>{title}</b>
        <p>Company Storage</p>
      </div>
    )

  return (
    <div>
      <p>
        <b>{title}</b> <span>({floorName})</span>
      </p>
      <p>
        {address.street}
        {address.apt ? `, apt #${address.apt}` : ""}
      </p>
      <p>
        {address.city ? `${address.city}, ` : ""}
        {address.state} {address.zip}
      </p>
    </div>
  )
}
