import React from "react";
import type { InstantlyClient } from "instantly-client";
import { instantlyClient } from "./instantlyClient";

const InstantlyClientContext = React.createContext<InstantlyClient | undefined>(
  undefined
);

export const InstantlyClientProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return (
    <InstantlyClientContext.Provider value={instantlyClient}>
      {children}
    </InstantlyClientContext.Provider>
  );
};

export function useInstantlyClient(): InstantlyClient {
  const context = React.useContext(InstantlyClientContext);
  if (context === undefined) {
    throw new Error(
      "useInstantlyClient must be used within a InstantlyClientProvider"
    );
  }
  return context;
}
