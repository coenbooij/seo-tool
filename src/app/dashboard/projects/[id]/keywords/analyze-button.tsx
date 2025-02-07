'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AnalyzeButtonProps } from './types';
import { useToast } from '@/components/ui/use-toast';

export function AnalyzeButton({ 
  selectedCount,
  onAnalyze
}: AnalyzeButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      
      await onAnalyze();

      toast({
        description: `Successfully analyzed ${selectedCount} keywords`
      });
    } catch (error) {
      console.error('Error analyzing keywords:', error);
      toast({
        description: 'Failed to analyze keywords',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Button
      onClick={handleAnalyze}
      disabled={isAnalyzing || !selectedCount}
      variant={selectedCount ? 'default' : 'secondary'}
    >
      {isAnalyzing ? 'Analyzing...' : selectedCount ? `Analyze ${selectedCount} Keywords` : 'Select Keywords to Analyze'}
    </Button>
  );
}