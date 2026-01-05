'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { setHours, setMinutes, format, getHours, getMinutes } from 'date-fns';

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetReminder: (date: Date) => void;
  initialDate?: string;
}

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

export function ReminderDialog({
  open,
  onOpenChange,
  onSetReminder,
  initialDate,
}: ReminderDialogProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [hour, setHour] = useState<string>('09');
  const [minute, setMinute] = useState<string>('00');

  useEffect(() => {
    if (open) {
      const initial = initialDate ? new Date(initialDate) : new Date();
      setDate(initial);
      setHour(format(initial, 'HH'));
      // Round minutes to nearest 5
      const initialMinutes = getMinutes(initial);
      const roundedMinute = Math.round(initialMinutes / 5) * 5;
      setMinute(roundedMinute.toString().padStart(2, '0'));
    }
  }, [initialDate, open]);

  const handleSetReminder = () => {
    if (date) {
      let newDate = setHours(date, parseInt(hour, 10));
      newDate = setMinutes(newDate, parseInt(minute, 10));
      onSetReminder(newDate);
      onOpenChange(false);
    }
  };
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if(selectedDate) {
        const originalDate = date || new Date();
        const newDate = new Date(selectedDate);
        newDate.setHours(getHours(originalDate));
        newDate.setMinutes(getMinutes(originalDate));
        setDate(newDate);
    } else {
        setDate(undefined);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md border"
            disabled={(d) => d < new Date(new Date().toDateString())}
          />
          <div className="flex items-center gap-2">
            <Select value={hour} onValueChange={setHour}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>:</span>
            <Select value={minute} onValueChange={setMinute}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSetReminder}>Set Reminder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}