import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";
import { useTitle } from "../hooks/useTitle";
import { Package, Users, Building2, DollarSign, AlertTriangle, Tag, ShoppingCart } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { ErrorState } from "./ErrorState";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts";

const STOCK_THRESHOLD = 10;

const CATEGORY_COLORS = [
	"var(--color-primary)",
	"var(--color-accent)",
	"var(--color-info)",
	"var(--color-success)",
	"var(--color-warning)",
];

function getSaleBarColor(index, total) {
	const t = total <= 1 ? 1 : index / (total - 1);
	const l = 0.92 - t * 0.37;
	const c = 0.02 + t * 0.10;
	return `oklch(${l.toFixed(3)} ${c.toFixed(3)} 140)`;
}

const CRUD_MODULES = [
	{ vista: "admin-productos", icon: Package, label: "Productos", desc: "Catálogo" },
	{ vista: "admin-clientes", icon: Users, label: "Clientes", desc: "Registrados" },
	{ vista: "admin-proveedores", icon: Building2, label: "Proveedores", desc: "Registrados" },
	{ vista: "admin-categorias", icon: Tag, label: "Categorías", desc: "Del catálogo" },
	{ vista: "admin-ventas", icon: DollarSign, label: "Ventas", desc: "Realizadas" },
];

function groupProductsByCategory(productos) {
	const map = {};
	for (const p of productos) {
		const cat = p.categoria?.nombre || "Sin categoría";
		if (!map[cat]) map[cat] = 0;
		map[cat] += 1;
	}
	return Object.entries(map)
		.sort(([, a], [, b]) => b - a)
		.map(([name, value]) => ({ name, value }));
}

function groupSalesByMonth(ventas) {
	const map = {};
	for (const v of ventas) {
		if (!v.fecha) continue;
		const date = new Date(v.fecha);
		const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
		const label = date.toLocaleDateString("es-MX", { month: "short", year: "numeric" });
		if (!map[key]) map[key] = { label, total: 0, count: 0 };
		map[key].total += Number(v.total) || 0;
		map[key].count += 1;
	}
	return Object.entries(map)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([, v]) => ({ label: v.label, total: v.total, count: v.count }));
}

