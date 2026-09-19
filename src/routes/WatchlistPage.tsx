import { BookmarkX, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/domain/EmptyState";
import { MediaCard } from "@/components/domain/MediaCard";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useStores";

export function WatchlistPage() {
	const { items, remove, clear } = useWatchlist();

	if (items.length === 0) {
		return (
			<EmptyState
				icon={BookmarkX}
				title="Your watchlist is empty"
				hint="Save movies and shows from any card or details page."
				action={<Button render={<Link to="/" />}>Browse trending</Button>}
			/>
		);
	}

	return (
		<div className="pt-6">
			<div className="flex items-center justify-between">
				<h1 className="font-display text-3xl font-black">Watchlist</h1>
				<Button variant="outline" size="sm" onClick={clear}>
					<Trash2 className="h-4 w-4" aria-hidden /> Clear all
				</Button>
			</div>
			<div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
				{items.map((e) => (
					<div
						key={`${e.mediaType}-${e.id}`}
						className="relative [&>div]:w-full"
					>
						<MediaCard
							item={{
								mediaType: e.mediaType,
								id: e.id,
								title: e.title,
								overview: "",
								posterPath: e.posterPath,
								backdropPath: null,
								date: "",
								voteAverage: 0,
								voteCount: 0,
								genreIds: [],
							}}
						/>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => remove(e.mediaType, e.id)}
							className="mt-1 w-full text-muted hover:text-white"
						>
							Remove
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
