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
import { setHours, setMinutes, format } from 'date-fns';

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
  const [date, setDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [hour, setHour] = useState<string>(
    initialDate ? format(new Date(initialDate), 'HH') : '09'
  );
  const [minute, setMinute] = useState<string>(
    initialDate ? format(new Date(initialDate), 'mm') : '00'
  );

  useEffect(() => {
    if (initialDate) {
      const d = new Date(initialDate);
      setDate(d);
      setHour(format(d, 'HH'));
      setMinute(format(d, 'mm'));
    } else {
      const now = new Date();
      setDate(now);
      setHour(format(now, 'HH'));
      setMinute('00');
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
        newDate.setHours(originalDate.getHours());
        newDate.setMinutes(originalDate.getMinutes());
        setDate(newDate);
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
