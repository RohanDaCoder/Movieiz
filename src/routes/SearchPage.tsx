import { SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/domain/EmptyState";
import { ErrorState } from "@/components/domain/ErrorState";
import { FilterBar, type FilterState } from "@/components/domain/FilterBar";
import { MediaGrid } from "@/components/domain/MediaGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiscover, useGenres, useSearch } from "@/hooks/useCatalog";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import type {
	DiscoverQuery,
	DiscoverSort,
	MediaItem,
	MediaType,
} from "@/lib/types";

type Tab = "all" | MediaType;

function parseParams(params: URLSearchParams): {
	q: string;
	tab: Tab;
	filters: FilterState;
	page: number;
} {
	const genre = params
		.getAll("genre")
		.map(Number)
		.filter((n) => Number.isInteger(n));
	const minRating = Number(params.get("minRating") ?? 0);
	return {
		q: params.get("q") ?? "",
		tab: (params.get("tab") as Tab) ?? "all",
		filters: {
			type: (params.get("type") as MediaType) ?? "movie",
			year: params.get("year") ?? "",
			genreIds: genre,
			minRating: Number.isFinite(minRating) ? minRating : 0,
			sort: (params.get("sort") as DiscoverSort) ?? "popularity.desc",
		},
		page: Math.max(1, Number(params.get("page") ?? 1) || 1),
	};
}

export function SearchPage() {
	const [params, setParams] = useSearchParams();
	const parsed = useMemo(() => parseParams(params), [params]);
	const [draft, setDraft] = useState(parsed.q);

	useEffect(() => setDraft(parsed.q), [parsed.q]);
	useEffect(() => {
		const t = setTimeout(() => {
			if (draft !== parsed.q) {
				const next = new URLSearchParams(params);
				if (draft.trim()) next.set("q", draft.trim());
				else next.delete("q");
				next.delete("page");
				setParams(next, { replace: true });
			}
		}, SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(t);
	}, [draft, parsed.q, params, setParams]);

	const searching = parsed.q.trim().length > 0;
	const search = useSearch(searching ? parsed.q : "");
	const discoverQuery: DiscoverQuery | null = searching
		? null
		: {
				type: parsed.filters.type,
				year: parsed.filters.year ? Number(parsed.filters.year) : undefined,
				genreIds: parsed.filters.genreIds,
				minRating:
					parsed.filters.minRating > 0 ? parsed.filters.minRating : undefined,
				sort: parsed.filters.sort,
				page: parsed.page,
			};
	const discover = useDiscover(discoverQuery);
	const genres = useGenres(parsed.filters.type);

	const searchItems = useMemo(() => {
		const list = search.data ?? [];
		if (parsed.tab !== "all")
			return list.filter((i) => i.mediaType === parsed.tab);
		return list;
	}, [search.data, parsed.tab]);

	// "Load more" appends: accumulate discover pages, resetting when filters change.
	const browseSignature = searching
		? ""
		: JSON.stringify({ ...discoverQuery, page: undefined });
	const [accumulated, setAccumulated] = useState<MediaItem[]>([]);
	const [lastSig, setLastSig] = useState("");
	if (!searching && lastSig !== browseSignature) {
		setLastSig(browseSignature);
		setAccumulated([]);
	}
	useEffect(() => {
		const items = discover.data?.items;
		if (searching || !items) return;
		setAccumulated((prev) => {
			const fresh = items.filter(
				(i) => !prev.some((p) => p.mediaType === i.mediaType && p.id === i.id),
			);
			return fresh.length > 0 ? [...prev, ...fresh] : prev;
		});
	}, [searching, discover.data]);

	const items = searching ? searchItems : accumulated;

	const loading = searching ? search.loading : discover.loading;
	const error = searching ? search.error : discover.error;

	const updateParams = (
		patch: Record<string, string | string[] | undefined>,
	) => {
		const next = new URLSearchParams(params);
		for (const [k, v] of Object.entries(patch)) {
			next.delete(k);
			if (v === undefined) continue;
			if (Array.isArray(v)) {
				for (const x of v) next.append(k, x);
			} else if (v !== "") next.set(k, v);
		}
		next.delete("page");
		setParams(next);
	};

	return (
		<div className="pt-6">
			<h1 className="font-display text-3xl font-black">Search & Browse</h1>
			<div className="mt-4">
				<Input
					aria-label="Search titles"
					placeholder="Search movies and shows…"
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
				/>
			</div>
			{searching ? (
				<Tabs
					value={parsed.tab}
					onValueChange={(v) =>
						updateParams({ tab: v === "all" ? undefined : v })
					}
					className="mt-4"
				>
					<TabsList aria-label="Result type">
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="movie">Movies</TabsTrigger>
						<TabsTrigger value="tv">TV Shows</TabsTrigger>
					</TabsList>
				</Tabs>
			) : (
				<FilterBar
					genres={genres.data ?? []}
					genresLoading={genres.loading}
					filters={parsed.filters}
					onChange={(f) =>
						updateParams({
							type: f.type,
							year: f.year || undefined,
							genre: f.genreIds.map(String),
							minRating: f.minRating > 0 ? String(f.minRating) : undefined,
							sort: f.sort,
						})
					}
				/>
			)}
			<div className="mt-6">
				{error ? (
					<ErrorState
						message={error}
						onRetry={() => window.location.reload()}
					/>
				) : !loading && items.length === 0 ? (
					<EmptyState
						icon={SearchX}
						title={
							searching
								? `No results for "${parsed.q}"`
								: "Nothing matches these filters"
						}
						hint={
							searching ? "Try a different title." : "Loosen a filter or two."
						}
					/>
				) : (
					<MediaGrid items={items} loading={loading} />
				)}
			</div>
			{!searching && discover.data && discover.data.totalPages > parsed.page ? (
				<div className="mt-6 flex justify-center">
					<Button
						variant="outline"
						onClick={() => {
							const next = new URLSearchParams(params);
							next.set("page", String(parsed.page + 1));
							setParams(next);
						}}
					>
						Load more
					</Button>
				</div>
			) : null}
		</div>
	);
}
