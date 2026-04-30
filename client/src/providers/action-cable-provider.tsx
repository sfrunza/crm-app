import React, { createContext, useMemo } from "react";
import type { Consumer } from "@rails/actioncable";
import consumer from "@/lib/action-cable";

const CableContext = createContext<{ consumer: Consumer }>({
  consumer: null as unknown as Consumer,
});

function CableProvider({ children }: { children: React.ReactNode }) {
  // Keep a single ActionCable consumer instance for the app lifetime.
  const value = useMemo(() => ({ consumer }), []);

  return (
    <CableContext.Provider value={value}>{children}</CableContext.Provider>
  );
}

export { CableContext, CableProvider };
