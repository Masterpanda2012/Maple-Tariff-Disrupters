/**
 * Wraps every route segment — adds a short enter animation on navigation.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-page-enter motion-reduce:animate-none motion-reduce:opacity-100">
      {children}
    </div>
  );
}
