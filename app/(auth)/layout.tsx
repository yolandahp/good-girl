export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center">
          <span className="font-display text-lg font-bold tracking-tight">
            Be the Good Girl
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
