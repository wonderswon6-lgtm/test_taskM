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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TasksContext } from '@/context/TasksContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  generateListIcon,
  type GenerateListIconInput,
} from '@/ai/flows/generate-list-icon';

export function AddListDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { addList } = useContext(TasksContext);
  const { toast } = useToast();

  const handleAddList = async () => {
    if (listName.trim()) {
      setIsGenerating(true);
      try {
        const iconInput: GenerateListIconInput = { listName: listName.trim() };
        const result = await generateListIcon(iconInput);
        
        // The API returns an SVG string, often wrapped in markdown.
        // We need to extract the raw SVG.
        const svgMatch = result.svg.match(/<svg.*<\/svg>/s);
        const svgString = svgMatch ? svgMatch[0] : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>';

        addList(listName.trim(), svgString);
        setListName('');
        setOpen(false);
      } catch (error) {
        console.error('Failed to generate icon:', error);
        toast({
          title: 'Icon Generation Failed',
          description: 'Could not generate an icon. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
          <DialogDescription>
            Give your new list a name. An AI-generated icon will be created for it.
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
          <Button onClick={handleAddList} disabled={isGenerating || !listName.trim()}>
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? 'Creating...' : 'Create List'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
