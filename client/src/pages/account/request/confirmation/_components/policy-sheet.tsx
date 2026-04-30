import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SHEET_CLASS = "w-full data-[side=bottom]:h-[90vh]";
const CONTENT_CLASS = "no-scrollbar mx-auto max-w-3xl overflow-y-auto px-4";

interface PolicySheetProps {
  title: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function PolicySheet({ title, trigger, children }: PolicySheetProps) {
  return (
    <Sheet>
      <SheetTrigger className="text-primary underline hover:cursor-pointer">
        {trigger}
      </SheetTrigger>
      <SheetContent side="bottom" className={SHEET_CLASS}>
        <SheetHeader className="mx-auto w-full max-w-3xl">
          <SheetTitle className="text-2xl font-bold">{title}</SheetTitle>
          <SheetDescription className="sr-only">{title}</SheetDescription>
        </SheetHeader>
        <div className={CONTENT_CLASS}>{children}</div>
      </SheetContent>
    </Sheet>
  );
}
