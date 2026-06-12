export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_480px]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-700 via-sky-800 to-[#0a2138] p-14 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-black">
            SP
          </div>
          <span className="text-lg font-extrabold">SuperProfes</span>
        </div>
        <div className="relative z-10 max-w-[34ch]">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Aprende de cada error, antes de la prueba.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/85">
            Detectamos el procedimiento exacto donde se traba cada alumno y asignamos práctica
            dirigida.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/80">
          <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
          Para alumnos, profesores y apoderados
        </div>
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-mint-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-28 h-96 w-96 rounded-full bg-sky-400/30 blur-3xl" />
      </aside>
      <main className="grid place-items-center bg-sky-50 p-6 sm:p-10">{children}</main>
    </div>
  );
}
