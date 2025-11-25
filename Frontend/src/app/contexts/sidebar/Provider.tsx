import { ReactNode, useState } from "react";
import { SidebarContext, type SidebarContextValue } from "./context";

// ----------------------------------------------------------------------

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggle = () => setIsOpen((prev) => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const contextValue: SidebarContextValue = {
    isOpen,
    toggle,
    open,
    close,
  };

  return <SidebarContext value={contextValue}>{children}</SidebarContext>;
}
