import { createSafeContext } from "@/utils/createSafeContext";

export interface BreakpointContextValue {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: "mobile" | "tablet" | "desktop";
  // Computed properties for convenience
  smAndDown: boolean;
  smAndUp: boolean;
  lgAndUp: boolean;
  isXl: boolean;
  is2xl: boolean;
  name: string;
}

export const [BreakpointContext, useBreakpointContext] =
  createSafeContext<BreakpointContextValue>(
    "useBreakpointContext must be used within BreakpointProvider"
  );
