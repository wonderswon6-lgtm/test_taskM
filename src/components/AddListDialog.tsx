'use client';
import { useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TasksContext } from '@/context/TasksContext';
import {
  Briefcase,
  Home,
  List,
  Music,
  Palette,
  Plane,
  BookOpen,
  ShoppingCart,
} from 'lucide-react';

const icons = {
  List,
  Briefcase,
  Music,
  Plane,
  BookOpen,
  Home,
  Palette,
  ShoppingCart,
};
const iconNames = Object.keys(icons);

export function AddListDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(iconNames[0]);
  const { addList } = useContext(TasksContext);

  const handleAddList = () => {
    if (listName.trim()) {
      addList(listName.trim(), selectedIcon);
      setListName('');
      setSelectedIcon(iconNames[0]);
      setOpen(false);
    }
  };

  const IconComponent = icons[selectedIcon as keyof typeof icons];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
          <DialogDescription>
            Give your new list a name and choose an icon.
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
              placeholder="e.g. Groceries"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon-select" className="text-right">
              Icon
            </Label>
            <Select value={selectedIcon} onValueChange={setSelectedIcon}>
              <SelectTrigger className="col-span-3">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    <span>{selectedIcon}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {iconNames.map((iconName) => {
                  const Icon = icons[iconName as keyof typeof icons];
                  return (
                    <SelectItem key={iconName} value={iconName}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <span>{iconName}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddList}>Create List</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
