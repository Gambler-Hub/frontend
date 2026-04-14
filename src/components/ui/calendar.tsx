"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-on-surface",
        nav: "flex items-center gap-1",
        button_previous: cn(
          "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "inline-flex items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        ),
        button_next: cn(
          "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "inline-flex items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-on-surface-variant rounded-md w-9 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm relative p-0 focus-within:relative focus-within:z-20",
        day_button: cn(
          "h-9 w-9 p-0 font-normal rounded-md",
          "text-on-surface hover:bg-surface-container hover:text-on-surface",
          "focus:outline-none focus:ring-1 focus:ring-primary/40"
        ),
        selected: "bg-primary text-on-primary rounded-md hover:bg-primary hover:text-on-primary focus:bg-primary focus:text-on-primary",
        today: "bg-surface-container-high text-on-surface rounded-md",
        outside: "text-on-surface-variant/40 opacity-50",
        disabled: "text-on-surface-variant opacity-50",
        range_middle: "aria-selected:bg-surface-container aria-selected:text-on-surface",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" {...(iconProps as React.SVGProps<SVGSVGElement>)} />
          ) : (
            <ChevronRight className="h-4 w-4" {...(iconProps as React.SVGProps<SVGSVGElement>)} />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
