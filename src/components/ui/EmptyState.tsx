export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-20 text-center">
      <p className="text-[15px] text-text-secondary">{title}</p>
      {description ? <p className="max-w-xs text-[13px] text-text-tertiary">{description}</p> : null}
    </div>
  );
}
