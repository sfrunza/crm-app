import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRequest } from '@/hooks/use-request';
import { PlusIcon, Trash2Icon } from '@/components/icons';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import { AmountInput } from '@/components/inputs/amount-input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCentsToDollarsString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import type { Request } from '@/domains/requests/request.types';
import { Badge } from '@/components/ui/badge';

export interface Item {
  id: number;
  name: string;
  price: number;
}

export interface TableItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface ItemsDialogConfig {
  /** Search param key to open the dialog (e.g., "edit_packing_supplies") */
  searchParamKey: string;
  /** Field name in the draft object (e.g., "packing_items") */
  itemsFieldName: string;
  /** Field name for the total (e.g., "packing_items_total") */
  totalFieldName: string;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
  /** Label for the sidebar section */
  sidebarLabel: string;
  /** Placeholder for custom item input */
  customItemPlaceholder: string;
  /** Label for custom item input */
  customItemLabel: string;
  /** Label for the grand total section */
  totalLabel: string;
  /** Hook to fetch items */
  useItemsHook: () => { data: Item[] | undefined };
}

export function ItemsDialog({ config }: { config: ItemsDialogConfig }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const { draft, setField } = useRequest();
  const { data: items } = config.useItemsHook();

  const initialItems =
    (draft?.[config.itemsFieldName as keyof Request] as TableItem[]) ?? [];
  const [tableData, setTableData] = useState<TableItem[]>(initialItems);

  // Sync tableData with draft when it changes
  useEffect(() => {
    const draftItems =
      (draft?.[config.itemsFieldName as keyof Request] as TableItem[]) ?? [];
    setTableData(draftItems);
  }, [draft, config.itemsFieldName]);

  useEffect(() => {
    const editParam = searchParams.get(config.searchParamKey);
    if (editParam) {
      setIsOpen(true);
    }
  }, [searchParams, config.searchParamKey]);

  function handleCancel() {
    setIsOpen(false);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete(config.searchParamKey);
      return newParams;
    });
  }

  function handleSave() {
    setField(config.itemsFieldName as keyof Request, tableData);
    setField(config.totalFieldName as keyof Request, grandTotal);
    handleCancel();
  }

  function addItemToTable(item: TableItem) {
    const existingItem = tableData.find((i) => i.id === item.id);
    if (existingItem) {
      setTableData((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setTableData((prev) => [...prev, item]);
    }
  }

  function removeItemFromTable(id: number) {
    setTableData((prev) => prev.filter((item) => item.id !== id));
  }

  function handleNameChange(id: number, value: string) {
    setTableData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: value } : item))
    );
  }

  function handlePriceChange(id: number, value: number) {
    setTableData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: value } : item))
    );
  }

  function handleQuantityChange(id: number, value: number) {
    setTableData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: value } : item))
    );
  }

  function calculateItemTotal(item: {
    id: number;
    price: number;
    quantity: number;
  }) {
    return item.price * item.quantity;
  }

  function calculateGrandTotal() {
    return tableData.reduce((acc, item) => acc + calculateItemTotal(item), 0);
  }

  const grandTotal = calculateGrandTotal();

  function GrandTotalSection() {
    return (
      <div className="border-border border-b px-6 pt-5 pb-3">
        <h2 className="flex items-center gap-2 w-full text-lg font-normal">
          {config.totalLabel}
          <Badge variant="secondary" className="h-8 text-base">
            {formatCentsToDollarsString(grandTotal)}
          </Badge>
        </h2>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="flex h-[calc(100vh-4rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl md:h-[700px]">
        <DialogTitle className="sr-only">{config.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {config.description}
        </DialogDescription>
        {/* Mobile Header */}
        <div className="flex shrink-0 flex-col md:hidden">
          <GrandTotalSection />
          <ScrollArea className="w-full">
            <div className="flex gap-1 px-4 py-4">
              {items?.map((item) => {
                return (
                  <MenuButton
                    key={item.id}
                    item={item}
                    onClick={() =>
                      addItemToTable({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                      })
                    }
                  />
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Desktop Layout */}
        <div className="hidden min-h-0 flex-1 md:flex">
          {/* Sidebar */}
          <div className="border-border bg-sidebar flex min-h-0 w-56 flex-col border-r">
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="mb-1 space-y-4 pt-4">
                <p className="text-muted-foreground px-4 text-xs font-medium">
                  {config.sidebarLabel}
                </p>
                <AddCustomItem
                  placeholder={config.customItemPlaceholder}
                  label={config.customItemLabel}
                  onSubmit={(item) => {
                    addItemToTable(item);
                  }}
                />
              </div>
              <nav className="flex flex-col px-2 pb-4">
                {items?.map((item) => {
                  return (
                    <MenuButton
                      key={item.id}
                      item={item}
                      className="w-full justify-start"
                      onClick={() =>
                        addItemToTable({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          quantity: 1,
                        })
                      }
                    />
                  );
                })}
              </nav>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>

          {/* Content */}
          <div className="grid min-w-0 flex-1 h-full grid-rows-[auto_1fr_auto]">
            <GrandTotalSection />
            <ScrollArea className="overflow-y-auto min-h-0">
              <ItemsTable
                tableData={tableData}
                handleNameChange={handleNameChange}
                handlePriceChange={handlePriceChange}
                handleQuantityChange={handleQuantityChange}
                removeItemFromTable={removeItemFromTable}
                calculateItemTotal={calculateItemTotal}
              />
              <ScrollBar orientation="vertical" />
            </ScrollArea>
            <FooterSection handleSave={handleSave} />
          </div>
        </div>
        {/* Mobile Content */}
        <div className="grid grid-rows-[auto_max-content] h-full overflow-hidden md:hidden">
          <ScrollArea className="overflow-y-auto min-h-0">
            <ItemsTable
              tableData={tableData}
              handleNameChange={handleNameChange}
              handlePriceChange={handlePriceChange}
              handleQuantityChange={handleQuantityChange}
              calculateItemTotal={calculateItemTotal}
              removeItemFromTable={removeItemFromTable}
            />
            <ScrollBar orientation="vertical" />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <FooterSection handleSave={handleSave} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddCustomItem({
  onSubmit,
  placeholder,
  label,
}: {
  onSubmit: (item: TableItem) => void;
  placeholder: string;
  label: string;
}) {
  const [name, setName] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          id: Math.floor(Math.random() * 100000) + Date.now(),
          name,
          price: 0,
          quantity: 1,
        });
        setName('');
      }}
      className="px-3"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name" className="hidden">
            {label}
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              name="name"
              id="name"
              autoComplete="off"
              placeholder={placeholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="default"
                size="icon-xs"
                type="submit"
                disabled={!name}
              >
                <PlusIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </FieldGroup>
    </form>
  );
}

function MenuButton({
  item,
  className,
  onClick,
}: {
  item: Item;
  className?: string;
  onClick: () => void;
}) {
  const isMobile = useIsMobile();
  return (
    <Button
      key={item.id}
      variant={isMobile ? 'outline' : 'ghost'}
      onClick={onClick}
      className={cn('group/menu-item', className)}
    >
      {item.name}
      {!isMobile && (
        <PlusIcon className="bg-primary/10 text-primary ml-auto rounded opacity-0 transition-opacity group-hover/menu-item:opacity-100" />
      )}
    </Button>
  );
}

function FooterSection({ handleSave }: { handleSave: () => void }) {
  return (
    <DialogFooter className="border-t px-6 pt-3 pb-5">
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button type="button" onClick={handleSave}>
        Save changes
      </Button>
    </DialogFooter>
  );
}

function ItemsTable({
  tableData,
  calculateItemTotal,
  handleNameChange,
  handlePriceChange,
  handleQuantityChange,
  removeItemFromTable,
}: {
  tableData: TableItem[];
  calculateItemTotal: (item: {
    id: number;
    price: number;
    quantity: number;
  }) => number;
  handleNameChange: (id: number, value: string) => void;
  handlePriceChange: (id: number, value: number) => void;
  handleQuantityChange: (id: number, value: number) => void;
  removeItemFromTable: (id: number) => void;
}) {
  return (
    <div className="px-6">
      <Table className="overflow-x-hidden overflow-y-hidden">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((item) => {
            const total = calculateItemTotal(item);
            return (
              <TableRow key={`${item.id}-table-row`}>
                <TableCell>
                  <Input
                    value={item.name}
                    onChange={(e) => {
                      handleNameChange(item.id, e.target.value);
                    }}
                    className="h-7 min-w-40"
                  />
                </TableCell>
                <TableCell>
                  <AmountInput
                    value={((item.price ?? 0) / 100).toString() ?? ''}
                    onChange={(value) => {
                      handlePriceChange(item.id, Number(value) * 100);
                    }}
                    className="h-7 min-w-24"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      handleQuantityChange(item.id, Number(e.target.value));
                    }}
                    className="h-7 min-w-16"
                  />
                </TableCell>
                <TableCell>{formatCentsToDollarsString(total)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItemFromTable(item.id)}
                    className="hover:text-destructive"
                  >
                    <Trash2Icon />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
