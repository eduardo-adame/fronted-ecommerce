import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";
import { useTitle } from "../hooks/useTitle";
import { Users, Plus, Pencil, Trash2, ArrowLeft, Save, X, Mail, Phone, MapPin, User, Lock, AlertTriangle } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { FormField } from "./AdminFormField";
import { ConfirmDialog } from "./ConfirmDialog";

const emptyForm = {
	nombre: "",
	apellido: "",
	username: "",
	password: "",
	telefono: "",
	direccion: "",
};

export function AdminClientes({ setVistaActual }) {
	const [clientes, setClientes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState(emptyForm);
	const [fieldErrors, setFieldErrors] = useState({});
	const [submitting, setSubmitting] = useState(false);

	const [deleteTarget, setDeleteTarget] = useState(null);
	const [deleting, setDeleting] = useState(false);

	useTitle("Gestión de Clientes");

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const data = await apiService.getClientes();
			setClientes(Array.isArray(data) ? data : []);
		} catch (err) {
			setError("Error al cargar clientes.");
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

	function openEdit(cliente) {
		setEditing(cliente);
		setForm({
			nombre: cliente.nombre || "",
			apellido: cliente.apellido || "",
			username: cliente.username || "",
			password: "",
			telefono: cliente.telefono || "",
			direccion: cliente.direccion || "",
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
		if (!form.apellido.trim()) errors.apellido = "El apellido es obligatorio.";
		if (!form.username.trim()) errors.username = "El correo es obligatorio.";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.username))
			errors.username = "Ingresa un correo válido.";
		if (!editing && !form.password.trim()) errors.password = "La contraseña es obligatoria.";
		else if (!editing && form.password.length < 6)
			errors.password = "Mínimo 6 caracteres.";
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
			apellido: form.apellido.trim(),
			username: form.username.trim(),
			telefono: form.telefono.trim(),
			direccion: form.direccion.trim(),
		};

		if (!editing) {
			payload.password = form.password;
		} else if (form.password.trim()) {
			payload.password = form.password;
		}

		try {
			if (editing) {
				await apiService.actualizarCliente(editing.id, payload);
			} else {
				await apiService.crearCliente(payload);
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
			await apiService.eliminarCliente(deleteTarget.id);
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

	if (error && !loading && clientes.length === 0) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4">
				<ErrorState title="Error al cargar" message={error} onRetry={fetchData} />
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
					<h1 className="text-xl font-bold text-ink sm:text-2xl">Clientes</h1>
				</div>
				<button
					onClick={openCreate}
					className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
				>
					<Plus className="h-4 w-4" />
					Nuevo cliente
				</button>
			</div>

			{error && clientes.length > 0 && (
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
							<Skeleton className="h-5 w-28" />
							<Skeleton className="h-5 w-28" />
							<Skeleton className="h-5 flex-1" />
							<Skeleton className="h-5 w-28" />
							<Skeleton className="h-5 w-20" />
						</div>
					))}
				</div>
			) : clientes.length === 0 ? (
				<EmptyState
					icon={Users}
					title="Sin clientes"
					message="No hay clientes registrados."
				/>
			) : (
				<div className="overflow-x-auto rounded-xl bg-surface ring-1 ring-border">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted">
								<th className="px-4 py-3">ID</th>
								<th className="px-4 py-3">Nombre</th>
								<th className="px-4 py-3">Apellido</th>
								<th className="px-4 py-3">Email</th>
								<th className="px-4 py-3">Teléfono</th>
								<th className="px-4 py-3 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{clientes.map((c) => (
								<tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-bg/50 transition-colors">
									<td className="px-4 py-3 font-mono text-xs text-muted">#{c.id}</td>
									<td className="px-4 py-3 font-medium text-ink">{c.nombre || "—"}</td>
									<td className="px-4 py-3 text-muted">{c.apellido || "—"}</td>
									<td className="px-4 py-3 text-muted">{c.username || "—"}</td>
									<td className="px-4 py-3 text-muted">{c.telefono || "—"}</td>
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
				className="fixed inset-0 m-auto max-w-lg rounded-xl bg-bg p-0 shadow-lg backdrop:bg-black/40 backdrop:animate-fade-in open:animate-fade-in"
			>
				<div className="flex items-center justify-between border-b border-border px-6 py-4">
					<h2 className="text-lg font-bold text-ink">
						{editing ? "Editar cliente" : "Nuevo cliente"}
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

					<div className="grid grid-cols-2 gap-4">
						<FormField icon={User} label="Nombre" name="nombre" error={fieldErrors.nombre} required>
							<input
								id="nombre"
								type="text"
								value={form.nombre}
								onChange={handleChange("nombre")}
								placeholder="Nombre"
								disabled={submitting}
								required
								className={inputClass("nombre")}
							/>
						</FormField>

						<FormField icon={User} label="Apellido" name="apellido" error={fieldErrors.apellido} required>
							<input
								id="apellido"
								type="text"
								value={form.apellido}
								onChange={handleChange("apellido")}
								placeholder="Apellido"
								disabled={submitting}
								required
								className={inputClass("apellido")}
							/>
						</FormField>
					</div>

					<FormField icon={Mail} label="Correo electrónico" name="username" error={fieldErrors.username} required>
						<input
							id="username"
							type="email"
							value={form.username}
							onChange={handleChange("username")}
							placeholder="cliente@correo.com"
							disabled={submitting}
							required
							className={inputClass("username")}
						/>
					</FormField>

					<FormField icon={Lock} label={editing ? "Contraseña (dejar vacío para mantener)" : "Contraseña"} name="password" error={fieldErrors.password} required={!editing}>
						<input
							id="password"
							type="password"
							value={form.password}
							onChange={handleChange("password")}
							placeholder={editing ? "Sin cambios" : "Mínimo 6 caracteres"}
							disabled={submitting}
							required={!editing}
							className={inputClass("password")}
						/>
					</FormField>

					<FormField icon={Phone} label="Teléfono" name="telefono" error={fieldErrors.telefono}>
						<input
							id="telefono"
							type="tel"
							value={form.telefono}
							onChange={handleChange("telefono")}
							placeholder="+52 55 1234 5678"
							disabled={submitting}
							className={inputClass("telefono")}
						/>
					</FormField>

					<FormField icon={MapPin} label="Dirección" name="direccion" error={fieldErrors.direccion}>
						<input
							id="direccion"
							type="text"
							value={form.direccion}
							onChange={handleChange("direccion")}
							placeholder="Calle, número, colonia"
							disabled={submitting}
							className={inputClass("direccion")}
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
				title="Eliminar cliente"
				message={`¿Estás seguro de eliminar a "${deleteTarget?.nombre} ${deleteTarget?.apellido}"? Esta acción no se puede deshacer.`}
				onConfirm={handleDelete}
				onCancel={() => setDeleteTarget(null)}
				loading={deleting}
			/>
		</div>
	);
}
