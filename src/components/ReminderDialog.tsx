'use client';

import { useState, useEffect }from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { setHours, setMinutes, format, getHours, getMinutes, parseISO } from 'date-fns';

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
  const [dateString, setDateString] = useState<string>('');
  const [hour, setHour] = useState<string>('09');
  const [minute, setMinute] = useState<string>('00');

  useEffect(() => {
    if (open) {
      // Defer state update to client-side only
      const initial = initialDate ? new Date(initialDate) : new Date();
      setDate(initial);
      setDateString(format(initial, 'yyyy-MM-dd'));
      setHour(format(initial, 'HH'));
      const initialMinutes = getMinutes(initial);
      const roundedMinute = Math.round(initialMinutes / 5) * 5;
      setMinute(roundedMinute.toString().padStart(2, '0'));
    }
  }, [open, initialDate]);

  const handleSetReminder = () => {
    if (dateString) {
      // Reconstruct the date from parts to ensure consistency
      const newDate = parseISO(dateString); // This correctly handles timezone
      let finalDate = setHours(newDate, parseInt(hour, 10));
      finalDate = setMinutes(finalDate, parseInt(minute, 10));
      onSetReminder(finalDate);
      onOpenChange(false);
    }
  };
  
  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateString = e.target.value;
    setDateString(newDateString);
  }

  // Render nothing on the server, or a placeholder, to avoid mismatch
  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Input 
            type="date"
            value={dateString}
            onChange={handleDateSelect}
            className="w-full"
            min={format(new Date(), 'yyyy-MM-dd')}
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
