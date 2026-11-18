interface StatTileProps {
  label: string
  value: string
  hint?: string
}

export const StatTile = ({ label, value, hint }: StatTileProps) => (
  <div className="flex-1 rounded-2xl bg-surface p-3">
    <p className="text-xs text-muted">{label}</p>
    <p className="mt-1 font-heading text-2xl font-semibold">{value}</p>
    {hint && <p className="text-xs text-muted">{hint}</p>}
  </div>
)
