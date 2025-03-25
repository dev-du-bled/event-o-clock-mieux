"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

/**
 * ThemeProvider component for managing theme (light/dark) settings in the application.
 * This component wraps the Next.js app with the `ThemeProvider` from `next-themes` to handle theme management.
 * It passes the provided props to the `NextThemesProvider` and renders the children components inside it.
 *
 * @param {ThemeProviderProps} param0 - Props passed to the NextThemesProvider component, including the children.
 * @returns {JSX.Element} The rendered ThemeProvider component.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
