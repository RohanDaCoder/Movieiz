import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { DiscoverSort, Genre, MediaType } from "@/lib/types";

export interface FilterState {
	type: MediaType;
	year: string;
	genreIds: number[];
	minRating: number;
	sort: DiscoverSort;
}

interface FilterBarProps {
	genres: Genre[];
	genresLoading: boolean;
	filters: FilterState;
	onChange: (next: FilterState) => void;
}

const MOVIE_SORTS: { value: DiscoverSort; label: string }[] = [
	{ value: "popularity.desc", label: "Most popular" },
	{ value: "vote_average.desc", label: "Top rated" },
	{ value: "primary_release_date.desc", label: "Newest" },
	{ value: "title.asc", label: "Title A–Z" },
];

const TV_SORTS: { value: DiscoverSort; label: string }[] = [
	{ value: "popularity.desc", label: "Most popular" },
	{ value: "vote_average.desc", label: "Top rated" },
	{ value: "first_air_date.desc", label: "Recently aired" },
	{ value: "title.asc", label: "Title A–Z" },
];

export function sortsFor(
	type: MediaType,
): { value: DiscoverSort; label: string }[] {
	return type === "movie" ? MOVIE_SORTS : TV_SORTS;
}

const YEARS = Array.from({ length: 40 }, (_, i) =>
	String(new Date().getFullYear() - i),
);

export function FilterBar({
	genres,
	genresLoading,
	filters,
	onChange,
}: FilterBarProps) {
	const set = (patch: Partial<FilterState>) => {
		const next = { ...filters, ...patch };
		if (patch.type && patch.type !== filters.type) {
			const valid = sortsFor(patch.type).some((s) => s.value === next.sort);
			if (!valid) next.sort = "popularity.desc";
		}
		onChange(next);
	};

	return (
		<div className="mt-4 grid gap-3 rounded-xl bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
			{/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI Select trigger is a custom button control nested in the label */}
			<label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
				Type
				<Select
					value={filters.type}
					onValueChange={(v) => set({ type: v as MediaType })}
				>
					<SelectTrigger aria-label="Type">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="movie">Movies</SelectItem>
						<SelectItem value="tv">TV Shows</SelectItem>
					</SelectContent>
				</Select>
			</label>
			{/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI Select trigger is a custom button control nested in the label */}
			<label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
				Year
				<Select
					value={filters.year}
					onValueChange={(v) => set({ year: v ?? "" })}
				>
					<SelectTrigger aria-label="Year">
						<SelectValue placeholder="Any" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">Any</SelectItem>
						{YEARS.map((y) => (
							<SelectItem key={y} value={y}>
								{y}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</label>
			<div className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
				<span>
					Min rating:{" "}
					{filters.minRating === 0 ? "Any" : `${filters.minRating}+`}
				</span>
				<Slider
					aria-label="Minimum rating"
					min={0}
					max={9}
					step={1}
					value={[filters.minRating]}
					onValueChange={(v) =>
						set({ minRating: (Array.isArray(v) ? v[0] : v) ?? 0 })
					}
				/>
			</div>
			{/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI Select trigger is a custom button control nested in the label */}
			<label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
				Sort
				<Select
					value={filters.sort}
					onValueChange={(v) => set({ sort: v as DiscoverSort })}
				>
					<SelectTrigger aria-label="Sort">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{sortsFor(filters.type).map((s) => (
							<SelectItem key={s.value} value={s.value}>
								{s.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</label>
			<fieldset className="sm:col-span-2 lg:col-span-4">
				<legend className="text-xs font-semibold uppercase tracking-wide text-muted">
					Genres
				</legend>
				<div className="mt-2 flex flex-wrap gap-1.5">
					{genresLoading ? (
						<span className="text-sm text-muted">Loading genres…</span>
					) : (
						genres.map((g) => {
							const active = filters.genreIds.includes(g.id);
							return (
								<Button
									key={g.id}
									size="sm"
									variant={active ? "default" : "outline"}
									aria-pressed={active}
									onClick={() =>
										set({
											genreIds: active
												? filters.genreIds.filter((id) => id !== g.id)
												: [...filters.genreIds, g.id],
										})
									}
								>
									{g.name}
								</Button>
							);
						})
					)}
				</div>
			</fieldset>
		</div>
	);
}
