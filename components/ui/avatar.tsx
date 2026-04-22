import { cn } from "@/lib/utils/cn";

export function Avatar({
  initials,
  color,
  size = "md"
}: {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = {
    sm: "h-5 w-5 text-[10px]",
    md: "h-7 w-7 text-xs",
    lg: "h-10 w-10 text-[15px]"
  }[size];

  return (
    <div className={cn("grid place-items-center rounded-full font-bold text-white", sizeClass)} style={{ background: color }}>
      {initials}
    </div>
  );
}
