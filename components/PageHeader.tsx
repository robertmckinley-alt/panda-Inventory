export function PageHeader({
  eyebrow,
  title,
  subtitle,
  right
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        {eyebrow ? <div className="h-eyebrow text-[10.5px] mb-2">{eyebrow}</div> : null}
        <h1 className="h-display text-[24px] md:text-[28px] leading-[1.05]">{title}</h1>
        {subtitle ? (
          <p className="mt-2.5 text-[13.5px] max-w-[640px]" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  );
}
