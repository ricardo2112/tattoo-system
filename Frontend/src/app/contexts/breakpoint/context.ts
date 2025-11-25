import { createSafeContext } from "@/utils/createSafeContext";

export interface BreakpointContextValue {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: "mobile" | "tablet" | "desktop";
}

export const [BreakpointContext, useBreakpointContext] =
  createSafeContext<BreakpointContextValue>(
    "useBreakpointContext must be used within BreakpointProvider"
  );
