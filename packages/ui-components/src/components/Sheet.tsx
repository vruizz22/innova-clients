'use client';

import { type ReactNode } from 'react';
import { Drawer } from 'vaul';

export interface SheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly description?: string;
  /** Main content rendered below the title. */
  readonly children: ReactNode;
  /** Extra classes on the content panel (e.g. padding overrides). */
  readonly className?: string;
}

/**
 * Mobile-first bottom sheet built on vaul's Drawer. Drag to dismiss.
 * On desktop it still anchors to the bottom — consistent with modern product UX
 * (Vercel, Linear). Colours track DS tokens so dark mode works automatically.
 *
 * ```tsx
 * <Sheet open={open} onClose={() => setOpen(false)} title="Crear curso">
 *   <form>…</form>
 * </Sheet>
 * ```
 */
export function Sheet({ open, onClose, title, description, children, className }: SheetProps): JSX.Element {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-[rgba(11,18,27,0.55)] backdrop-blur-[2px]" />
        <Drawer.Content
          className={[
            'fixed bottom-0 left-0 right-0 z-50 flex max-h-[92dvh] flex-col',
            'rounded-t-3xl border-t border-[var(--border)] bg-[var(--surface)]',
            'shadow-[var(--shadow-pop)] outline-none',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {/* Drag handle */}
          <div className="flex justify-center pb-2 pt-3" aria-hidden="true">
            <div className="h-1 w-10 rounded-full bg-[var(--border)]" />
          </div>

          <div className="overflow-y-auto px-5 pb-8 pt-2">
            <Drawer.Title className="text-lg font-bold text-[var(--fg-1)]">{title}</Drawer.Title>
            {description ? (
              <Drawer.Description className="mt-1 text-sm text-[var(--fg-2)]">
                {description}
              </Drawer.Description>
            ) : null}
            <div className="mt-4">{children}</div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
