import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";
import { useTitle } from "../hooks/useTitle";
import { Package, Users, Building2, DollarSign, AlertTriangle, ShoppingCart, Tag, ArrowRight } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { ErrorState } from "./ErrorState";
import {
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";

const STOCK_THRESHOLD = 10;

const CHART_COLORS = [
	"oklch(0.55 0.12 140)",
	"oklch(0.60 0.13 25)",
	"oklch(0.60 0.10 220)",
	"oklch(0.70 0.15 80)",
	"oklch(0.55 0.15 145)",
	"oklch(0.50 0.05 300)",
	"oklch(0.65 0.10 30)",
	"oklch(0.50 0.08 200)",
];

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

function formatCurrency(value) {
	return `$${Number(value).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

function StatCard({ icon: Icon, label, value, loading, error, color = "primary" }) {
	const colorMap = {
		primary: "text-primary bg-primary-muted",
		accent: "text-accent bg-accent-muted",
		info: "text-info bg-info-muted",
		success: "text-success bg-success-muted",
		warning: "text-warning bg-warning-muted",
	};

	return (
		<div className="flex items-center gap-4 rounded-xl bg-surface p-5 ring-1 ring-border">
			<div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${colorMap[color] || colorMap.primary}`}>
				<Icon className="h-6 w-6" aria-hidden="true" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-muted">{label}</p>
				{loading ? (
					<Skeleton className="mt-1 h-7 w-20" />
				) : error ? (
					<p className="mt-1 text-sm text-error">Error</p>
				) : (
					<p className="truncate text-xl font-bold text-ink">{value}</p>
				)}
			</div>
		</div>
	);
}

function TableSkeleton({ rows = 4, cols = 3 }) {
	return (
		<div className="space-y-3">
			{Array.from({ length: rows }).map((_, i) => (
				<div key={i} className="flex gap-4">
					{Array.from({ length: cols }).map((_, j) => (
						<Skeleton key={j} className="h-5 flex-1" />
					))}
				</div>
			))}
		</div>
	);
}

