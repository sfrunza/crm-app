import * as React from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

function ContentTabs({
  children,
  className,
  ...props
}: {
  children: React.ReactNode
  className?: string
  props?: React.ComponentPropsWithoutRef<typeof ScrollArea>
}) {
  return (
    <ScrollArea
      data-slot="content-tabs-list"
      className={cn("h-auto w-full px-4 whitespace-nowrap", className)}
      {...props}
    >
      <div className="flex flex-row gap-2 *:flex-1">{children}</div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  )
}

function ContentTab({
  className,
  isActive,
  onTabClick,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  isActive?: boolean
  onTabClick?: () => void
}) {
  return (
    <button
      data-slot="content-tab"
      data-active={isActive}
      className={cn(
        "group min-w-[140px] cursor-pointer gap-1.5 rounded-lg border bg-card px-2.5 py-3 text-start whitespace-nowrap text-muted-foreground transition-all hover:border-primary/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring",
        "data-[active=true]:border-primary data-[active=true]:text-primary data-[active=true]:shadow-[inset_0_0_0_0.5px_var(--color-primary)] dark:data-[active=true]:text-primary-foreground",
        className
      )}
      onClick={onTabClick}
      {...props}
    >
      {children}
    </button>
  )
}

function ContentHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="content-header"
      className={cn(
        "grid-rows-auto grid auto-rows-min items-start gap-2 has-data-[slot=content-tab-indicator]:grid-rows-[auto_auto] has-data-[slot=ontent-tab-count]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  )
}

function ContentTabTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="content-tab-title"
      className={cn(
        "text-sm leading-none group-data-[active=true]:font-semibold",
        className
      )}
      {...props}
    />
  )
}

function ContentTabCount({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="content-tab-count"
      className={cn("text-sm font-bold", className)}
      {...props}
    />
  )
}

function ContentTabIndicator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="content-tab-indicator"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

export {
  ContentTabs,
  ContentTab,
  ContentHeader,
  ContentTabTitle,
  ContentTabCount,
  ContentTabIndicator,
}
