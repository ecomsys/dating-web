// components/layout/boost-bar.tsx
export function BoostBar() {
  return (
    <div className="w-full bg-card/50 border-b border-border backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-4 overflow-x-auto little-scroll">
        <span className="text-xs text-muted-foreground font-medium shrink-0">Рекомендуем:</span>
        <div className="flex gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-muted"></div>
          <div className="w-10 h-10 rounded-full bg-muted"></div>
          <div className="w-10 h-10 rounded-full bg-muted"></div>
        </div>
      </div>
    </div>
  );
}