function SectionCard({ title, icon: Icon, children, loading, error, colSpan = "full" }) {
	return (
		<div className={`rounded-xl bg-surface p-5 ring-1 ring-border ${colSpan === "full" ? "lg:col-span-full" : ""}`}>
			<div className="mb-4 flex items-center gap-2">
				{Icon && <Icon className="h-5 w-5 text-muted" aria-hidden="true" />}
				<h2 className="text-base font-semibold text-ink">{title}</h2>
			</div>
			{loading ? (
				<TableSkeleton />
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

const crudModules = [
	{ vista: "admin-productos", icon: Package, label: "Productos", desc: "Administra el catálogo de productos", color: "primary" },
	{ vista: "admin-clientes", icon: Users, label: "Clientes", desc: "Administra los clientes registrados", color: "info" },
	{ vista: "admin-proveedores", icon: Building2, label: "Proveedores", desc: "Administra los proveedores", color: "warning" },
	{ vista: "admin-categorias", icon: Tag, label: "Categorías", desc: "Administra las categorías", color: "accent" },
	{ vista: "admin-ventas", icon: DollarSign, label: "Ventas", desc: "Administra las ventas realizadas", color: "success" },
];

function CrudCard({ icon: Icon, label, desc, color, onClick }) {
	const colorMap = {
		primary: "text-primary bg-primary-muted ring-primary/20 group-hover:ring-primary/40",
		info: "text-info bg-info-muted ring-info/20 group-hover:ring-info/40",
		warning: "text-warning bg-warning-muted ring-warning/20 group-hover:ring-warning/40",
		accent: "text-accent bg-accent-muted ring-accent/20 group-hover:ring-accent/40",
		success: "text-success bg-success-muted ring-success/20 group-hover:ring-success/40",
	};

	return (
		<button
			onClick={onClick}
			className="group flex cursor-pointer items-center gap-4 rounded-xl bg-bg p-5 text-left ring-1 ring-border transition-all hover:shadow-md hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 active:scale-[0.98]"
		>
			<div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ring-1 transition-all ${colorMap[color] || colorMap.primary}`}>
				<Icon className="h-6 w-6" aria-hidden="true" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="font-semibold text-ink">{label}</p>
				<p className="text-sm text-muted">{desc}</p>
			</div>
			<ArrowRight className="h-5 w-5 flex-shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
		</button>
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
			<div className="mb-8 overflow-hidden rounded-xl bg-bg ring-1 ring-border">
				<div className="relative px-6 py-8 sm:px-10 sm:py-10">
					<div className="relative z-10 max-w-lg">
						<h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
							Admin Dashboard
						</h1>
						<p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
							Visión general del negocio: indicadores, ventas y control de inventario.
						</p>
					</div>
					<Building2 className="absolute bottom-0 right-4 h-36 w-36 text-primary/10 sm:h-48 sm:w-48" aria-hidden="true" />
				</div>
			</div>

			<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					icon={Package}
					label="Total Productos"
					value={totalProductos}
					loading={loading}
					error={errors.productos}
					color="primary"
				/>
				<StatCard
					icon={Users}
					label="Total Clientes"
					value={totalClientes}
					loading={loading}
					error={errors.clientes}
					color="info"
				/>
				<StatCard
					icon={Building2}
					label="Total Proveedores"
					value={totalProveedores}
					loading={loading}
					error={errors.proveedores}
					color="warning"
				/>
				<StatCard
					icon={DollarSign}
					label="Total Ventas"
					value={formatCurrency(totalVentas)}
					loading={loading}
					error={errors.ventas}
					color="success"
				/>
			</div>

			<div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
				<SectionCard
					title="Ventas por mes"
					icon={DollarSign}
					loading={loading}
					error={errors.ventas}
				>
					{ventasPorMes.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted">Sin datos de ventas</p>
					) : (
						<ResponsiveContainer width="100%" height={280}>
							<BarChart data={ventasPorMes} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.008 140)" />
								<XAxis
									dataKey="label"
									tick={{ fontSize: 11, fill: "oklch(0.50 0.015 140)" }}
									axisLine={{ stroke: "oklch(0.90 0.008 140)" }}
									tickLine={false}
								/>
								<YAxis
									tick={{ fontSize: 11, fill: "oklch(0.50 0.015 140)" }}
									axisLine={false}
									tickLine={false}
									tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
								/>
								<Tooltip
									contentStyle={{
										background: "oklch(0.97 0.005 140)",
										border: "1px solid oklch(0.90 0.008 140)",
										borderRadius: "8px",
										fontSize: "13px",
									}}
									formatter={(value) => [formatCurrency(value), "Total"]}
								/>
								<Bar dataKey="total" fill="oklch(0.55 0.12 140)" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					)}
				</SectionCard>

				<SectionCard
					title="Productos por categoría"
					icon={Package}
					loading={loading}
					error={errors.productos}
				>
					{productosPorCategoria.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted">Sin categorías registradas</p>
					) : (
						<ResponsiveContainer width="100%" height={280}>
							<PieChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
								<Pie
									data={productosPorCategoria}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									innerRadius={55}
									outerRadius={100}
									paddingAngle={2}
								>
									{productosPorCategoria.map((_, i) => (
										<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										background: "oklch(0.97 0.005 140)",
										border: "1px solid oklch(0.90 0.008 140)",
										borderRadius: "8px",
										fontSize: "13px",
									}}
									formatter={(value, name) => [value, name]}
								/>
								<Legend
									wrapperStyle={{ fontSize: "12px", color: "oklch(0.50 0.015 140)" }}
								/>
							</PieChart>
						</ResponsiveContainer>
					)}
				</SectionCard>
			</div>

			<div className="mb-8">
				<div className="mb-4 flex items-center gap-2">
					<Package className="h-5 w-5 text-muted" aria-hidden="true" />
					<h2 className="text-base font-semibold text-ink">Gestión rápida</h2>
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
					{crudModules.map((mod) => (
						<CrudCard
							key={mod.vista}
							icon={mod.icon}
							label={mod.label}
							desc={mod.desc}
							color={mod.color}
							onClick={() => setVistaActual?.(mod.vista)}
						/>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<SectionCard
					title={`Productos con stock bajo (< ${STOCK_THRESHOLD})`}
					icon={AlertTriangle}
					loading={loading}
					error={errors.productos}
				>
					{productosBajoStock.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted">No hay productos con stock bajo</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead>
									<tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted">
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
					icon={ShoppingCart}
					loading={loading}
					error={errors.ventas}
				>
					{ventasRecientes.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted">Sin ventas registradas</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead>
									<tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted">
										<th className="pb-2 pr-4">ID</th>
										<th className="pb-2 pr-4">Cliente</th>
										<th className="pb-2 pr-4 text-right">Total</th>
										<th className="pb-2 text-right">Fecha</th>
									</tr>
								</thead>
								<tbody>
									{ventasRecientes.map((v) => (
										<tr key={v.id} className="border-b border-border/50 last:border-0">
											<td className="py-2.5 pr-4 font-mono text-xs text-muted">#{v.id}</td>
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
