import { useState } from 'react';
import { apiService } from '../services/apiService';
import { useTitle } from '../hooks/useTitle';
import { UserPlus, Mail, Lock, Phone, MapPin, User, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { ErrorState } from './ErrorState';

export const Registro = ({ onRegisterSuccess, onGoToLogin }) => {
	useTitle("Crear cuenta");
	const [form, setForm] = useState({
		nombre: '',
		apellido: '',
		username: '',
		password: '',
		telefono: '',
		direccion: '',
	});
	const [rol, setRol] = useState('ROLE_CLIENTE');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [fieldErrors, setFieldErrors] = useState({});

	const { nombre, apellido, username, password, telefono, direccion } = form;

	const validar = () => {
		const errors = {};
		if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio.';
		if (!form.apellido.trim()) errors.apellido = 'El apellido es obligatorio.';
		if (!form.username.trim()) errors.username = 'El correo es obligatorio.';
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.username))
			errors.username = 'Ingresa un correo válido.';
		if (!form.password.trim()) errors.password = 'La contraseña es obligatoria.';
		else if (form.password.length < 6)
			errors.password = 'Mínimo 6 caracteres.';
		if (rol === 'ROLE_CLIENTE') {
			if (!form.telefono.trim()) errors.telefono = 'El teléfono es obligatorio.';
			if (!form.direccion.trim()) errors.direccion = 'La dirección es obligatoria.';
		}
		return errors;
	};

	const handleChange = (field) => (e) => {
		setForm((prev) => ({ ...prev, [field]: e.target.value }));
		if (fieldErrors[field]) {
			setFieldErrors((prev) => {
				const next = { ...prev };
				delete next[field];
				return next;
			});
		}
		if (error) setError('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setLoading(true);

		const errors = validar();
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			setLoading(false);
			return;
		}

		const payload = {
			username: form.username,
			password: form.password,
			nombre: form.nombre,
			apellido: form.apellido,
			rol,
			direccion: rol === 'ROLE_CLIENTE' ? form.direccion : null,
			telefono: rol === 'ROLE_CLIENTE' ? form.telefono : null,
		};

		try {
			await apiService.registro(payload);
			setSuccess(
				'¡Registro completado con éxito! Redirigiéndote al inicio de sesión...'
			);
			setTimeout(() => {
				onRegisterSuccess();
			}, 2000);
		} catch (err) {
			setError(err.message || 'Error al registrarse. Intenta de nuevo.');
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="flex min-h-[80svh] items-center justify-center px-4">
				<div className="animate-fade-in text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-muted">
						<CheckCircle className="h-8 w-8 text-success" />
					</div>
					<h2 className="text-xl font-bold text-ink">Registro exitoso</h2>
					<p className="mt-1 text-sm text-muted">{success}</p>
				</div>
			</div>
		);
	}

	if (error && error.includes('red')) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4">
				<ErrorState
					title="Error de conexión"
					message={error}
					onRetry={() => { setError(''); setLoading(false); }}
				/>
			</div>
		);
	}

	return (
		<div className="flex min-h-[80svh] items-center justify-center px-4 py-12">
			<div className="w-full max-w-sm animate-fade-in">
				<div className="mb-6 text-center">
					<h1 className="text-2xl font-bold text-ink">Crear cuenta</h1>
					<p className="mt-1 text-sm text-muted">Completa tus datos para registrarte</p>
				</div>

				<div className="rounded-xl bg-surface p-6 ring-1 ring-border sm:p-8">
					<form onSubmit={handleSubmit} className="space-y-5" noValidate>
						{/* Rol Selector */}
						<div>
							<label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-muted">
								Tipo de cuenta
							</label>
							<div className="flex gap-3">
								<label
									className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
										rol === 'ROLE_CLIENTE'
											? 'border-primary bg-primary/5 text-primary'
											: 'border-border text-muted hover:border-primary/50'
									}`}
								>
									<input
										type="radio"
										name="rol"
										value="ROLE_CLIENTE"
										checked={rol === 'ROLE_CLIENTE'}
										onChange={(e) => setRol(e.target.value)}
										className="sr-only"
										disabled={loading}
									/>
									<User className="h-4 w-4" />
									Cliente
								</label>
								<label
									className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
										rol === 'ROLE_ADMIN'
											? 'border-primary bg-primary/5 text-primary'
											: 'border-border text-muted hover:border-primary/50'
									}`}
								>
									<input
										type="radio"
										name="rol"
										value="ROLE_ADMIN"
										checked={rol === 'ROLE_ADMIN'}
										onChange={(e) => setRol(e.target.value)}
										className="sr-only"
										disabled={loading}
									/>
									<Shield className="h-4 w-4" />
									Administrador
								</label>
							</div>
						</div>

						<fieldset>
							<legend className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Datos personales</legend>
							<div className="space-y-4">
								{/* Nombre */}
								<div>
									<label htmlFor="reg-nombre" className="mb-1.5 block text-sm font-medium text-ink">Nombre</label>
									<div className="relative">
										<User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
										<input
											id="reg-nombre"
											type="text"
											value={nombre}
											onChange={handleChange('nombre')}
											placeholder="Tu nombre completo"
											required
											disabled={loading}
											className={`w-full rounded-lg border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
												fieldErrors['nombre']
													? 'border-error focus-visible:border-error focus-visible:ring-error/20'
													: 'border-border focus-visible:border-primary focus-visible:ring-primary/20'
											}`}
										/>
									</div>
									{fieldErrors['nombre'] && (
										<p className="mt-1 text-xs text-error">{fieldErrors['nombre']}</p>
									)}
								</div>

								{/* Apellido */}
								<div>
									<label htmlFor="reg-apellido" className="mb-1.5 block text-sm font-medium text-ink">Apellido</label>
									<div className="relative">
										<User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
										<input
											id="reg-apellido"
											type="text"
											value={apellido}
											onChange={handleChange('apellido')}
											placeholder="Tu apellido completo"
											required
											disabled={loading}
											className={`w-full rounded-lg border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
												fieldErrors['apellido']
													? 'border-error focus-visible:border-error focus-visible:ring-error/20'
													: 'border-border focus-visible:border-primary focus-visible:ring-primary/20'
											}`}
										/>
									</div>
									{fieldErrors['apellido'] && (
										<p className="mt-1 text-xs text-error">{fieldErrors['apellido']}</p>
									)}
								</div>

								{/* Correo electrónico */}
								<div>
									<label htmlFor="reg-username" className="mb-1.5 block text-sm font-medium text-ink">Correo electrónico</label>
									<div className="relative">
										<Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
										<input
											id="reg-username"
											type="email"
											value={username}
											onChange={handleChange('username')}
											placeholder="tu@correo.com"
											required
											disabled={loading}
											className={`w-full rounded-lg border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
												fieldErrors['username']
													? 'border-error focus-visible:border-error focus-visible:ring-error/20'
													: 'border-border focus-visible:border-primary focus-visible:ring-primary/20'
											}`}
										/>
									</div>
									{fieldErrors['username'] && (
										<p className="mt-1 text-xs text-error">{fieldErrors['username']}</p>
									)}
								</div>

								{/* Contraseña */}
								<div>
									<label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-ink">Contraseña</label>
									<div className="relative">
										<Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
										<input
											id="reg-password"
											type="password"
											onChange={handleChange('password')}
											placeholder="Mínimo 6 caracteres"
											required
											disabled={loading}
											value={password}
											className={`w-full rounded-lg border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
												fieldErrors['password']
													? 'border-error focus-visible:border-error focus-visible:ring-error/20'
													: 'border-border focus-visible:border-primary focus-visible:ring-primary/20'
											}`}
										/>
									</div>
									{fieldErrors['password'] && (
										<p className="mt-1 text-xs text-error">{fieldErrors['password']}</p>
									)}
								</div>
							</div>
						</fieldset>

						{rol === 'ROLE_CLIENTE' && (
							<>
								<hr className="border-border" />

								<fieldset>
									<legend className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Contacto</legend>
									<div className="space-y-4">
										{/* Teléfono */}
										<div>
											<label htmlFor="reg-telefono" className="mb-1.5 block text-sm font-medium text-ink">Teléfono de contacto</label>
											<div className="relative">
												<Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
												<input
													id="reg-telefono"
													type="tel"
													value={telefono}
													onChange={handleChange('telefono')}
													placeholder="+52 55 1234 5678"
													required={rol === 'ROLE_CLIENTE'}
													disabled={loading}
													className={`w-full rounded-lg border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
														fieldErrors['telefono']
															? 'border-error focus-visible:border-error focus-visible:ring-error/20'
															: 'border-border focus-visible:border-primary focus-visible:ring-primary/20'
													}`}
												/>
											</div>
											{fieldErrors['telefono'] && (
												<p className="mt-1 text-xs text-error">{fieldErrors['telefono']}</p>
											)}
										</div>

										{/* Dirección */}
										<div>
											<label htmlFor="reg-direccion" className="mb-1.5 block text-sm font-medium text-ink">Dirección</label>
											<div className="relative">
												<MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
												<input
													id="reg-direccion"
													type="text"
													value={direccion}
													onChange={handleChange('direccion')}
													placeholder="Calle, número, colonia"
													required={rol === 'ROLE_CLIENTE'}
													disabled={loading}
													className={`w-full rounded-lg border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
														fieldErrors['direccion']
															? 'border-error focus-visible:border-error focus-visible:ring-error/20'
															: 'border-border focus-visible:border-primary focus-visible:ring-primary/20'
													}`}
												/>
											</div>
											{fieldErrors['direccion'] && (
												<p className="mt-1 text-xs text-error">{fieldErrors['direccion']}</p>
											)}
										</div>
									</div>
								</fieldset>
							</>
						)}

						{error && (
							<div className="flex items-start gap-2 rounded-lg bg-error-muted p-3 text-sm text-error" role="alert">
								<AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
								<span>{error}</span>
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loading ? (
								<>
									<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
									Registrando…
								</>
							) : (
								<>
									<UserPlus className="h-4 w-4" />
									Crear cuenta
								</>
							)}
						</button>
					</form>
				</div>

				<p className="mt-6 text-center text-sm text-muted">
					¿Ya tienes una cuenta?{' '}
					<button
						onClick={onGoToLogin}
						className="cursor-pointer font-medium text-primary underline-offset-2 hover:underline"
					>
						Inicia sesión
					</button>
				</p>
			</div>
		</div>
	);
};
