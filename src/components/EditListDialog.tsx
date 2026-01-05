'use client';
import { useState, useContext, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TasksContext } from '@/context/TasksContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TaskList } from '@/lib/types';

interface EditListDialogProps {
  list: TaskList;
  children: React.ReactNode;
}

export function EditListDialog({ list, children }: EditListDialogProps) {
  const [open, setOpen] = useState(false);
  const [listName, setListName] = useState(list.name);
  const [isGenerating, setIsGenerating] = useState(false);
  const { renameList } = useContext(TasksContext);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setListName(list.name);
    }
  }, [open, list.name]);

  const handleRenameList = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    if (listName.trim() && listName.trim() !== list.name) {
      setIsGenerating(true);
      try {
        await renameList(list.id, listName.trim());
        toast({
            title: "List Renamed",
            description: `Your list has been renamed to "${listName.trim()}".`
        })
        setOpen(false);
      } catch (error) {
        console.error('Failed to rename list:', error);
        toast({
          title: 'Rename Failed',
          description: 'Could not rename the list. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsGenerating(false);
      }
    } else {
        setOpen(false);
    }
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={handleTriggerClick}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Rename List</DialogTitle>
          <DialogDescription>
            Give your list a new name. A new icon may be generated.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Groceries, Vacation Prep..."
              disabled={isGenerating}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>Cancel</Button>
          <Button onClick={handleRenameList} disabled={isGenerating || !listName.trim()}>
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? 'Renaming...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
