import { Clapperboard, History, ListVideo, Search } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const linkClass = ({ isActive }: { isActive: boolean }) =>
	cn(
		"inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
		isActive
			? "bg-surface text-gold"
			: "text-zinc-300 hover:bg-surface hover:text-white",
	);

export function AppHeader() {
	return (
		<header className="sticky top-0 z-40 border-b border-white/10 bg-base/90 backdrop-blur">
			<div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
				<Link
					to="/"
					className="mr-2 inline-flex items-center gap-2 font-display text-2xl font-black tracking-tight"
				>
					<Clapperboard className="h-6 w-6 text-gold" aria-hidden />
					Movieiz
				</Link>
				<nav className="ml-auto flex items-center gap-1" aria-label="Primary">
					<NavLink to="/search" className={linkClass}>
						<Search className="h-4 w-4" aria-hidden /> Search
					</NavLink>
					<NavLink to="/watchlist" className={linkClass}>
						<ListVideo className="h-4 w-4" aria-hidden /> Watchlist
					</NavLink>
					<NavLink to="/history" className={linkClass}>
						<History className="h-4 w-4" aria-hidden /> History
					</NavLink>
				</nav>
			</div>
		</header>
	);
}
