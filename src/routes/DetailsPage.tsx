import { Calendar, Clock, Play } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ErrorState } from "@/components/domain/ErrorState";
import { GenrePills } from "@/components/domain/GenrePills";
import { RatingBadge } from "@/components/domain/RatingBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMovieDetails, useTvDetails } from "@/hooks/useCatalog";
import { useWatchlist } from "@/hooks/useStores";
import { formatEpisodes, formatRuntime, formatYear } from "@/lib/format";
import { catalog } from "@/services/catalog";

export function DetailsPage() {
	const { pathname } = useLocation();
	if (pathname.startsWith("/tv/")) return <TvDetails />;
	return <MovieDetails />;
}

function useNumericId(): number {
	const { id } = useParams();
	const n = Number(id);
	if (!Number.isInteger(n) || n <= 0)
		throw new Error(`Invalid id in URL: ${id}`);
	return n;
}

function MovieDetails() {
	const id = useNumericId();
	const { data, loading, error } = useMovieDetails(id);
	const { isSaved, toggle } = useWatchlist();
	if (loading) return <DetailsSkeleton />;
	if (error || !data)
		return (
			<ErrorState
				message={error ?? "Not found"}
				onRetry={() => window.location.reload()}
			/>
		);
	const backdrop = catalog.backdrop(data.backdropPath, "original");
	const poster = catalog.poster(data.posterPath, "w500");
	return (
		<article>
			<div className="relative -mx-4 h-[45vh] min-h-[320px]">
				{backdrop ? (
					<img
						src={backdrop}
						alt=""
						aria-hidden
						className="absolute inset-0 h-full w-full object-cover"
					/>
				) : null}
				<div
					className="absolute inset-0 bg-gradient-to-t from-base via-base/50 to-transparent"
					aria-hidden
				/>
			</div>
			<div className="-mt-32 flex flex-col gap-6 px-2 sm:flex-row">
				{poster ? (
					<img
						src={poster}
						alt={data.title}
						className="w-40 shrink-0 rounded-lg sm:w-56"
					/>
				) : null}
				<div className="min-w-0">
					<h1 className="font-display text-3xl font-black sm:text-5xl">
						{data.title}
					</h1>
					{data.tagline ? (
						<p className="mt-1 italic text-muted">{data.tagline}</p>
					) : null}
					<div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
						<RatingBadge value={data.voteAverage} />
						<span className="inline-flex items-center gap-1">
							<Calendar className="h-4 w-4" aria-hidden />
							{formatYear(data.date)}
						</span>
						{formatRuntime(data.runtime) ? (
							<span className="inline-flex items-center gap-1">
								<Clock className="h-4 w-4" aria-hidden />
								{formatRuntime(data.runtime)}
							</span>
						) : null}
					</div>
					<div className="mt-3">
						<GenrePills names={data.genres.map((g) => g.name)} />
					</div>
					<p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-200 sm:text-base">
						{data.overview}
					</p>
					<div className="mt-5 flex gap-3">
						<Button
							size="lg"
							className="bg-gold font-bold text-black hover:bg-gold/90"
							render={<Link to={`/watch/movie/${data.id}`} />}
						>
							<Play className="h-5 w-5 fill-current" aria-hidden /> Play
						</Button>
						<Button
							size="lg"
							variant={isSaved("movie", data.id) ? "secondary" : "outline"}
							onClick={() =>
								toggle({
									mediaType: "movie",
									id: data.id,
									title: data.title,
									posterPath: data.posterPath,
									addedAt: Date.now(),
								})
							}
						>
							{isSaved("movie", data.id) ? "Saved" : "Watchlist"}
						</Button>
					</div>
				</div>
			</div>
			<CastStrip cast={data.cast} />
		</article>
	);
}

