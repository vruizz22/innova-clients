declare module 'react' {
  export type ReactNode = unknown
  export type FormEvent<T = HTMLFormElement> = {
    preventDefault(): void
    currentTarget: T
    target: T
  }

  export type ChangeEvent<T = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = {
    target: T & { value: string }
  }

  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T
  export function useState<T>(initialState: T): [T, (value: T | ((current: T) => T)) => void]
}

declare namespace React {
  type ReactNode = unknown
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elementName: string]: unknown
  }
}

declare module '*.css'

declare const process: {
  env: Record<string, string | undefined>
}
