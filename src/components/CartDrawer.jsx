import { useState, useCallback, useEffect, useRef } from "react";
import { ShoppingBag, X, Minus, Plus, Trash2, AlertTriangle } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { apiService } from "../services/apiService";

function formatCurrency(value) {
	return `$${Number(value).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

export function CartDrawer({ cart, isOpen, onClose, onUpdateQuantity, onRemoveFromCart, setCart, setIsCartOpen, setVistaActual, setVentaActiva }) {
	const panelRef = useRef(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const close = useCallback(() => {
		onClose();
	}, [onClose]);

	useEffect(() => {
		if (!isOpen) return;
		const handleEsc = (e) => { if (e.key === 'Escape') close(); };
		document.addEventListener('keydown', handleEsc);
		return () => document.removeEventListener('keydown', handleEsc);
	}, [isOpen, close]);

	useEffect(() => {
		if (!isOpen || !panelRef.current) return;
		panelRef.current.focus();
	}, [isOpen]);

	const total = cart.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);

	async function handleClick() {
		setLoading(true);
		setError("");
		try {
			const payload = {
				detalles: cart.map((item) => ({
					producto: { id: item.producto.id },
					cantidad: item.cantidad,
				})),
			};
			const venta = await apiService.procesarVenta(payload);
			setVentaActiva(venta);
			setCart([]);
			setIsCartOpen(false);
			setVistaActual("checkout");
		} catch (err) {
			setError(err.message || "Error al procesar la compra.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			{isOpen && (
				<div
					className="fixed inset-0 z-[300] bg-black/40"
					onClick={close}
					aria-hidden="true"
				/>
			)}

			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-label="Carrito de compras"
				tabIndex={-1}
				className={`fixed inset-y-0 right-0 z-[400] flex w-96 max-w-[90vw] flex-col bg-bg shadow-lg transition-transform duration-250 ease-out ${
					isOpen ? "translate-x-0" : "translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between border-b border-border px-5 py-4">
					<div className="flex items-center gap-2.5">
						<ShoppingBag className="h-5 w-5 text-muted" aria-hidden="true" />
						<h2 className="text-base font-bold text-ink">Tu Carrito</h2>
						<span className="rounded-full bg-primary-muted px-2 py-0.5 text-xs font-semibold text-primary">
							{cart.length}
						</span>
					</div>
					<button
						onClick={close}
						className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
						aria-label="Cerrar carrito"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{cart.length === 0 ? (
					<div className="flex flex-1 items-center justify-center">
						<EmptyState
							icon={ShoppingBag}
							title="Carrito vacío"
							message="Agrega productos desde el catálogo para empezar a comprar."
						/>
					</div>
				) : (
					<>
						<div className="flex-1 space-y-1 overflow-y-auto px-5 py-4">
							{cart.map((item) => (
								<div
									key={item.producto.id}
									className="group flex gap-3.5 rounded-xl bg-surface p-3.5 ring-1 ring-border transition-colors hover:ring-primary/20"
								>
									<div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-bg">
										<img
											src={item.producto.imagenUrl}
											alt={item.producto.nombre}
											className="h-full w-full object-cover"
											onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=300"; }}
										/>
									</div>

									<div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold text-ink">{item.producto.nombre}</p>
												<p className="text-xs text-muted">{formatCurrency(item.producto.precio)} c/u</p>
											</div>
											<button
												onClick={() => onRemoveFromCart?.(item.producto.id)}
												className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted opacity-0 transition-all hover:bg-error-muted hover:text-error group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
												aria-label={`Eliminar ${item.producto.nombre}`}
											>
												<Trash2 className="h-3.5 w-3.5" />
											</button>
										</div>

										<div className="flex items-center justify-between">
											<div className="flex items-center gap-1">
												<button
													onClick={() => onUpdateQuantity?.(item.producto.id, item.cantidad - 1)}
													className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-bg text-muted ring-1 ring-border transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
													aria-label="Reducir cantidad"
												>
													<Minus className="h-3.5 w-3.5" />
												</button>
												<span className="flex h-7 min-w-[2rem] items-center justify-center text-sm font-semibold text-ink">
													{item.cantidad}
												</span>
												<button
													onClick={() => onUpdateQuantity?.(item.producto.id, item.cantidad + 1)}
													disabled={item.cantidad >= item.producto.stock}
													className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-bg text-muted ring-1 ring-border transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
													aria-label="Aumentar cantidad"
												>
													<Plus className="h-3.5 w-3.5" />
												</button>
											</div>
											<p className="text-sm font-bold text-ink">
												{formatCurrency(item.producto.precio * item.cantidad)}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="border-t border-border px-5 py-4">
							{error && (
								<div className="mb-3 flex items-start gap-2 rounded-lg bg-error-muted p-3 text-sm text-error" role="alert">
									<AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
									{error}
								</div>
							)}
							<div className="mb-3 flex items-center justify-between">
								<span className="text-sm font-medium text-muted">Total</span>
								<span className="text-xl font-bold text-ink">{formatCurrency(total)}</span>
							</div>
							<button
								onClick={handleClick}
								disabled={loading}
								className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{loading ? "Procesando..." : "Finalizar compra"}
							</button>
						</div>
					</>
				)}
			</div>
		</>
	);
}
