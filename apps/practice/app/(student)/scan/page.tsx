'use client';

import { PhotoUploadWorkbench } from '@/components/PhotoUploadWorkbench';

export default function ScanPage(): JSX.Element {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <a
          href="/dashboard"
          className="text-sm text-[#3FA7D6] font-semibold hover:text-[#2F8DBA] flex items-center gap-1 mb-4"
        >
          ← Volver a ejercicios
        </a>
        <h1 className="text-2xl font-bold text-[#1F2937]">Escanear hoja de ejercicios</h1>
        <p className="text-sm text-[#4F5868] mt-1">
          Toma una foto de tu hoja y te diremos qué errores cometiste.
        </p>
      </div>

      <PhotoUploadWorkbench />
    </main>
  );
}
