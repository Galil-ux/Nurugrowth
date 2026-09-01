import { useState, useEffect } from 'react';

const STORAGE_KEY = 'nurugrowth_interactions';

export interface UserInteractions {
  hasUsedGrowthLab: boolean;
  hasUsedQuoteTool: boolean;
  hasReadBlog: boolean;
}

const DEFAULT_INTERACTIONS: UserInteractions = {
  hasUsedGrowthLab: false,
  hasUsedQuoteTool: false,
  hasReadBlog: false,
};

export function useInteractions() {
  const [interactions, setInteractions] = useState<UserInteractions>(DEFAULT_INTERACTIONS);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setInteractions(JSON.parse(saved));
      } catch (err) {}
    }
  }, []);

  const updateInteraction = (key: keyof UserInteractions) => {
    setInteractions((prev) => {
      if (prev[key]) return prev; // already set
      const next = { ...prev, [key]: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const hasInteractedWithAll = 
    interactions.hasUsedGrowthLab && 
    interactions.hasUsedQuoteTool && 
    interactions.hasReadBlog;

  return {
    interactions,
    updateInteraction,
    hasInteractedWithAll
  };
}
