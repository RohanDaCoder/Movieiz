import { Bookmark, BookmarkCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { RatingBadge } from "@/components/domain/RatingBadge";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useStores";
import { formatYear } from "@/lib/format";
import type { MediaItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { catalog } from "@/services/catalog";

interface MediaCardProps {
	item: MediaItem;
	size?: "sm" | "md";
}

export function MediaCard({ item, size = "md" }: MediaCardProps) {
	const { isSaved, toggle } = useWatchlist();
	const saved = isSaved(item.mediaType, item.id);
	const detailsPath = `/${item.mediaType}/${item.id}`;
	const poster = catalog.poster(item.posterPath, "w342");

	return (
		<div
			className={cn(
				"group relative shrink-0",
				size === "md" ? "w-36 sm:w-44" : "w-28 sm:w-32",
			)}
		>
			<Link to={detailsPath} aria-label={item.title}>
				<div className="aspect-[2/3] overflow-hidden rounded-lg bg-surface">
					{poster ? (
						<img
							src={poster}
							alt={item.title}
							loading="lazy"
							className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-muted">
							{item.title}
						</div>
					)}
				</div>
			</Link>
			{item.voteCount > 0 ? (
				<RatingBadge
					value={item.voteAverage}
					className="absolute left-1.5 top-1.5"
				/>
			) : null}
			<Button
				variant="ghost"
				size="icon"
				aria-label={saved ? "Remove from watchlist" : "Save to watchlist"}
				aria-pressed={saved}
				onClick={() =>
					toggle({
						mediaType: item.mediaType,
						id: item.id,
						title: item.title,
						posterPath: item.posterPath,
						addedAt: Date.now(),
					})
				}
				className="absolute right-1.5 top-1.5 h-7 w-7 bg-black/70 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
			>
				{saved ? (
					<BookmarkCheck className="h-4 w-4 text-gold" />
				) : (
					<Bookmark className="h-4 w-4" />
				)}
			</Button>
			<div className="mt-1.5 px-0.5">
				<Link
					to={detailsPath}
					className="block truncate text-sm font-medium hover:text-gold"
				>
					{item.title}
				</Link>
				<p className="text-xs text-muted">{formatYear(item.date)}</p>
			</div>
		</div>
	);
}
