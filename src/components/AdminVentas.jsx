import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";
import { useTitle } from "../hooks/useTitle";
import { ShoppingCart, Eye, ArrowLeft, X, AlertTriangle, Package, User, Calendar, DollarSign } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";

function formatCurrency(value) {
	return `$${Number(value).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
	if (!dateStr) return "—";
	return new Date(dateStr).toLocaleDateString("es-MX", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function AdminVentas({ setVistaActual }) {
	const [ventas, setVentas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [detailTarget, setDetailTarget] = useState(null);
	const [detailData, setDetailData] = useState(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [detailError, setDetailError] = useState("");

	useTitle("Gestión de Ventas");

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const data = await apiService.getVentas();
			setVentas(Array.isArray(data) ? data : []);
		} catch (err) {
			setError("Error al cargar ventas.");
			if (import.meta.env.DEV) console.error(err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { fetchData(); }, [fetchData]);

	async function openDetail(venta) {
		setDetailTarget(venta);
		setDetailData(null);
		setDetailError("");
		setDetailLoading(true);
		try {
			const data = await apiService.getVenta(venta.id);
			setDetailData(data);
		} catch (err) {
			setDetailError(err.message || "Error al cargar el detalle.");
		} finally {
			setDetailLoading(false);
		}
	}

	function closeDetail() {
		setDetailTarget(null);
		setDetailData(null);
		setDetailError("");
	}

	const items = detailData?.items || detailData?.detalles || detailData?.productos || [];
	const venta = detailData || detailTarget;

	if (error && !loading && ventas.length === 0) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4">
				<ErrorState title="Error al cargar" message={error} onRetry={fetchData} />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-6 flex items-center gap-3">
				<button
					onClick={() => setVistaActual("admin-dashboard")}
					className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
				>
					<ArrowLeft className="h-4 w-4" />
					Volver
				</button>
				<div className="h-5 w-px bg-border" />
				<h1 className="text-xl font-bold text-ink sm:text-2xl">Ventas</h1>
			</div>

			{error && ventas.length > 0 && (
				<div className="mb-6 flex items-start gap-2 rounded-lg bg-warning-muted p-3.5 text-sm text-warning" role="alert">
					<AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
					{error}
				</div>
			)}

			{loading ? (
				<div className="space-y-3 rounded-xl bg-surface p-5 ring-1 ring-border">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="flex gap-4">
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-5 flex-1" />
							<Skeleton className="h-5 w-24" />
							<Skeleton className="h-5 w-36" />
							<Skeleton className="h-5 w-20" />
						</div>
					))}
				</div>
			) : ventas.length === 0 ? (
				<EmptyState
					icon={ShoppingCart}
					title="Sin ventas"
					message="No hay ventas registradas."
				/>
			) : (
				<div className="overflow-x-auto rounded-xl bg-surface ring-1 ring-border">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted">
								<th className="px-4 py-3">ID</th>
								<th className="px-4 py-3">Cliente</th>
								<th className="px-4 py-3 text-right">Total</th>
								<th className="px-4 py-3">Fecha</th>
								<th className="px-4 py-3 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{ventas.map((v) => (
								<tr key={v.id} className="border-b border-border/50 last:border-0 hover:bg-bg/50 transition-colors">
									<td className="px-4 py-3 font-mono text-xs text-muted">#{v.id}</td>
									<td className="px-4 py-3 font-medium text-ink">{v.cliente?.nombre || v.cliente || "—"}</td>
									<td className="px-4 py-3 text-right font-semibold text-ink">{formatCurrency(v.total)}</td>
									<td className="px-4 py-3 text-muted">{v.fecha ? formatDate(v.fecha) : "—"}</td>
									<td className="px-4 py-3 text-right">
										<button
											onClick={() => openDetail(v)}
											className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-info transition-colors hover:bg-info-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
										>
											<Eye className="h-3.5 w-3.5" />
											Ver detalle
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<dialog
				ref={(el) => { if (el) { detailTarget ? el.showModal() : el.close(); } }}
				onClose={closeDetail}
				className="fixed inset-0 m-auto max-w-2xl rounded-xl bg-bg p-0 shadow-lg backdrop:bg-black/40 backdrop:animate-fade-in open:animate-fade-in"
			>
				<div className="flex items-center justify-between border-b border-border px-6 py-4">
					<h2 className="text-lg font-bold text-ink">
						Detalle de venta #{detailTarget?.id}
					</h2>
					<button
						onClick={closeDetail}
						className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
					{detailLoading ? (
						<div className="space-y-3">
							<Skeleton className="h-5 w-48" />
							<Skeleton className="h-5 w-36" />
							<Skeleton className="h-5 w-40" />
							<div className="my-4 border-t border-border" />
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="flex gap-4">
									<Skeleton className="h-5 flex-1" />
									<Skeleton className="h-5 w-16" />
									<Skeleton className="h-5 w-12" />
									<Skeleton className="h-5 w-20" />
								</div>
							))}
						</div>
					) : detailError ? (
						<div className="flex items-start gap-2 rounded-lg bg-error-muted p-3 text-sm text-error" role="alert">
							<AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
							{detailError}
						</div>
					) : venta ? (
						<div className="space-y-5">
							<div className="grid grid-cols-2 gap-4">
								<div className="flex items-center gap-2.5 rounded-lg bg-surface p-3.5 ring-1 ring-border">
									<User className="h-5 w-5 text-muted" aria-hidden="true" />
									<div>
										<p className="text-xs text-muted">Cliente</p>
										<p className="text-sm font-medium text-ink">{venta.cliente?.nombre || venta.cliente || "—"}</p>
									</div>
								</div>
								<div className="flex items-center gap-2.5 rounded-lg bg-surface p-3.5 ring-1 ring-border">
									<Calendar className="h-5 w-5 text-muted" aria-hidden="true" />
									<div>
										<p className="text-xs text-muted">Fecha</p>
										<p className="text-sm font-medium text-ink">{venta.fecha ? formatDate(venta.fecha) : "—"}</p>
									</div>
								</div>
								<div className="flex items-center gap-2.5 rounded-lg bg-surface p-3.5 ring-1 ring-border">
									<DollarSign className="h-5 w-5 text-muted" aria-hidden="true" />
									<div>
										<p className="text-xs text-muted">Total</p>
										<p className="text-sm font-bold text-ink">{formatCurrency(venta.total)}</p>
									</div>
								</div>
								<div className="flex items-center gap-2.5 rounded-lg bg-surface p-3.5 ring-1 ring-border">
									<Package className="h-5 w-5 text-muted" aria-hidden="true" />
									<div>
										<p className="text-xs text-muted">Artículos</p>
										<p className="text-sm font-medium text-ink">{items.length} producto(s)</p>
									</div>
								</div>
							</div>

							<div className="border-t border-border pt-4">
								<h3 className="mb-3 text-sm font-semibold text-ink">Productos</h3>
								{items.length === 0 ? (
									<p className="py-4 text-center text-sm text-muted">Sin detalle de productos disponible</p>
								) : (
									<div className="overflow-x-auto rounded-lg ring-1 ring-border">
										<table className="w-full text-left text-sm">
											<thead>
												<tr className="bg-surface text-xs font-semibold uppercase tracking-wider text-muted">
													<th className="px-3 py-2.5">Producto</th>
													<th className="px-3 py-2.5 text-right">Precio</th>
													<th className="px-3 py-2.5 text-right">Cantidad</th>
													<th className="px-3 py-2.5 text-right">Subtotal</th>
												</tr>
											</thead>
											<tbody>
												{items.map((item, i) => (
													<tr key={i} className="border-t border-border/50">
														<td className="px-3 py-2.5 font-medium text-ink">
															{item.producto?.nombre || item.nombreProducto || item.producto || "—"}
														</td>
														<td className="px-3 py-2.5 text-right text-muted">
															{formatCurrency(item.precio || item.precioUnitario || 0)}
														</td>
														<td className="px-3 py-2.5 text-right text-muted">
															{item.cantidad || item.cant || 0}
														</td>
														<td className="px-3 py-2.5 text-right font-semibold text-ink">
															{formatCurrency(item.subtotal || item.total || (item.precio || 0) * (item.cantidad || 0))}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						</div>
					) : null}
				</div>
			</dialog>
		</div>
	);
}
