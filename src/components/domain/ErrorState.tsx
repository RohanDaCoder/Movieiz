import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
	message,
	onRetry,
}: {
	message: string;
	onRetry: () => void;
}) {
	return (
		<div className="flex flex-col items-center gap-3 py-16 text-center">
			<TriangleAlert className="h-10 w-10 text-gold" aria-hidden />
			<p className="text-lg font-semibold">Something went wrong</p>
			<p className="max-w-sm text-sm text-muted">{message}</p>
			<Button onClick={onRetry}>Try again</Button>
		</div>
	);
}
