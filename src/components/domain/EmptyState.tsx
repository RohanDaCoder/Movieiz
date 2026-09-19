import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	hint?: string;
	action?: ReactNode;
}

export function EmptyState({
	icon: Icon,
	title,
	hint,
	action,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-2 py-16 text-center">
			<Icon className="h-10 w-10 text-muted" aria-hidden />
			<p className="text-lg font-semibold">{title}</p>
			{hint ? <p className="max-w-sm text-sm text-muted">{hint}</p> : null}
			{action}
		</div>
	);
}
