import { Star } from "lucide-react";
import { formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RatingBadge({
	value,
	className,
}: {
	value: number;
	className?: string;
}) {
	const display = formatRating(value);
	const hot = value >= 7.5;
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-semibold",
				hot ? "text-gold" : "text-zinc-200",
				className,
			)}
		>
			<Star className="h-3 w-3 fill-current" aria-hidden />
			{display}
		</span>
	);
}