function TvDetails() {
	const id = useNumericId();
	const { data, loading, error } = useTvDetails(id);
	const { isSaved, toggle } = useWatchlist();
	if (loading) return <DetailsSkeleton />;
	if (error || !data)
		return (
			<ErrorState
				message={error ?? "Not found"}
				onRetry={() => window.location.reload()}
			/>
		);
	const firstSeason = data.seasons[0]?.seasonNumber ?? 1;
	const backdrop = catalog.backdrop(data.backdropPath, "original");
	const poster = catalog.poster(data.posterPath, "w500");
	return (
		<article>
			<div className="relative -mx-4 h-[45vh] min-h-[320px]">
				{backdrop ? (
					<img
						src={backdrop}
						alt=""
						aria-hidden
						className="absolute inset-0 h-full w-full object-cover"
					/>
				) : null}
				<div
					className="absolute inset-0 bg-gradient-to-t from-base via-base/50 to-transparent"
					aria-hidden
				/>
			</div>
			<div className="-mt-32 flex flex-col gap-6 px-2 sm:flex-row">
				{poster ? (
					<img
						src={poster}
						alt={data.title}
						className="w-40 shrink-0 rounded-lg sm:w-56"
					/>
				) : null}
				<div className="min-w-0">
					<h1 className="font-display text-3xl font-black sm:text-5xl">
						{data.title}
					</h1>
					{data.tagline ? (
						<p className="mt-1 italic text-muted">{data.tagline}</p>
					) : null}
					<div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
						<RatingBadge value={data.voteAverage} />
						<span className="inline-flex items-center gap-1">
							<Calendar className="h-4 w-4" aria-hidden />
							{formatYear(data.date)}
						</span>
						<span>
							{data.numberOfSeasons} season
							{data.numberOfSeasons === 1 ? "" : "s"}
						</span>
					</div>
					<div className="mt-3">
						<GenrePills names={data.genres.map((g) => g.name)} />
					</div>
					<p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-200 sm:text-base">
						{data.overview}
					</p>
					<div className="mt-5 flex gap-3">
						<Button
							size="lg"
							className="bg-gold font-bold text-black hover:bg-gold/90"
							render={<Link to={`/watch/tv/${data.id}?s=${firstSeason}&e=1`} />}
						>
							<Play className="h-5 w-5 fill-current" aria-hidden /> Play
						</Button>
						<Button
							size="lg"
							variant={isSaved("tv", data.id) ? "secondary" : "outline"}
							onClick={() =>
								toggle({
									mediaType: "tv",
									id: data.id,
									title: data.title,
									posterPath: data.posterPath,
									addedAt: Date.now(),
								})
							}
						>
							{isSaved("tv", data.id) ? "Saved" : "Watchlist"}
						</Button>
					</div>
				</div>
			</div>
			<section aria-label="Seasons" className="mt-10">
				<h2 className="mb-3 font-display text-xl font-bold">Seasons</h2>
				<ol className="grid gap-3 sm:grid-cols-2">
					{data.seasons.map((s) => (
						<li key={s.seasonNumber}>
							<Link
								to={`/watch/tv/${data.id}?s=${s.seasonNumber}&e=1`}
								className="flex items-center gap-3 rounded-lg bg-surface p-3 hover:ring-1 hover:ring-gold"
							>
								<span className="font-display text-2xl font-black text-gold">
									{s.seasonNumber}
								</span>
								<span>
									<span className="block text-sm font-semibold">{s.name}</span>
									<span className="block text-xs text-muted">
										{formatEpisodes(s.episodeCount)}
									</span>
								</span>
							</Link>
						</li>
					))}
				</ol>
			</section>
			<CastStrip cast={data.cast} />
		</article>
	);
}

function DetailsSkeleton() {
	return (
		<div className="py-8">
			<Skeleton className="h-[40vh] w-full rounded-xl" />
			<Skeleton className="mt-4 h-10 w-2/3" />
			<Skeleton className="mt-2 h-4 w-full" />
			<Skeleton className="mt-2 h-4 w-5/6" />
		</div>
	);
}

function CastStrip({
	cast,
}: {
	cast: { name: string; character: string; profilePath: string | null }[];
}) {
	if (cast.length === 0) return null;
	return (
		<section aria-label="Cast" className="mt-10">
			<h2 className="mb-3 font-display text-xl font-bold">Cast</h2>
			<div className="flex gap-3 overflow-x-auto pb-2">
				{cast.map((c) => {
					const photo = catalog.profile(c.profilePath);
					return (
						<div key={c.name} className="w-24 shrink-0 text-center">
							<div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface">
								{photo ? (
									<img
										src={photo}
										alt={c.name}
										loading="lazy"
										className="h-full w-full object-cover"
									/>
								) : null}
							</div>
							<p className="mt-1 truncate text-xs font-medium">{c.name}</p>
							<p className="truncate text-xs text-muted">{c.character}</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}
