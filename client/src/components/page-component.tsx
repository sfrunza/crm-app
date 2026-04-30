import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { NavLink, useLocation } from "react-router"
import { Separator } from "./ui/separator"

type PageContainerProps = React.ComponentProps<"div"> & {
  children: React.ReactNode
  className?: string
  classNameInner?: string
}

function PageContainer({
  children,
  className,
  classNameInner,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn("h-full", className)} {...props}>
      <div className={cn("mx-auto max-w-7xl pb-22", classNameInner)}>
        {children}
      </div>
    </div>
  )
}

function PageHeader({ children, className }: PageContainerProps) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "group/page-header @container/page-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 pt-1.5 group-data-[size=sm]/card:px-4 has-data-[slot=page-action]:grid-cols-[1fr_auto] has-data-[slot=page-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-4",
        className
      )}
    >
      {children}
    </div>
  )
}

function PageTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-title"
      className={cn(
        "text-xl leading-normal font-bold group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function PageDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function PageAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-center justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function PageContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-content"
      className={cn("px-4", className)}
      {...props}
    />
  )
}

function PageNavTabs({
  tabs,
  className,
}: {
  tabs: { name: string; href: string }[]
  className?: string
}) {
  const location = useLocation()
  const pathname = location.pathname.split("/").pop()
  const defaultValue = tabs.find((tab) => tab.href === pathname)?.href

  return (
    <nav className={className}>
      <Tabs defaultValue={defaultValue}>
        <ScrollArea className="h-10">
          <TabsList variant="line">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.href}
                value={tab.href}
                data-state={tab.href === defaultValue ? "active" : ""}
                asChild
              >
                <NavLink to={tab.href}>{tab.name}</NavLink>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </Tabs>
      <Separator className="-mt-1" />
    </nav>
  )
}

export {
  PageAction,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageNavTabs,
  PageTitle,
}
