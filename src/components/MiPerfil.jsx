import { useTitle } from "../hooks/useTitle";
import { User, Mail, ArrowLeft, Package, ShoppingBag, LogOut, Shield } from "lucide-react";

function InfoRow({ icon: Icon, label, value }) {
	return (
		<div className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3 ring-1 ring-border">
			<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-muted">
				<Icon className="h-4 w-4 text-primary" aria-hidden="true" />
			</div>
			<div>
				<p className="text-xs text-muted">{label}</p>
				<p className="text-sm font-medium text-ink">{value || "—"}</p>
			</div>
		</div>
	);
}

function ActionCard({ icon: Icon, label, desc, onClick }) {
	return (
		<button
			onClick={onClick}
			className="group flex w-full cursor-pointer items-center gap-4 rounded-xl bg-surface p-4 text-left ring-1 ring-border transition-all hover:shadow-md hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 active:scale-[0.98]"
		>
			<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-bg ring-1 ring-border transition-colors group-hover:ring-primary/30">
				<Icon className="h-5 w-5 text-muted group-hover:text-primary" aria-hidden="true" />
			</div>
			<div className="flex-1">
				<p className="text-sm font-semibold text-ink">{label}</p>
				<p className="text-xs text-muted">{desc}</p>
			</div>
			<ArrowLeft className="h-4 w-4 flex-shrink-0 rotate-180 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
		</button>
	);
}

export function MiPerfil({ setVistaActual, user, onLogout }) {
	useTitle("Mi Perfil");

	const displayRole = (role) => {
		if (role === "ROLE_ADMIN") return "Administrador";
		if (role === "ROLE_CLIENTE" || role === "ROLE_CLIENT") return "Cliente";
		return role;
	};

	return (
		<div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
			<button
				onClick={() => setVistaActual("catalogo")}
				className="mb-6 flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
			>
				<ArrowLeft className="h-4 w-4" />
				Volver al catálogo
			</button>

			<div className="mb-8 overflow-hidden rounded-xl bg-bg ring-1 ring-border">
				<div className="flex flex-col items-center px-6 py-10 sm:px-10">
					<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-muted ring-4 ring-primary/10">
						<User className="h-9 w-9 text-primary" aria-hidden="true" />
					</div>
					<h1 className="text-xl font-bold text-ink sm:text-2xl">
						{user?.nombre || user?.username || "Usuario"}
					</h1>
					<span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary-muted px-3 py-1 text-xs font-semibold text-primary">
						<Shield className="h-3 w-3" />
						{displayRole(user?.role)}
					</span>
				</div>
			</div>

			<div className="mb-8 space-y-3">
				<h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
					Información de la cuenta
				</h2>
				<InfoRow icon={User} label="Nombre" value={user?.nombre} />
				<InfoRow icon={Mail} label="Correo electrónico" value={user?.username} />
				<InfoRow icon={Shield} label="Rol" value={displayRole(user?.role)} />
			</div>

			<div className="space-y-3">
				<h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
					Acceso rápido
				</h2>
				<ActionCard
					icon={Package}
					label="Mis Compras"
					desc="Historial de tus compras realizadas"
					onClick={() => setVistaActual("mis-compras")}
				/>
				<ActionCard
					icon={ShoppingBag}
					label="Ver Catálogo"
					desc="Explora todos los productos disponibles"
					onClick={() => setVistaActual("catalogo")}
				/>
				<ActionCard
					icon={LogOut}
					label="Cerrar sesión"
					desc="Salir de tu cuenta"
					onClick={onLogout}
				/>
			</div>
		</div>
	);
}
