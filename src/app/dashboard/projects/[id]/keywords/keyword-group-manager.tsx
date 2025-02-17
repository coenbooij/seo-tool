'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeywordData, KeywordGroupData } from './types';
import { useToast } from '@/components/ui/use-toast';

interface KeywordGroupManagerProps {
  projectId: string;
  keywords: KeywordData[];
  onGroupChange: (group: KeywordGroupData) => void;
}

export function KeywordGroupManager({
  projectId,
  keywords,
  onGroupChange,
}: KeywordGroupManagerProps) {
  const [groups, setGroups] = React.useState<KeywordGroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = React.useState<KeywordGroupData | null>(null);
  const [newGroupName, setNewGroupName] = React.useState('');
  const [availableKeywords, setAvailableKeywords] = React.useState<KeywordData[]>([]);
  const { toast } = useToast();

  const fetchGroups = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/keyword-groups`);
      if (!response.ok) {
        toast({
          title: 'Error',
          description: 'Failed to load keyword groups',
          variant: 'destructive',
        });
        return;
      }
      const data = await response.json();
      setGroups(data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load keyword groups',
        variant: 'destructive',
      });
    }
  }, [projectId, toast]);

  React.useEffect(() => {
    fetchGroups();
  }, [fetchGroups, projectId]);

  React.useEffect(() => {
    if (selectedGroup) {
      // Update available keywords by filtering out keywords already in the selected group
      const groupKeywords = new Set(selectedGroup.keywords.map(k => k.keyword));
      setAvailableKeywords(keywords.filter(k => !groupKeywords.has(k.keyword)));
    } else {
      setAvailableKeywords(keywords);
    }
  }, [keywords, selectedGroup]);


  const createGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a group name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/keyword-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName }),
      });

      if (!response.ok) {
        toast({
          title: 'Error',
          description: 'Failed to create keyword group',
          variant: 'destructive',
        });
        return;
      }
      
      const newGroup = await response.json();
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setSelectedGroup(newGroup);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create keyword group',
        variant: 'destructive',
      });
    }
  };

  const addKeywordToGroup = async (keyword: KeywordData) => {
    if (!selectedGroup) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/keyword-groups/${selectedGroup.id}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.keyword }),
      });

      if (!response.ok) {
        toast({
          title: 'Error',
          description: 'Failed to add keyword to group',
          variant: 'destructive',
        });
        return;
      }

      const updatedGroup = {
        ...selectedGroup,
        keywords: [...selectedGroup.keywords, keyword],
      };
      
      setSelectedGroup(updatedGroup);
      onGroupChange(updatedGroup);
      setAvailableKeywords(availableKeywords.filter(k => k.keyword !== keyword.keyword));
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add keyword to group',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Keyword Groups</h3>
        <div className="flex gap-2">
          <Input
            placeholder="New group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <Button onClick={createGroup}>Create Group</Button>
        </div>
      </div>

      <div className="space-y-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className={`p-2 border rounded cursor-pointer ${
              selectedGroup?.id === group.id ? 'bg-primary/10' : ''
            }`}
            onClick={() => setSelectedGroup(group)}
          >
            <div className="flex justify-between items-center">
              <span>{group.name}</span>
              <span className="text-sm text-muted-foreground">
                {group.keywords.length} keywords
              </span>
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No groups created yet
          </p>
        )}
      </div>

      {selectedGroup && (
        <>
          <div className="space-y-2">
            <h4 className="font-medium">Available Keywords</h4>
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {availableKeywords.map((keyword) => (
                <div
                  key={keyword.keyword}
                  className="text-sm p-1 bg-muted/50 rounded flex justify-between items-center"
                >
                  <span>{keyword.keyword}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6"
                    onClick={() => addKeywordToGroup(keyword)}
                  >
                    Add
                  </Button>
                </div>
              ))}
              
              {availableKeywords.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No available keywords
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Keywords in {selectedGroup.name}</h4>
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {selectedGroup.keywords.map((keyword) => (
                <div
                  key={keyword.keyword}
                  className="text-sm p-1 bg-muted/50 rounded flex justify-between items-center"
                >
                  <span>{keyword.keyword}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      const updatedKeywords = selectedGroup.keywords.filter(
                        (k) => k.keyword !== keyword.keyword
                      );
                      const updatedGroup = {
                        ...selectedGroup,
                        keywords: updatedKeywords,
                      };
                      setSelectedGroup(updatedGroup);
                      onGroupChange(updatedGroup);
                      setAvailableKeywords([...availableKeywords, keyword]);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              
              {selectedGroup.keywords.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No keywords in this group
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}