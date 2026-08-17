import { ConnectionMark } from "@/components/icons/ConnectionMark";

export function EmptyState({
  title,
  description,
  mark = true,
}: {
  title: string;
  description?: string;
  /** show the quiet default-state connection mark above the copy */
  mark?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      {mark ? <ConnectionMark size={44} className="text-text-quaternary opacity-60" /> : null}
      <div className="flex flex-col gap-2">
        <p className="text-[15px] text-text-secondary">{title}</p>
        {description ? <p className="max-w-xs text-[13px] text-text-tertiary">{description}</p> : null}
      </div>
    </div>
  );
}
