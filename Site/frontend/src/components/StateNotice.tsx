type StateNoticeVariant = "empty" | "success" | "error";

const variantStyles: Record<StateNoticeVariant, string> = {
  empty: "border-white/20 bg-white/5 text-white/70",
  success: "border-emerald-300/40 bg-emerald-500/15 text-emerald-100",
  error: "border-red-300/40 bg-red-500/10 text-red-100",
};

export function StateNotice({
  title,
  description,
  variant = "empty",
}: {
  title: string;
  description?: string;
  variant?: StateNoticeVariant;
}) {
  return (
    <div className={`rounded-lg border p-3 ${variantStyles[variant]}`} role={variant === "error" ? "alert" : "status"}>
      <div className="text-sm font-medium">{title}</div>
      {description && <p className="mt-1 text-xs opacity-90">{description}</p>}
    </div>
  );
}
