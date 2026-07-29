'use client';

import React, { createContext, useContext, useState } from 'react';

export type InspectorType = 'ticket' | 'pull-request' | 'audit' | 'connection' | 'generic' | null;

interface InspectorContextType {
  isOpen: boolean;
  type: InspectorType;
  item: any;
  openInspector: (type: InspectorType, item: any) => void;
  closeInspector: () => void;
}

const InspectorContext = createContext<InspectorContextType>({
  isOpen: false,
  type: null,
  item: null,
  openInspector: () => {},
  closeInspector: () => {},
});

export function InspectorProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<InspectorType>(null);
  const [item, setItem] = useState<any>(null);

  const openInspector = (newType: InspectorType, newItem: any) => {
    setType(newType);
    setItem(newItem);
    setIsOpen(true);
  };

  const closeInspector = () => {
    setIsOpen(false);
  };

  return (
    <InspectorContext.Provider value={{ isOpen, type, item, openInspector, closeInspector }}>
      {children}
    </InspectorContext.Provider>
  );
}

export function useInspector() {
  return useContext(InspectorContext);
}
