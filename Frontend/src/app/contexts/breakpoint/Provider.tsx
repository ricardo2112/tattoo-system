import { ReactNode, useState, useEffect } from "react";
import { BreakpointContext, type BreakpointContextValue } from "./context";
import { useMediaQuery } from "@/hooks/index";

// ----------------------------------------------------------------------

export function BreakpointProvider({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const getBreakpoint = (): "mobile" | "tablet" | "desktop" => {
    if (isMobile) return "mobile";
    if (isTablet) return "tablet";
    return "desktop";
  };

  const contextValue: BreakpointContextValue = {
    isMobile,
    isTablet,
    isDesktop,
    breakpoint: getBreakpoint(),
  };

  return (
    <BreakpointContext value={contextValue}>{children}</BreakpointContext>
  );
}
