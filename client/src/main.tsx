import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { CableProvider } from "@/providers/action-cable-provider.tsx";
import { ThemeProvider } from "@/providers/theme-provider.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <TooltipProvider>
        <CableProvider>
          <App />
        </CableProvider>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
);
