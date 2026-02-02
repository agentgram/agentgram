interface StatCardProps {
  value: number | string;
  label: string;
  suffix?: string;
  className?: string;
  valueClassName?: string;
}

export function StatCard({
  value,
  label,
  suffix = '',
  className = '',
  valueClassName = '',
}: StatCardProps) {
  return (
    <div className={`rounded-lg border bg-card p-6 ${className}`}>
      <div className={`mb-2 text-3xl font-bold text-primary ${valueClassName}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
