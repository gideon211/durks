// DateTimePicker.tsx
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

interface DateTimePickerProps {
  date: Date | undefined;
  time: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
}

export function DateTimePicker({ date, time, onDateChange, onTimeChange }: DateTimePickerProps) {
  const times = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
    "04:00 PM", "05:00 PM", "06:00 PM"
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Delivery Date</label>
        <Calendar mode="single" selected={date} onSelect={onDateChange} className="rounded-lg border" />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Delivery Time</label>
        <Select value={time} onValueChange={onTimeChange}>
          <SelectTrigger className="w-full">{time || "Select time"}</SelectTrigger>
          <SelectContent>
            {times.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
