import { ErrorState } from "@/components/domain/ErrorState";
import { Hero } from "@/components/domain/Hero";
import { MediaRow } from "@/components/domain/MediaRow";
import { useTopRated, useTrending } from "@/hooks/useCatalog";

export function HomePage() {
	const movies = useTrending("movie");
	const tv = useTrending("tv");
	const topMovies = useTopRated("movie");
	const topTv = useTopRated("tv");

	if (movies.error ?? tv.error) {
		return (
			<ErrorState
				message={movies.error ?? tv.error ?? ""}
				onRetry={() => window.location.reload()}
			/>
		);
	}

	const heroItems = [...(movies.data ?? []), ...(tv.data ?? [])].slice(0, 7);
	return (
		<>
			{!movies.loading && heroItems.length > 0 ? (
				<Hero items={heroItems} />
			) : null}
			<MediaRow
				title="Trending Movies"
				items={movies.data ?? []}
				loading={movies.loading}
			/>
			<MediaRow
				title="Trending TV Shows"
				items={tv.data ?? []}
				loading={tv.loading}
			/>
			<MediaRow
				title="Top Rated Movies"
				items={topMovies.data ?? []}
				loading={topMovies.loading}
			/>
			<MediaRow
				title="Top Rated TV Shows"
				items={topTv.data ?? []}
				loading={topTv.loading}
			/>
		</>
	);
}
