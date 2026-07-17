import { useState, useEffect } from 'react';
import { Catalogo } from './components/Catalogo';
import { Registro } from './components/Registro';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { apiService } from './services/apiService';

function Placeholder({ title, subtitle }) {
	return (
		<div className="flex flex-col items-center justify-center py-20">
			<h2 className="text-2xl font-bold text-ink mb-2">{title}</h2>
			<p className="text-muted">{subtitle}</p>
		</div>
	);
}

function App() {
	const [vistaActual, setVistaActual] = useState('catalogo');
	const [user, setUser] = useState(null);
	const [ventaActiva, setVentaActiva] = useState(null);

	useEffect(() => {
		if (apiService.isAuthenticated()) {
			setUser({
				username: localStorage.getItem('username'),
				nombre: localStorage.getItem('nombre'),
				role: localStorage.getItem('rol'),
			});
		}
	}, []);

	const handleLoginSuccess = (userData) => {
		const role = userData.rol || userData.role || 'ROLE_CLIENTE';
		setUser({
			username: userData.username,
			nombre: userData.nombre,
			role,
		});
		if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
			setVistaActual('admin-dashboard');
		} else {
			setVistaActual('catalogo');
		}
	};

	const handleLogout = () => {
		apiService.logout();
		setUser(null);
		setVentaActiva(null);
		setVistaActual('catalogo');
	};

	const vistaContenido = () => {
		switch (vistaActual) {
			case 'catalogo':
				return (
					<Catalogo setVistaActual={setVistaActual} user={user} />
				);
			case 'register':
				return (
					<Registro onRegisterSuccess={() => setVistaActual('login')} onGoToLogin={() => setVistaActual('login')} />
				);
			case 'login':
				return (
					<Login onLoginSuccess={handleLoginSuccess} onGoToRegister={() => setVistaActual('register')} />
				);
			case 'admin-dashboard':
				return <AdminDashboard />;
			case 'mis-compras':
				return <Placeholder title="Mis Compras" subtitle="Historial de compras" />;
			default:
				return <Catalogo setVistaActual={setVistaActual} user={user} />;
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-bg text-ink antialiased">
			<Navbar
				user={user}
				setVistaActual={setVistaActual}
				vistaActual={vistaActual}
				handleLogout={handleLogout}
			/>
			<main className="flex-grow pt-16 pb-12">
				{vistaContenido()}
			</main>
			<Footer />
		</div>
	);
}

export default App;
