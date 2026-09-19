import { History, Play, X } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/domain/EmptyState";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/hooks/useStores";
import { catalog } from "@/services/catalog";

const HISTORY_LIMIT = 24;

export function HistoryPage() {
	const api = useProgress();
	const items = api.recent(HISTORY_LIMIT);

	if (items.length === 0) {
		return (
			<EmptyState
				icon={History}
				title="No watch history yet"
				hint="Start anything and your progress is saved here automatically."
				action={<Button render={<Link to="/" />}>Browse trending</Button>}
			/>
		);
	}

	return (
		<div className="pt-6">
			<div className="flex items-center justify-between">
				<h1 className="font-display text-3xl font-black">Continue Watching</h1>
			</div>
			<div className="mt-6 grid gap-3 sm:grid-cols-2">
				{items.map((p) => {
					const poster = catalog.poster(p.posterPath, "w342");
					const pct =
						p.duration > 0
							? Math.min(100, Math.round((p.time / p.duration) * 100))
							: 0;
					const href =
						p.mediaType === "movie"
							? `/watch/movie/${p.id}`
							: `/watch/tv/${p.id}?s=${p.season ?? 1}&e=${p.episode ?? 1}`;
					return (
						<div
							key={`${p.mediaType}-${p.id}-${p.season ?? 0}-${p.episode ?? 0}`}
							className="flex gap-3 rounded-xl bg-surface p-2"
						>
							<div className="h-28 w-20 shrink-0 overflow-hidden rounded-md bg-black">
								{poster ? (
									<img
										src={poster}
										alt=""
										aria-hidden
										loading="lazy"
										className="h-full w-full object-cover"
									/>
								) : null}
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-semibold">
									{p.title || "Untitled"}
								</p>
								<p className="text-xs text-muted">
									{p.mediaType === "tv"
										? `S${p.season ?? 1} E${p.episode ?? 1} · `
										: ""}
									{pct}% watched
								</p>
								<div
									className="mt-2 h-1.5 overflow-hidden rounded-full bg-black"
									role="progressbar"
									aria-valuenow={pct}
									aria-valuemin={0}
									aria-valuemax={100}
									aria-label={`${p.title} progress`}
								>
									<div
										className="h-full rounded-full bg-gold"
										style={{ width: `${pct}%` }}
									/>
								</div>
								<div className="mt-2 flex gap-2">
									<Button
										size="sm"
										className="bg-gold font-bold text-black hover:bg-gold/90"
										render={<Link to={href} />}
									>
										<Play className="h-4 w-4 fill-current" aria-hidden /> Resume
									</Button>
									<Button
										variant="ghost"
										size="sm"
										aria-label={`Remove ${p.title} from history`}
										onClick={() =>
											api.remove(p.mediaType, p.id, p.season, p.episode)
										}
									>
										<X className="h-4 w-4" aria-hidden />
									</Button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
