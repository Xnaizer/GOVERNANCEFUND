import type { ComponentProps } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/utils/cn";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center h-8",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-1 top-1 size-7 bg-transparent p-0 opacity-60 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-1 top-1 size-7 bg-transparent p-0 opacity-60 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.75rem]",
        week: "flex w-full mt-1.5",
        day: "size-8 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100",
        ),
        selected:
          "[&>button]:bg-brand-blue [&>button]:text-white [&>button:hover]:bg-brand-blue [&>button:hover]:text-white rounded-md",
        today: "[&>button]:border [&>button]:border-brand-blue/40 rounded-md",
        outside: "text-muted-foreground/50",
        disabled: "text-muted-foreground opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: c }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", c)} />
          ) : (
            <ChevronRight className={cn("size-4", c)} />
          ),
      }}
      {...props}
    />
  );
}
