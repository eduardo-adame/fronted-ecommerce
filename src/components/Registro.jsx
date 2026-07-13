import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useUser } from '../context/UserContext';
import { useTitle } from '../hooks/useTitle';
import { UserPlus, Mail, Lock, Phone, MapPin, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { ErrorState } from './ErrorState';

export const Registro = () => {
	const navigate = useNavigate();
	const { handleLoginSuccess } = useUser();
	useTitle("Crear cuenta");
	const [form, setForm] = useState({
		nombre: '',
		username: '',
		password: '',
		telefono: '',
		direccion: '',
	});
	const [status, setStatus] = useState('idle');
	const [errorMsg, setErrorMsg] = useState('');
	const [fieldErrors, setFieldErrors] = useState({});

	const validar = () => {
		const errors = {};
		if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio.';
		if (!form.username.trim()) errors.username = 'El correo es obligatorio.';
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.username))
			errors.username = 'Ingresa un correo válido.';
		if (!form.password.trim()) errors.password = 'La contraseña es obligatoria.';
		else if (form.password.length < 6)
			errors.password = 'Mínimo 6 caracteres.';
		if (!form.telefono.trim()) errors.telefono = 'El teléfono es obligatorio.';
		if (!form.direccion.trim()) errors.direccion = 'La dirección es obligatoria.';
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
		if (status === 'error') setStatus('idle');
	};

	const handleRegistro = async (e) => {
		e.preventDefault();
		const errors = validar();
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}
		setStatus('loading');
		setErrorMsg('');
		try {
			const userData = { ...form };
			await apiService.registrarUsuario(userData);
			setStatus('success');
			handleLoginSuccess({ username: form.username, nombre: form.nombre, role: 'ROLE_CLIENT' });
		} catch (err) {
			setErrorMsg(err.message || 'Error al registrarse. Intenta de nuevo.');
			setStatus('error');
		}
	};

	if (status === 'success') {
		return (
			<div className="flex min-h-[80svh] items-center justify-center px-4">
				<div className="animate-fade-in text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-muted">
						<CheckCircle className="h-8 w-8 text-success" />
					</div>
					<h2 className="text-xl font-bold text-ink">Registro exitoso</h2>
					<p className="mt-1 text-sm text-muted">Bienvenido, {form.nombre}.</p>
				</div>
			</div>
		);
	}

	if (status === 'error' && errorMsg.includes('red')) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4">
				<ErrorState
					title="Error de conexión"
					message={errorMsg}
					onRetry={() => setStatus('idle')}
				/>
			</div>
		);
	}

	const personalFields = [
		{ id: 'nombre', label: 'Nombre', icon: User, type: 'text', placeholder: 'Tu nombre completo' },
		{ id: 'username', label: 'Correo electrónico', icon: Mail, type: 'email', placeholder: 'tu@correo.com' },
		{ id: 'password', label: 'Contraseña', icon: Lock, type: 'password', placeholder: 'Mínimo 6 caracteres' },
	];

	const contactFields = [
		{ id: 'telefono', label: 'Teléfono de contacto', icon: Phone, type: 'tel', placeholder: '+52 55 1234 5678' },
		{ id: 'direccion', label: 'Dirección', icon: MapPin, type: 'text', placeholder: 'Calle, número, colonia' },
	];

	const renderFields = (fields) => fields.map(({ id, label, icon: Icon, type, placeholder }) => (
		<div key={id}>
			<label htmlFor={`reg-${id}`} className="mb-1.5 block text-sm font-medium text-ink">
				{label}
			</label>
			<div className="relative">
				<Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
				<input
					id={`reg-${id}`}
					type={type}
					value={form[id]}
					onChange={handleChange(id)}
					placeholder={placeholder}
					required
					disabled={status === 'loading'}
					className={`w-full rounded-lg border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
						fieldErrors[id]
							? 'border-error focus-visible:border-error focus-visible:ring-error/20'
							: 'border-border focus-visible:border-primary focus-visible:ring-primary/20'
					}`}
				/>
			</div>
			{fieldErrors[id] && (
				<p className="mt-1 text-xs text-error">{fieldErrors[id]}</p>
			)}
		</div>
	));

	return (
		<div className="flex min-h-[80svh] items-center justify-center px-4 py-12">
			<div className="w-full max-w-sm animate-fade-in">
				<div className="mb-6 text-center">
					<h1 className="text-2xl font-bold text-ink">Crear cuenta</h1>
					<p className="mt-1 text-sm text-muted">Completa tus datos para registrarte</p>
				</div>

				<div className="rounded-xl bg-surface p-6 ring-1 ring-border sm:p-8">
					<form onSubmit={handleRegistro} className="space-y-5" noValidate>
						<fieldset>
							<legend className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Datos personales</legend>
							<div className="space-y-4">
								{renderFields(personalFields)}
							</div>
						</fieldset>

						<hr className="border-border" />

						<fieldset>
							<legend className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Contacto</legend>
							<div className="space-y-4">
								{renderFields(contactFields)}
							</div>
						</fieldset>

						{status === 'error' && (
							<div className="flex items-start gap-2 rounded-lg bg-error-muted p-3 text-sm text-error" role="alert">
								<AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
								<span>{errorMsg}</span>
							</div>
						)}

						<button
							type="submit"
							disabled={status === 'loading'}
							className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50"
						>
							{status === 'loading' ? (
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
						onClick={() => navigate('/login')}
						className="cursor-pointer font-medium text-primary underline-offset-2 hover:underline"
					>
						Inicia sesión
					</button>
				</p>
			</div>
		</div>
	);
};
