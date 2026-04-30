// import { formatPhone } from "@/lib/utils";
// import type { TableRequest } from "@/types/request";
// import type { ColumnDef } from "@tanstack/react-table";
// import { useMemo } from "react";
// import { AddressCell } from "./cells/address-cell";
// import { DateCell } from "./cells/date-cell";
// import { PriceCell } from "./cells/price-cell";
// import { StatusCell } from "./cells/status-cell";

// type TStorageIcons = {
//   [key: string]: string;
// };

// const storageIcons: TStorageIcons = {
//   "Moving with Storage": "/svg-icons/warehouse.svg",
//   "Overnight Truck Storage": "/svg-icons/truck.svg",
// };

// export function useColumns() {
//   return useMemo<ColumnDef<TableRequest>[]>(
//     () => [
//       {
//         accessorKey: "id",
//         header: "ID",
//         cell: ({ getValue }) => (
//           <span className="text-sm font-bold">{getValue() as string}</span>
//         ),
//         size: 60,
//       },
//       {
//         accessorKey: "status",
//         header: "Status",
//         cell: ({ row }) => <StatusCell status={row.original.status} />,
//         enableSorting: false,
//       },
//       {
//         accessorKey: "service.name",
//         header: "Service type",
//         enableSorting: false,
//         size: 130,
//         cell: ({ getValue }) => (
//           <span className="wrap-break-words leading-normal whitespace-normal">
//             {getValue() as string}
//           </span>
//         ),
//       },
//       {
//         accessorKey: "moving_date",
//         header: "Move date",
//         cell: ({ row }) => (
//           <DateCell date={row.original.moving_date} showRelative />
//         ),
//       },
//       {
//         accessorKey: "customer",
//         header: "Customer, phone",
//         cell: ({ row }) => (
//           <span>
//             {row.original.customer?.first_name}{" "}
//             {row.original.customer?.last_name}
//             <br />
//             {formatPhone(row.original.customer?.phone)}
//           </span>
//         ),
//         enableSorting: false,
//       },
//       {
//         accessorKey: "origin",
//         header: "Moving from",
//         cell: ({ row }) => {
//           const withStorage =
//             row.original.service.name === "Moving with Storage" ||
//             row.original.service.name === "Overnight Truck Storage";
//           const isMovingFromStorage = row.original.is_moving_from_storage;
//           const hasPairedRequest = row.original.has_paired_request;
//           const showStorageOrigin =
//             withStorage && isMovingFromStorage && hasPairedRequest;
//           if (showStorageOrigin) {
//             return (
//               <div className="flex items-center gap-2">
//                 <img
//                   src={storageIcons[row.original.service.name]}
//                   className="size-6"
//                 />
//                 From storage
//               </div>
//             );
//           }
//           return <AddressCell address={row.original.origin} />;
//         },
//         enableSorting: false,
//       },
//       {
//         accessorKey: "destination",
//         header: "Moving to",
//         cell: ({ row }) => {
//           const withStorage =
//             row.original.service.name === "Moving with Storage" ||
//             row.original.service.name === "Overnight Truck Storage";
//           const isMovingFromStorage = row.original.is_moving_from_storage;
//           const hasPairedRequest = row.original.has_paired_request;
//           const showStorageDestination =
//             withStorage && !isMovingFromStorage && hasPairedRequest;
//           if (showStorageDestination) {
//             return (
//               <div className="flex items-center gap-2">
//                 <img
//                   src={storageIcons[row.original.service.name]}
//                   className="size-6"
//                 />
//                 To storage
//               </div>
//             );
//           }
//           return <AddressCell address={row.original.destination} />;
//         },
//         enableSorting: false,
//       },
//       {
//         accessorKey: "move_size.name",
//         header: "Move size",
//         enableSorting: false,
//         size: 140,
//         cell: ({ getValue }) => (
//           <span className="wrap-break-words leading-normal whitespace-normal">
//             {getValue() as string}
//           </span>
//         ),
//       },
//       {
//         accessorKey: "crew_size",
//         header: "Crew",
//         enableSorting: false,
//         size: 80,
//       },
//       {
//         accessorKey: "created_at",
//         header: "Created at",
//         cell: ({ row }) => <DateCell date={row.original.created_at} />,
//         size: 120,
//       },
//       {
//         accessorKey: "updated_at",
//         header: "Updated at",
//         cell: ({ row }) => <DateCell date={row.original.updated_at} />,
//         size: 120,
//       },
//       {
//         accessorKey: "booked_at",
//         header: "Booked at  ",
//         cell: ({ row }) => <DateCell date={row.original.booked_at} />,
//         size: 120,
//       },
//       {
//         accessorKey: "total_price",
//         header: "Est. Quote",
//         cell: ({ row }) => <PriceCell price={row.original.total_price} />,
//         enableSorting: false,
//       },
//     ],
//     [],
//   );
// }
