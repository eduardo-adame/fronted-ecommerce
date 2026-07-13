import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import {
	LogOut, User, LayoutDashboard, Database, ShoppingBag, Shield, Menu, X, Package
} from 'lucide-react';

export const Navbar = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { usuario, handleLogOut: userLogOut } = useUser();
	const { totalItems, justAdded, openDrawer } = useCart();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

	const handleLogOut = () => {
		apiService.logout();
		userLogOut();
		navigate('/');
		setMobileOpen(false);
		setShowLogoutConfirm(false);
	};

	const goTo = (path) => {
		navigate(path);
		setMobileOpen(false);
	};

	const isClient = usuario && usuario.role === 'ROLE_CLIENT';
	const isAdmin = usuario && usuario.role === 'ROLE_ADMIN';

	const navLinks = [
		...(isAdmin
			? [
					{ label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
					{ label: 'Productos', icon: Database, path: '/admin/productos' },
					{ label: 'Panel Admin', icon: Shield, path: '/admin/panel' },
			  ]
			: []),
		...(isClient ? [{ label: 'Mis Compras', icon: Package, path: '/mis-compras' }] : []),
	];

	return (
		<header className="fixed top-0 left-0 right-0 z-[200] bg-primary shadow-sm">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-2.5">
					<button
						onClick={() => goTo('/')}
						className="flex cursor-pointer items-center gap-2.5"
					>
						<ShoppingBag className="h-7 w-7 text-white" />
						<span className="font-display text-xl font-bold tracking-tight text-white">
							Marketplace
						</span>
					</button>
					<button
						onClick={openDrawer}
						className="relative flex cursor-pointer items-center rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
						aria-label={`Abrir carrito, ${totalItems} producto${totalItems !== 1 ? 's' : ''}`}
					>
						<ShoppingBag className="h-5 w-5" />
						{totalItems > 0 && (
							<span
								className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-white transition-transform ${
									justAdded ? 'animate-scale-in' : ''
								}`}
							>
								{totalItems > 99 ? '99+' : totalItems}
							</span>
						)}
					</button>
				</div>

				<nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
					{navLinks.map((link) => (
						<button
							key={link.path}
							onClick={() => goTo(link.path)}
							className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
								location.pathname === link.path
									? 'bg-white/20 text-white'
									: 'text-white/80 hover:bg-white/10 hover:text-white'
							}`}
						>
							<link.icon className="h-4 w-4" />
							<span>{link.label}</span>
						</button>
					))}

					<div className="ml-2 flex items-center gap-2">
						{usuario ? (
							<div className="flex items-center gap-2">
								<span className="hidden text-sm font-medium text-white/70 lg:block">
									{usuario.nombre || usuario.username}
								</span>
								<button
									onClick={() => setShowLogoutConfirm(true)}
									className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
								>
									<LogOut className="h-4 w-4" />
									<span className="hidden sm:inline">Cerrar sesión</span>
								</button>
							</div>
						) : (
							<>
								<button
									onClick={() => goTo('/login')}
									className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/25"
								>
									<User className="h-4 w-4" />
									<span>Iniciar sesión</span>
								</button>
								<button
									onClick={() => goTo('/registro')}
									className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-hover px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-active"
								>
									<span>Registrarse</span>
								</button>
							</>
						)}
					</div>
				</nav>

				<button
					onClick={() => setMobileOpen((v) => !v)}
					className="flex cursor-pointer items-center rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white md:hidden"
					aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
					aria-expanded={mobileOpen}
				>
					{mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
				</button>
			</div>

			{mobileOpen && (
				<div className="animate-slide-up border-t border-white/10 bg-primary md:hidden">
					<nav className="space-y-1 px-4 pb-4 pt-2" aria-label="Navegación móvil">
						{navLinks.map((link) => (
							<button
								key={link.path}
								onClick={() => goTo(link.path)}
								className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
							>
								<link.icon className="h-5 w-5" />
								{link.label}
							</button>
						))}
						<div className="border-t border-white/10 pt-2">
							{usuario ? (
								<div className="space-y-1">
									<span className="block px-3 py-1.5 text-xs font-medium text-white/50">
										{usuario.nombre || usuario.username}
									</span>
									<button
										onClick={() => openDrawer()}
										className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
									>
										<ShoppingBag className="h-5 w-5" />
										Mi carrito {totalItems > 0 && `(${totalItems})`}
									</button>
									<button
										onClick={() => setShowLogoutConfirm(true)}
										className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
									>
										<LogOut className="h-5 w-5" />
										Cerrar sesión
									</button>
								</div>
							) : (
								<div className="flex flex-col gap-2 pt-1">
									<button
										onClick={() => goTo('/login')}
										className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/25"
									>
										<User className="h-4 w-4" />
										Iniciar sesión
									</button>
									<button
										onClick={() => goTo('/registro')}
										className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary-hover px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-active"
									>
										Registrarse
									</button>
								</div>
							)}
						</div>
					</nav>
				</div>
			)}

			<dialog
				ref={(el) => { if (el) { showLogoutConfirm ? el.showModal() : el.close(); } }}
				onClose={() => setShowLogoutConfirm(false)}
				className="rounded-xl bg-bg p-6 shadow-lg backdrop:bg-black/40 backdrop:animate-fade-in"
			>
				<h3 className="text-lg font-bold text-ink">Cerrar sesión</h3>
				<p className="mt-1 text-sm text-muted">¿Estás seguro de que quieres salir?</p>
				<div className="mt-5 flex gap-3">
					<button
						onClick={() => setShowLogoutConfirm(false)}
						className="flex-1 cursor-pointer rounded-lg bg-surface py-2 text-sm font-medium text-ink ring-1 ring-border transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
					>
						Cancelar
					</button>
					<button
						onClick={handleLogOut}
						className="flex-1 cursor-pointer rounded-lg bg-accent py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover active:bg-accent-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
					>
						Cerrar sesión
					</button>
				</div>
			</dialog>
		</header>
	);
};
