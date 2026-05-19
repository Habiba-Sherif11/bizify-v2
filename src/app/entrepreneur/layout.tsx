export default function EntrepreneurLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <main>{children}</main>
    </div>
  );
}