function formatCurrency(value) {
	return `$${Number(value).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

function StatCard({ icon: Icon, label, value, loading, error }) {
	return (
		<div className="rounded-xl bg-surface p-5 ring-1 ring-border">
			<div className="flex items-center gap-1.5">
				{Icon && <Icon className="h-4 w-4 text-muted" aria-hidden="true" />}
				<p className="text-sm text-muted">{label}</p>
			</div>
			{loading ? (
				<Skeleton className="mt-2 h-6 w-20" />
			) : error ? (
				<p className="mt-2 text-sm text-error">Error</p>
			) : (
				<p className="mt-2 truncate text-lg font-semibold text-ink">{value}</p>
			)}
		</div>
	);
}

function SectionCard({ title, children, loading, error }) {
	return (
		<div className="rounded-xl bg-surface p-5 ring-1 ring-border">
			<h2 className="mb-4 text-base font-semibold text-ink">{title}</h2>
			{loading ? (
				<div className="space-y-3">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex gap-4">
							{Array.from({ length: 3 }).map((_, j) => (
								<Skeleton key={j} className="h-5 flex-1" />
							))}
						</div>
					))}
				</div>
			) : error ? (
				<div className="flex items-center gap-2 rounded-lg bg-error-muted p-3 text-sm text-error">
					<AlertTriangle className="h-4 w-4 flex-shrink-0" />
					{error}
				</div>
			) : (
				children
			)}
		</div>
	);
}

export function AdminDashboard({ setVistaActual }) {
	const [data, setData] = useState({
		productos: [],
		clientes: [],
		proveedores: [],
		ventas: [],
	});
	const [loading, setLoading] = useState(true);
	const [errors, setErrors] = useState({});
	const [retryCount, setRetryCount] = useState(0);

	useTitle("Admin Dashboard");

	const fetchAll = useCallback(async () => {
		setLoading(true);
		setErrors({});

		const results = await Promise.allSettled([
			apiService.getProductos(),
			apiService.getClientes(),
			apiService.getProveedores(),
			apiService.getVentas(),
		]);

		const keys = ["productos", "clientes", "proveedores", "ventas"];
		const newData = {};
		const newErrors = {};

		results.forEach((result, i) => {
			const key = keys[i];
			if (result.status === "fulfilled") {
				newData[key] = Array.isArray(result.value) ? result.value : [];
			} else {
				newData[key] = [];
				newErrors[key] = `Error al cargar ${key}`;
				if (import.meta.env.DEV) console.error(`Error fetching ${key}:`, result.reason);
			}
		});

		setData(newData);
		setErrors(newErrors);
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchAll();
	}, [fetchAll, retryCount]);

	const handleRetry = () => setRetryCount((c) => c + 1);

	const totalProductos = data.productos.length;
	const totalClientes = data.clientes.length;
	const totalProveedores = data.proveedores.length;
	const totalVentas = data.ventas.reduce((sum, v) => sum + (Number(v.total) || 0), 0);

	const productosBajoStock = data.productos
		.filter((p) => p.stock < STOCK_THRESHOLD)
		.sort((a, b) => a.stock - b.stock);

	const ventasRecientes = [...data.ventas]
		.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
		.slice(0, 5);

	const ventasPorMes = groupSalesByMonth(data.ventas);
	const productosPorCategoria = groupProductsByCategory(data.productos);

	const hasFatalError = !loading && Object.keys(errors).length === 4;

	if (hasFatalError) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4">
				<ErrorState title="Error al cargar el dashboard" message="No se pudieron cargar los datos. Verifica que el servidor esté activo." onRetry={handleRetry} />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
				<p className="mt-1 text-sm text-muted">
					Visión general del negocio: indicadores, ventas y control de inventario.
				</p>
			</div>

			<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					icon={Package}
					label="Total Productos"
					value={totalProductos}
					loading={loading}
					error={errors.productos}
				/>
				<StatCard
					icon={Users}
					label="Total Clientes"
					value={totalClientes}
					loading={loading}
					error={errors.clientes}
				/>
				<StatCard
					icon={Building2}
					label="Total Proveedores"
					value={totalProveedores}
					loading={loading}
					error={errors.proveedores}
				/>
				<StatCard
					icon={DollarSign}
					label="Total Ventas"
					value={formatCurrency(totalVentas)}
					loading={loading}
					error={errors.ventas}
				/>
			</div>

			<div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
				<SectionCard
					title="Ventas por mes"
					loading={loading}
					error={errors.ventas}
				>
					{ventasPorMes.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted">Sin datos de ventas</p>
					) : (
						<ResponsiveContainer width="100%" height={280}>
							<BarChart data={ventasPorMes} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
								<XAxis
									dataKey="label"
									tick={{ fontSize: 11, fill: "var(--color-muted)" }}
									axisLine={{ stroke: "var(--color-border)" }}
									tickLine={false}
								/>
								<YAxis
									tick={{ fontSize: 11, fill: "var(--color-muted)" }}
									axisLine={false}
									tickLine={false}
									tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
								/>
								<Tooltip
									contentStyle={{
										background: "var(--color-bg)",
										border: "1px solid var(--color-border)",
										borderRadius: "8px",
										fontSize: "13px",
									}}
									formatter={(value) => [formatCurrency(value), "Total"]}
								/>
								<Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={60}>
									{ventasPorMes.map((_, i) => (
										<Cell key={i} fill={getSaleBarColor(i, ventasPorMes.length)} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					)}
				</SectionCard>

				<SectionCard
					title="Productos por categoría"
					loading={loading}
					error={errors.productos}
				>
					{productosPorCategoria.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted">Sin categorías registradas</p>
					) : (
						<ResponsiveContainer width="100%" height={280}>
							<BarChart data={productosPorCategoria} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
								<XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
								<YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} width={100} />
								<Tooltip
									contentStyle={{
										background: "var(--color-bg)",
										border: "1px solid var(--color-border)",
										borderRadius: "8px",
										fontSize: "13px",
									}}
									formatter={(value, name) => [value, name]}
								/>
								<Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
									{productosPorCategoria.map((_, i) => (
										<Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					)}
				</SectionCard>
			</div>

			<div className="mb-8">
				<h2 className="mb-4 text-base font-semibold text-ink">Gestión rápida</h2>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
					{CRUD_MODULES.map((mod) => (
						<button
							key={mod.vista}
							onClick={() => setVistaActual?.(mod.vista)}
							className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3 text-left ring-1 ring-border transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
						>
							<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary">
								<mod.icon className="h-5 w-5" aria-hidden="true" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-semibold text-ink">{mod.label}</p>
								<p className="text-xs text-muted">{mod.desc}</p>
							</div>
						</button>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<SectionCard
					title={`Productos con stock bajo (< ${STOCK_THRESHOLD})`}
					loading={loading}
					error={errors.productos}
				>
					{productosBajoStock.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted">No hay productos con stock bajo</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead>
									<tr className="border-b border-border text-sm font-semibold text-muted">
										<th className="pb-2 pr-4">Producto</th>
										<th className="pb-2 pr-4">Categoría</th>
										<th className="pb-2 pr-4 text-right">Stock</th>
										<th className="pb-2 text-right">Precio</th>
									</tr>
								</thead>
								<tbody>
									{productosBajoStock.map((p) => (
										<tr key={p.id} className="border-b border-border/50 last:border-0">
											<td className="py-2.5 pr-4 font-medium text-ink">{p.nombre}</td>
											<td className="py-2.5 pr-4 text-muted">{p.categoria?.nombre || "—"}</td>
											<td className={`py-2.5 pr-4 text-right font-semibold ${p.stock === 0 ? "text-error" : "text-warning"}`}>
												{p.stock}
											</td>
											<td className="py-2.5 text-right text-muted">{formatCurrency(p.precio)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</SectionCard>

				<SectionCard
					title="Ventas recientes"
					loading={loading}
					error={errors.ventas}
				>
					{ventasRecientes.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted">Sin ventas registradas</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead>
									<tr className="border-b border-border text-sm font-semibold text-muted">
										<th className="pb-2 pr-4">Cliente</th>
										<th className="pb-2 pr-4 text-right">Total</th>
										<th className="pb-2 text-right">Fecha</th>
									</tr>
								</thead>
								<tbody>
									{ventasRecientes.map((v) => (
										<tr key={v.id} className="border-b border-border/50 last:border-0">
											<td className="py-2.5 pr-4 text-ink">{v.cliente?.nombre || v.cliente || "—"}</td>
											<td className="py-2.5 pr-4 text-right font-semibold text-ink">{formatCurrency(v.total)}</td>
											<td className="py-2.5 text-right text-muted">
												{v.fecha ? new Date(v.fecha).toLocaleDateString("es-MX") : "—"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</SectionCard>
			</div>
		</div>
	);
}
