declare module "sonner" {
  import type { ComponentType, ReactNode } from "react";

  export interface ToasterProps {
    theme?: "light" | "dark" | "system";
    className?: string;
    toastOptions?: {
      classNames?: Record<string, string>;
    };
  }

  export const Toaster: ComponentType<ToasterProps>;
  export const toast: (message: string | { description?: ReactNode; title?: ReactNode }) => void;
}
