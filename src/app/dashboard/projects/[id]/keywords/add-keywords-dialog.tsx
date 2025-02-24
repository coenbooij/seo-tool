import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AddKeywordsDialogProps, KeywordData } from "./types";
import { KeywordIntent } from "@prisma/client";

export function AddKeywordsDialog({ open, onClose, onSubmit }: AddKeywordsDialogProps) {
  const [keywords, setKeywords] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Split keywords by newline and filter empty lines
      const keywordList = keywords
        .split("\n")
        .map((k) => k.trim())
        .filter(Boolean);

      const keywordData: Partial<KeywordData>[] = keywordList.map((keyword) => ({
        keyword,
        intent: KeywordIntent.INFORMATIONAL,
        searchVolume: 0,
        currentRank: null,
      }));

      await onSubmit(keywordData as KeywordData[]);
      setKeywords("");
    } catch (error) {
      console.error("Failed to add keywords:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Keywords</DialogTitle>
          <DialogDescription>
            Enter your keywords below, one per line.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Enter keywords..."
            className="min-h-[200px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!keywords.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? "Adding..." : "Add Keywords"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
