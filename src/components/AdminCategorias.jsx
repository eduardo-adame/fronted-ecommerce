import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";
import { useTitle } from "../hooks/useTitle";
import { Tag, Plus, Pencil, Trash2, ArrowLeft, Save, X, AlertTriangle } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { FormField } from "./AdminFormField";
import { ConfirmDialog } from "./ConfirmDialog";

const emptyForm = { nombre: "" };

export function AdminCategorias({ setVistaActual }) {
	const [categorias, setCategorias] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState(emptyForm);
	const [fieldErrors, setFieldErrors] = useState({});
	const [submitting, setSubmitting] = useState(false);

	const [deleteTarget, setDeleteTarget] = useState(null);
	const [deleting, setDeleting] = useState(false);

	useTitle("Gestión de Categorías");

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const data = await apiService.getCategorias();
			setCategorias(Array.isArray(data) ? data : []);
		} catch (err) {
			setError("Error al cargar categorías.");
			if (import.meta.env.DEV) console.error(err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { fetchData(); }, [fetchData]);

	function openCreate() {
		setEditing(null);
		setForm(emptyForm);
		setFieldErrors({});
		setFormOpen(true);
	}

	function openEdit(categoria) {
		setEditing(categoria);
		setForm({ nombre: categoria.nombre || "" });
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
		if (!form.nombre.trim()) errors.nombre = "El nombre de la categoría es obligatorio.";
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

		const payload = { nombre: form.nombre.trim() };

		try {
			if (editing) {
				await apiService.actualizarCategoria(editing.id, payload);
			} else {
				await apiService.crearCategoria(payload);
			}
			closeForm();
			await fetchData();
		} catch (err) {
			setFieldErrors({ general: err.message || "Error al guardar." });
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			await apiService.eliminarCategoria(deleteTarget.id);
			setDeleteTarget(null);
			await fetchData();
		} catch (err) {
			setError(err.message || "Error al eliminar.");
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

	if (error && !loading && categorias.length === 0) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4">
				<ErrorState title="Error al cargar" message={error} onRetry={fetchData} />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
					<h1 className="text-xl font-bold text-ink sm:text-2xl">Categorías</h1>
				</div>
				<button
					onClick={openCreate}
					className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
				>
					<Plus className="h-4 w-4" />
					Nueva categoría
				</button>
			</div>

			{error && categorias.length > 0 && (
				<div className="mb-6 flex items-start gap-2 rounded-lg bg-warning-muted p-3.5 text-sm text-warning" role="alert">
					<AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
					{error}
				</div>
			)}

			{loading ? (
				<div className="space-y-3 rounded-xl bg-surface p-5 ring-1 ring-border">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex gap-4">
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-5 flex-1" />
							<Skeleton className="h-5 w-20" />
						</div>
					))}
				</div>
			) : categorias.length === 0 ? (
				<EmptyState
					icon={Tag}
					title="Sin categorías"
					message="No hay categorías registradas. Crea la primera."
				/>
			) : (
				<div className="overflow-x-auto rounded-xl bg-surface ring-1 ring-border">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted">
								<th className="px-4 py-3 w-20">ID</th>
								<th className="px-4 py-3">Nombre</th>
								<th className="px-4 py-3 text-right w-40">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{categorias.map((c) => (
								<tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-bg/50 transition-colors">
									<td className="px-4 py-3 font-mono text-xs text-muted">#{c.id}</td>
									<td className="px-4 py-3 font-medium text-ink">{c.nombre}</td>
									<td className="px-4 py-3 text-right">
										<div className="flex items-center justify-end gap-1">
											<button
												onClick={() => openEdit(c)}
												className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-info transition-colors hover:bg-info-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
											>
												<Pencil className="h-3.5 w-3.5" />
												Editar
											</button>
											<button
												onClick={() => setDeleteTarget(c)}
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
				className="fixed inset-0 m-auto max-w-sm rounded-xl bg-bg p-0 shadow-lg backdrop:bg-black/40 backdrop:animate-fade-in open:animate-fade-in"
			>
				<div className="flex items-center justify-between border-b border-border px-6 py-4">
					<h2 className="text-lg font-bold text-ink">
						{editing ? "Editar categoría" : "Nueva categoría"}
					</h2>
					<button
						onClick={closeForm}
						className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit} noValidate className="space-y-4 px-6 py-5">
					{fieldErrors.general && (
						<div className="flex items-start gap-2 rounded-lg bg-error-muted p-3 text-sm text-error" role="alert">
							<AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
							{fieldErrors.general}
						</div>
					)}

					<FormField icon={Tag} label="Nombre de la categoría" name="nombre" error={fieldErrors.nombre} required>
						<input
							id="nombre"
							type="text"
							value={form.nombre}
							onChange={handleChange("nombre")}
							placeholder="Ej: Electrónica"
							disabled={submitting}
							required
							className={inputClass("nombre")}
						/>
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
				title="Eliminar categoría"
				message={`¿Estás seguro de eliminar "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
				onConfirm={handleDelete}
				onCancel={() => setDeleteTarget(null)}
				loading={deleting}
			/>
		</div>
	);
}
