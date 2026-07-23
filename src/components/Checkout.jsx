import { CheckCircle, ArrowLeft } from "lucide-react";

function formatCurrency(value) {
	return `$${Number(value).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

export function Checkout({ ventaActiva, setVistaActual }) {
	if (!ventaActiva) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4">
				<div className="text-center">
					<h2 className="text-xl font-bold text-ink mb-2">Sin compra activa</h2>
					<p className="text-sm text-muted mb-4">No hay una compra reciente que mostrar.</p>
					<button
						onClick={() => setVistaActual("catalogo")}
						className="cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
					>
						Ir al catálogo
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl px-4 py-16 text-center">
			<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-muted">
				<CheckCircle className="h-8 w-8 text-success" />
			</div>
			<h2 className="text-2xl font-bold text-ink mb-2">Compra exitosa</h2>
			<p className="text-sm text-muted mb-8">Tu compra se ha registrado correctamente.</p>

			<div className="mx-auto mb-8 max-w-sm space-y-3 rounded-xl bg-surface p-5 ring-1 ring-border text-left">
				<div className="flex justify-between text-sm">
					<span className="text-muted">Folio</span>
					<span className="font-semibold text-ink">#{ventaActiva.id}</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-muted">Total</span>
					<span className="font-semibold text-ink">{formatCurrency(ventaActiva.total)}</span>
				</div>
				{ventaActiva.fecha && (
					<div className="flex justify-between text-sm">
						<span className="text-muted">Fecha</span>
						<span className="font-semibold text-ink">
							{new Date(ventaActiva.fecha).toLocaleDateString("es-MX", {
								year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
							})}
						</span>
					</div>
				)}
			</div>

			<button
				onClick={() => setVistaActual("catalogo")}
				className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
			>
				<ArrowLeft className="h-4 w-4" />
				Seguir comprando
			</button>
		</div>
	);
}
