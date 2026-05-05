/// <reference types="react" />
/// <reference types="react-dom" />

// Ensure react-dom/client is recognized when @types packages aren't installed.
declare module "react-dom/client" {
  import { ReactNode } from "react";
  interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }
  export function createRoot(container: Element | DocumentFragment, options?: { identifierPrefix?: string }): Root;
  export function hydrateRoot(container: Element | Document, initialChildren: ReactNode, options?: { identifierPrefix?: string; onRecoverableError?: (error: unknown) => void }): Root;
}
