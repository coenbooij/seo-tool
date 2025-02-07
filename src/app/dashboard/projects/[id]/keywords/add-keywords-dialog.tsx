'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export interface AddKeywordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (keywords: string[]) => void;
}

export function AddKeywordsDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddKeywordsDialogProps) {
  const [keywords, setKeywords] = useState<string>('');

  const handleSubmit = () => {
    const keywordList = keywords
      .split('\n')
      .map(k => k.trim())
      .filter(Boolean);

    if (keywordList.length > 0) {
      onSubmit(keywordList);
      setKeywords('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Keywords</DialogTitle>
          <DialogDescription>
            Enter your keywords below, one per line
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Enter keywords here..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="min-h-[200px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Keywords</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}