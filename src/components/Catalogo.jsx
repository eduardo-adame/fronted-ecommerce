import { useState, useEffect, useRef, useCallback } from "react";
import { apiService } from "../services/apiService";
import { useTitle } from "../hooks/useTitle";
import { Search, Filter, ShoppingCart, AlertTriangle, X } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

const defaultImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=300";

function ProductCard({ producto, isGuest }) {
	const isOutOfStock = producto.stock <= 0;

	return (
		<article className="group flex flex-col overflow-hidden rounded-xl bg-bg shadow-sm transition-shadow hover:shadow-md">
			<div className="relative aspect-[4/3] overflow-hidden bg-surface">
				<img
					src={producto.imagenUrl || defaultImage}
					alt={producto.nombre}
					loading="lazy"
					className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
					onError={(e) => { e.target.src = defaultImage; }}
				/>
				{producto.categoria && (
					<span className="absolute left-2 top-2 rounded-md bg-primary/95 px-2 py-0.5 text-xs font-semibold text-white">
						{producto.categoria.nombre}
					</span>
				)}
			</div>

			<div className="flex flex-1 flex-col gap-3 p-4">
				<div className="flex-1 space-y-1.5">
					{producto.proveedor && (
						<p className="truncate text-xs font-medium text-muted">
							{producto.proveedor.nombreEmpresa}
						</p>
					)}
					<h3 className="line-clamp-1 text-base font-bold leading-tight text-ink transition-colors group-hover:text-primary">
						{producto.nombre}
					</h3>
					<p className="line-clamp-2 text-sm leading-snug text-muted">
						{producto.descripcion || "Sin descripción disponible."}
					</p>
				</div>

				<div className="space-y-3">
					<div className="flex items-baseline justify-between">
						<span className="text-lg font-bold text-ink">
							${Number(producto.precio).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
						</span>
						<span className={`text-xs font-semibold ${isOutOfStock ? "text-error" : "text-success"}`}>
							{isOutOfStock ? "Agotado" : `${producto.stock} disp.`}
						</span>
					</div>
					<button
						disabled={isOutOfStock}
						className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
							isOutOfStock
								? "cursor-not-allowed bg-surface text-muted ring-1 ring-border"
								: "bg-primary text-white hover:bg-primary-hover active:scale-[0.98] active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50"
						}`}
					>
						<ShoppingCart className="h-4 w-4" />
						{isGuest ? "Inicia sesión para comprar" : "Agregar"}
					</button>
				</div>
			</div>
		</article>
	);
}

function ProductGridSkeleton({ count = 6 }) {
	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="overflow-hidden rounded-xl ring-1 ring-border">
					<Skeleton className="aspect-[4/3] !rounded-none" />
					<div className="space-y-3 p-4">
						<Skeleton className="h-3 w-20" />
						<Skeleton className="h-5 w-3/4" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-2/3" />
						<div className="flex items-center justify-between pt-1">
							<Skeleton className="h-6 w-24" />
							<Skeleton className="h-4 w-16" />
						</div>
						<Skeleton className="h-10 w-full !rounded-lg" />
					</div>
				</div>
			))}
		</div>
	);
}

function FilterContent({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categorias, onSelect }) {
	return (
		<div className="space-y-5 p-4">
			<div className="rounded-xl bg-surface p-4 ring-1 ring-border">
				<h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted">
					<Search className="h-3.5 w-3.5" />
					Buscar
				</h2>
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Nombre o descripción..."
					className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
				/>
			</div>

			<div className="rounded-xl bg-surface p-4 ring-1 ring-border">
				<h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted">
					<Filter className="h-3.5 w-3.5" />
					Categorías
				</h2>
				<div className="flex flex-col gap-1">
					<button
						onClick={() => { setSelectedCategory("Todos"); onSelect?.(); }}
						aria-pressed={selectedCategory === "Todos"}
						className={`w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
							selectedCategory === "Todos"
								? "bg-primary-muted font-semibold text-primary"
								: "text-muted hover:bg-surface-hover hover:text-ink active:bg-surface-hover/80"
						}`}
					>
						Todas las categorías
					</button>
					{categorias.map((cat) => (
						<button
							key={cat.id}
							onClick={() => { setSelectedCategory(cat.nombre); onSelect?.(); }}
							aria-pressed={selectedCategory === cat.nombre}
							className={`w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
								selectedCategory === cat.nombre
									? "bg-primary-muted font-semibold text-primary"
									: "text-muted hover:bg-surface-hover hover:text-ink active:bg-surface-hover/80"
							}`}
						>
							{cat.nombre}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

export const Catalogo = ({ setVistaActual, user }) => {
	const [productos, setProductos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [carga, setCarga] = useState(true);
	const [error, setError] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("Todos");
	const [filterOpen, setFilterOpen] = useState(false);
	const [retryCount, setRetryCount] = useState(0);
	const filterTriggerRef = useRef(null);
	const filterDrawerRef = useRef(null);

	const closeFilter = useCallback(() => {
		setFilterOpen(false);
		setTimeout(() => filterTriggerRef.current?.focus(), 100);
	}, []);
	useTitle("Catálogo");

	useEffect(() => {
		if (!filterOpen) return;
		const handleEsc = (e) => { if (e.key === 'Escape') closeFilter(); };
		document.addEventListener('keydown', handleEsc);
		return () => document.removeEventListener('keydown', handleEsc);
	}, [filterOpen, closeFilter]);

	useEffect(() => {
		if (!filterOpen) return;
		const el = filterDrawerRef.current;
		if (!el) return;
		const focusable = el.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		if (focusable.length === 0) return;
		focusable[0].focus();
		const handleTab = (e) => {
			if (e.key !== 'Tab') return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};
		el.addEventListener('keydown', handleTab);
		return () => el.removeEventListener('keydown', handleTab);
	}, [filterOpen, closeFilter]);

	useEffect(() => {
		let ignore = false;
		(async () => {
			try {
				const [datosProductos, datosCategorias] = await Promise.all([
					apiService.getProductos(),
					apiService.getCategorias(),
				]);
				if (!ignore) {
					setProductos(datosProductos);
					setCategorias(datosCategorias);
				}
			} catch (err) {
				if (!ignore) {
					setError("Error al cargar el catálogo. Verifica que el servidor esté activo.");
				}
				if (import.meta.env.DEV) console.error("Error al cargar datos:", err);
			} finally {
				if (!ignore) setCarga(false);
			}
		})();
		return () => { ignore = true; };
	}, [retryCount]);

	const filtrarProductos = productos.filter((producto) => {
		const matchBusqueda =
			producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(producto.descripcion && producto.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
		const matchCategoria =
			selectedCategory === "Todos" ||
			(producto.categoria && producto.categoria.nombre === selectedCategory);
		return matchBusqueda && matchCategoria;
	});

	const handleRetry = () => {
		setCarga(true);
		setError("");
		setRetryCount((c) => c + 1);
	};

	if (error && !carga) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4">
				<ErrorState title="Error al cargar" message={error} onRetry={handleRetry} />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8 overflow-hidden rounded-xl bg-bg ring-1 ring-border">
				<div className="relative px-6 py-8 sm:px-10 sm:py-10">
					<div className="relative z-10 max-w-lg">
						<h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
							Catálogo de productos
						</h1>
						<p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
							Explora las mejores ofertas, productos de calidad y envíos garantizados directamente de nuestros proveedores.
						</p>
					</div>
					<ShoppingCart className="absolute bottom-0 right-4 h-36 w-36 text-primary/10 sm:h-48 sm:w-48" aria-hidden="true" />
				</div>
			</div>

			{error && (
				<div className="mb-6 flex items-start gap-2.5 rounded-lg bg-warning-muted p-3.5 text-sm text-warning" role="alert">
					<AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
					<div>
						<span className="font-semibold">Aviso:</span> {error}. Mostrando datos locales si están disponibles.
					</div>
				</div>
			)}

			<div className="flex flex-col gap-6 lg:flex-row">
				<aside className="hidden flex-shrink-0 lg:block lg:w-64">
					<FilterContent
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						selectedCategory={selectedCategory}
						setSelectedCategory={setSelectedCategory}
						categorias={categorias}
					/>
				</aside>

				{filterOpen && (
					<>
						<div
							className="fixed inset-0 z-[300] bg-black/40 lg:hidden"
							onClick={closeFilter}
							aria-hidden="true"
						/>
						<div ref={filterDrawerRef} className="fixed inset-y-0 left-0 z-[400] w-80 max-w-[85vw] bg-bg shadow-lg overflow-y-auto lg:hidden animate-slide-up">
							<div className="flex items-center justify-between border-b border-border px-4 py-3">
								<h2 className="text-base font-bold text-ink">Filtros</h2>
								<button
									onClick={closeFilter}
									className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
									aria-label="Cerrar filtros"
								>
									<X className="h-5 w-5" />
								</button>
							</div>
							<FilterContent
								searchQuery={searchQuery}
								setSearchQuery={setSearchQuery}
								selectedCategory={selectedCategory}
								setSelectedCategory={setSelectedCategory}
								categorias={categorias}
								onSelect={closeFilter}
							/>
						</div>
					</>
				)}

				<div className="flex-1">
					<div className="mb-4 flex items-center justify-between lg:hidden">
						<p className="text-sm text-muted">
							{filtrarProductos.length} producto{filtrarProductos.length !== 1 ? "s" : ""}
						</p>
						<button
							ref={filterTriggerRef}
							onClick={() => setFilterOpen(true)}
							aria-expanded={filterOpen}
							className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-surface px-4 py-2.5 text-sm font-medium text-ink ring-1 ring-border transition-colors hover:bg-surface-hover active:bg-surface-hover/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
						>
							<Filter className="h-4 w-4" />
							Filtros
						</button>
					</div>

					{carga ? (
						<ProductGridSkeleton />
					) : filtrarProductos.length === 0 ? (
						<EmptyState
							title="Sin resultados"
							message="No encontramos productos con esos criterios. Intenta con otros filtros o términos de búsqueda."
						/>
					) : (
						<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
							{filtrarProductos.map((producto) => (
								<ProductCard
									key={producto.id}
									producto={producto}
									isGuest={!user}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
