import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";
import { useTitle } from "../hooks/useTitle";
import { Package, Plus, Pencil, Trash2, ArrowLeft, Save, X, AlertTriangle } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { FormField } from "./AdminFormField";
import { ConfirmDialog } from "./ConfirmDialog";

const emptyForm = {
	nombre: "",
	descripcion: "",
	precio: "",
	stock: "",
	imagenUrl: "",
	categoriaId: "",
	proveedorId: "",
};

function formatCurrency(value) {
	return `$${Number(value).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

export function AdminProductos({ setVistaActual }) {
	const [productos, setProductos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [proveedores, setProveedores] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState(emptyForm);
	const [fieldErrors, setFieldErrors] = useState({});
	const [submitting, setSubmitting] = useState(false);

	const [deleteTarget, setDeleteTarget] = useState(null);
	const [deleting, setDeleting] = useState(false);

	useTitle("Gestión de Productos");

	const fetchAll = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const [prods, cats, provs] = await Promise.all([
				apiService.getProductos(),
				apiService.getCategorias(),
				apiService.getProveedores(),
			]);
			setProductos(Array.isArray(prods) ? prods : []);
			setCategorias(Array.isArray(cats) ? cats : []);
			setProveedores(Array.isArray(provs) ? provs : []);
		} catch (err) {
			setError("Error al cargar productos. Verifica que el servidor esté activo.");
			if (import.meta.env.DEV) console.error(err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { fetchAll(); }, [fetchAll]);

	function openCreate() {
		setEditing(null);
		setForm(emptyForm);
		setFieldErrors({});
		setFormOpen(true);
	}

	function openEdit(producto) {
		setEditing(producto);
		setForm({
			nombre: producto.nombre || "",
			descripcion: producto.descripcion || "",
			precio: String(producto.precio ?? ""),
			stock: String(producto.stock ?? ""),
			imagenUrl: producto.imagenUrl || "",
			categoriaId: String(producto.categoria?.id ?? ""),
			proveedorId: String(producto.proveedor?.id ?? ""),
		});
		setFieldErrors({});
		setFormOpen(true);
	}

	function closeForm() {
		setFormOpen(false);
		setEditing(null);
		setForm(emptyForm);
		setFieldErrors({});
	}

	function handleChange(field) {
		return (e) => {
			setForm((prev) => ({ ...prev, [field]: e.target.value }));
			if (fieldErrors[field]) {
				setFieldErrors((prev) => {
					const next = { ...prev };
					delete next[field];
					return next;
				});
			}
		};
	}

	function validate() {
		const errors = {};
		if (!form.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
		if (!form.precio || Number(form.precio) <= 0) errors.precio = "Ingresa un precio válido mayor a 0.";
		if (form.stock === "" || Number(form.stock) < 0) errors.stock = "El stock no puede ser negativo.";
		if (!form.categoriaId) errors.categoriaId = "Selecciona una categoría.";
		if (!form.proveedorId) errors.proveedorId = "Selecciona un proveedor.";
		return errors;
	}

	async function handleSubmit(e) {
		e.preventDefault();
		const errors = validate();
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}
		setSubmitting(true);

		const payload = {
			nombre: form.nombre.trim(),
			descripcion: form.descripcion.trim(),
			precio: Number(form.precio),
			stock: Number(form.stock),
			imagenUrl: form.imagenUrl.trim(),
			categoria: { id: Number(form.categoriaId) },
			proveedor: { id: Number(form.proveedorId) },
		};

		try {
			if (editing) {
				await apiService.actualizarProducto(editing.id, payload);
			} else {
				await apiService.crearProducto(payload);
			}
			closeForm();
			await fetchAll();
		} catch (err) {
			setFieldErrors({ general: err.message || "Error al guardar el producto." });
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			await apiService.eliminarProducto(deleteTarget.id);
			setDeleteTarget(null);
			await fetchAll();
		} catch (err) {
			setError(err.message || "Error al eliminar el producto.");
			setDeleteTarget(null);
		} finally {
			setDeleting(false);
		}
	}

	const inputClass = (field) =>
		`w-full rounded-lg border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
			fieldErrors[field]
				? "border-error focus-visible:border-error focus-visible:ring-error/20"
				: "border-border focus-visible:border-primary focus-visible:ring-primary/20"
		}`;

	const selectClass = (field) =>
		`w-full rounded-lg border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${
			fieldErrors[field]
				? "border-error focus-visible:border-error focus-visible:ring-error/20"
				: "border-border focus-visible:border-primary focus-visible:ring-primary/20"
		}`;

	if (error && !loading && productos.length === 0) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4">
				<ErrorState title="Error al cargar" message={error} onRetry={fetchAll} />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<button
						onClick={() => setVistaActual("admin-dashboard")}
						className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
					>
						<ArrowLeft className="h-4 w-4" />
						Volver
					</button>
					<div className="h-5 w-px bg-border" />
					<h1 className="text-xl font-bold text-ink sm:text-2xl">Productos</h1>
				</div>
				<button
					onClick={openCreate}
					className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
				>
					<Plus className="h-4 w-4" />
					Nuevo producto
				</button>
			</div>

			{error && productos.length > 0 && (
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
							<Skeleton className="h-5 w-20" />
							<Skeleton className="h-5 w-16" />
							<Skeleton className="h-5 w-28" />
							<Skeleton className="h-5 w-20" />
						</div>
					))}
				</div>
			) : productos.length === 0 ? (
				<EmptyState
					icon={Package}
					title="Sin productos"
					message="No hay productos registrados. Crea el primero."
				/>
			) : (
				<div className="overflow-x-auto rounded-xl bg-surface ring-1 ring-border">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted">
								<th className="px-4 py-3">ID</th>
								<th className="px-4 py-3">Nombre</th>
								<th className="px-4 py-3">Categoría</th>
								<th className="px-4 py-3 text-right">Precio</th>
								<th className="px-4 py-3 text-right">Stock</th>
								<th className="px-4 py-3">Proveedor</th>
								<th className="px-4 py-3 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{productos.map((p) => (
								<tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-bg/50 transition-colors">
									<td className="px-4 py-3 font-mono text-xs text-muted">#{p.id}</td>
									<td className="px-4 py-3 font-medium text-ink">{p.nombre}</td>
									<td className="px-4 py-3 text-muted">{p.categoria?.nombre || "—"}</td>
									<td className="px-4 py-3 text-right font-semibold text-ink">{formatCurrency(p.precio)}</td>
									<td className={`px-4 py-3 text-right font-semibold ${p.stock <= 0 ? "text-error" : p.stock < 10 ? "text-warning" : "text-success"}`}>
										{p.stock}
									</td>
									<td className="px-4 py-3 text-muted">{p.proveedor?.nombreEmpresa || "—"}</td>
									<td className="px-4 py-3 text-right">
										<div className="flex items-center justify-end gap-1">
											<button
												onClick={() => openEdit(p)}
												className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-info transition-colors hover:bg-info-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
											>
												<Pencil className="h-3.5 w-3.5" />
												Editar
											</button>
											<button
												onClick={() => setDeleteTarget(p)}
												className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
											>
												<Trash2 className="h-3.5 w-3.5" />
												Eliminar
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<dialog
				ref={(el) => { if (el) { formOpen ? el.showModal() : el.close(); } }}
				onClose={closeForm}
				className="fixed inset-0 m-auto max-w-lg rounded-xl bg-bg p-0 shadow-lg backdrop:bg-black/40 backdrop:animate-fade-in open:animate-fade-in"
			>
				<div className="flex items-center justify-between border-b border-border px-6 py-4">
					<h2 className="text-lg font-bold text-ink">
						{editing ? "Editar producto" : "Nuevo producto"}
					</h2>
					<button
						onClick={closeForm}
						className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit} noValidate className="space-y-4 px-6 py-5 max-h-[65vh] overflow-y-auto">
					{fieldErrors.general && (
						<div className="flex items-start gap-2 rounded-lg bg-error-muted p-3 text-sm text-error" role="alert">
							<AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
							{fieldErrors.general}
						</div>
					)}

					<FormField icon={Package} label="Nombre" name="nombre" error={fieldErrors.nombre} required>
						<input
							id="nombre"
							type="text"
							value={form.nombre}
							onChange={handleChange("nombre")}
							placeholder="Nombre del producto"
							disabled={submitting}
							required
							className={inputClass("nombre")}
						/>
					</FormField>

					<FormField icon={Package} label="Descripción" name="descripcion" error={fieldErrors.descripcion}>
						<textarea
							id="descripcion"
							value={form.descripcion}
							onChange={handleChange("descripcion")}
							placeholder="Descripción del producto"
							disabled={submitting}
							rows={3}
							className={`w-full rounded-lg border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
								fieldErrors.descripcion
									? "border-error focus-visible:border-error focus-visible:ring-error/20"
									: "border-border focus-visible:border-primary focus-visible:ring-primary/20"
							}`}
						/>
					</FormField>

					<div className="grid grid-cols-2 gap-4">
						<FormField label="Precio" name="precio" error={fieldErrors.precio} required>
							<input
								id="precio"
								type="number"
								step="0.01"
								min="0"
								value={form.precio}
								onChange={handleChange("precio")}
								placeholder="0.00"
								disabled={submitting}
								required
								className={inputClass("precio")}
							/>
						</FormField>

						<FormField label="Stock" name="stock" error={fieldErrors.stock} required>
							<input
								id="stock"
								type="number"
								min="0"
								value={form.stock}
								onChange={handleChange("stock")}
								placeholder="0"
								disabled={submitting}
								required
								className={inputClass("stock")}
							/>
						</FormField>
					</div>

					<FormField label="URL de imagen" name="imagenUrl" error={fieldErrors.imagenUrl}>
						<input
							id="imagenUrl"
							type="url"
							value={form.imagenUrl}
							onChange={handleChange("imagenUrl")}
							placeholder="https://ejemplo.com/imagen.jpg"
							disabled={submitting}
							className={inputClass("imagenUrl")}
						/>
					</FormField>

					<FormField icon={Package} label="Categoría" name="categoriaId" error={fieldErrors.categoriaId} required>
						<select
							id="categoriaId"
							value={form.categoriaId}
							onChange={handleChange("categoriaId")}
							disabled={submitting || categorias.length === 0}
							required
							className={selectClass("categoriaId")}
						>
							<option value="">Seleccionar categoría</option>
							{categorias.map((c) => (
								<option key={c.id} value={c.id}>{c.nombre}</option>
							))}
						</select>
					</FormField>

					<FormField icon={Package} label="Proveedor" name="proveedorId" error={fieldErrors.proveedorId} required>
						<select
							id="proveedorId"
							value={form.proveedorId}
							onChange={handleChange("proveedorId")}
							disabled={submitting || proveedores.length === 0}
							required
							className={selectClass("proveedorId")}
						>
							<option value="">Seleccionar proveedor</option>
							{proveedores.map((p) => (
								<option key={p.id} value={p.id}>{p.nombreEmpresa}</option>
							))}
						</select>
					</FormField>

					<div className="flex gap-3 pt-2">
						<button
							type="button"
							onClick={closeForm}
							disabled={submitting}
							className="flex-1 cursor-pointer rounded-lg bg-surface py-2.5 text-sm font-medium text-ink ring-1 ring-border transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={submitting}
							className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{submitting ? (
								<>
									<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
									{editing ? "Actualizando…" : "Creando…"}
								</>
							) : (
								<>
									<Save className="h-4 w-4" />
									{editing ? "Actualizar" : "Crear"}
								</>
							)}
						</button>
					</div>
				</form>
			</dialog>

			<ConfirmDialog
				open={!!deleteTarget}
				title="Eliminar producto"
				message={`¿Estás seguro de eliminar "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
				onConfirm={handleDelete}
				onCancel={() => setDeleteTarget(null)}
				loading={deleting}
			/>
		</div>
	);
}
