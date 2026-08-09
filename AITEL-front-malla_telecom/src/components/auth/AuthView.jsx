import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeSwitcher from '../common/ThemeSwitcher';
import AitelLogo from '../common/AitelLogo';

const FIELD_LABEL_CLASS = 'mb-2 block text-sm font-semibold text-muted';
const FIELD_ERROR_CLASS = 'mt-1.5 text-xs text-bad';

const inputClass = (hasError) =>
  `w-full rounded-lg border-2 bg-bg px-4 py-3.5 text-base text-ink outline-none transition-colors focus:border-accent ${
    hasError ? 'border-bad' : 'border-line'
  }`;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
  </svg>
);

const AuthView = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    studentCode: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Formato de correo electrónico inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = 'El nombre es requerido';
      }

      if (!formData.lastName) {
        newErrors.lastName = 'El apellido es requerido';
      }

      if (!formData.studentCode) {
        newErrors.studentCode = 'El código de estudiante es requerido';
      } else if (!/^\d{8}$/.test(formData.studentCode)) {
        newErrors.studentCode = 'El código debe tener 8 dígitos';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma tu contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }

      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const result = isLogin
      ? await login({ email: formData.email, password: formData.password })
      : await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          studentCode: formData.studentCode
        });

    setIsLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrors({ form: result.error || 'No se pudo completar la solicitud.' });
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      studentCode: '',
      acceptTerms: false
    });
    setErrors({});
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Autenticación con Google exitosa!');
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-bg text-ink lg:grid lg:grid-cols-2">
      {/* Panel de marca. Se oculta por debajo de lg: en pantallas angostas la
          foto robaria toda la altura util y dejaria el formulario fuera de
          vista, que es lo unico que el usuario vino a hacer. */}
      <aside className="relative hidden lg:block">
        <img
          src="/marca/equipo.jpg"
          alt="Equipo de estudiantes de AITEL"
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={{ objectPosition: '53% 58%' }}
          draggable="false"
        />
        {/* Velo oscuro: la foto es nocturna y con mucho detalle, sin esto el
            texto encima se vuelve ilegible. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />

        <div className="relative flex h-full flex-col justify-end p-12">
          {/* forceDark porque el panel es oscuro siempre, sin importar el tema */}
          <AitelLogo variant="lockup" forceDark className="mb-6 w-full max-w-[420px]" />
          <p className="max-w-md text-lg leading-relaxed text-white/90">
            Planifica tu carrera, revisa tus prerrequisitos y comparte tu experiencia
            con el resto de la especialidad.
          </p>
        </div>
      </aside>

      {/* Columna del formulario */}
      <div className="relative flex min-h-screen items-center justify-center p-5 lg:min-h-0">
        <div className="absolute right-5 top-5">
          <ThemeSwitcher />
        </div>

        <div className="w-full max-w-[440px]">
          {/* Encabezado */}
          <div className="mb-8 text-center">
            {/* En pantallas angostas no hay panel de marca, asi que el isotipo
                aparece aca para que el login no quede sin identidad. */}
            <AitelLogo className="mx-auto mb-4 h-14 w-auto lg:hidden" />
            <h1 className="m-0 mb-2 font-display text-4xl font-bold tracking-tight">
              Matricula<span className="text-accent">TEL</span>
            </h1>
            <p className="m-0 text-base text-muted">
              Ingeniería de las Telecomunicaciones
            </p>
          </div>

        {/* Tarjeta principal */}
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          {/* Selector de modo */}
          <div className="m-5 grid grid-cols-2 gap-1 rounded-lg bg-bg p-1">
            <button
              type="button"
              onClick={toggleMode}
              className={`rounded-md py-3 text-sm font-semibold transition-colors ${
                isLogin ? 'bg-accent text-ink-on-accent' : 'text-muted hover:text-ink'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={toggleMode}
              className={`rounded-md py-3 text-sm font-semibold transition-colors ${
                !isLogin ? 'bg-accent text-ink-on-accent' : 'text-muted hover:text-ink'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Formulario */}
          <div className="px-6 pb-6">
            <form onSubmit={handleSubmit}>
              {errors.form && (
                <div className="mb-5 rounded-lg border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">
                  {errors.form}
                </div>
              )}

              {!isLogin && (
                <div className="mb-5">
                  <label className={FIELD_LABEL_CLASS}>Nombres</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={inputClass(errors.firstName)}
                    placeholder="Juan Carlos"
                  />
                  {errors.firstName && <p className={FIELD_ERROR_CLASS}>{errors.firstName}</p>}
                </div>
              )}

              {!isLogin && (
                <div className="mb-5">
                  <label className={FIELD_LABEL_CLASS}>Apellidos</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={inputClass(errors.lastName)}
                    placeholder="Pérez García"
                  />
                  {errors.lastName && <p className={FIELD_ERROR_CLASS}>{errors.lastName}</p>}
                </div>
              )}

              {!isLogin && (
                <div className="mb-5">
                  <label className={FIELD_LABEL_CLASS}>Código de estudiante</label>
                  <input
                    type="text"
                    name="studentCode"
                    value={formData.studentCode}
                    onChange={handleInputChange}
                    className={inputClass(errors.studentCode)}
                    placeholder="20201234"
                    maxLength="8"
                  />
                  {errors.studentCode && <p className={FIELD_ERROR_CLASS}>{errors.studentCode}</p>}
                </div>
              )}

              <div className="mb-5">
                <label className={FIELD_LABEL_CLASS}>Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClass(errors.email)}
                  placeholder="estudiante@pucp.edu.pe"
                />
                {errors.email && <p className={FIELD_ERROR_CLASS}>{errors.email}</p>}
              </div>

              <div className="mb-5">
                <label className={FIELD_LABEL_CLASS}>Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${inputClass(errors.password)} pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-ink"
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                {errors.password && <p className={FIELD_ERROR_CLASS}>{errors.password}</p>}
              </div>

              {!isLogin && (
                <div className="mb-5">
                  <label className={FIELD_LABEL_CLASS}>Confirmar contraseña</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`${inputClass(errors.confirmPassword)} pr-12`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-ink"
                    >
                      {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className={FIELD_ERROR_CLASS}>{errors.confirmPassword}</p>}
                </div>
              )}

              {!isLogin && (
                <div className="mb-6">
                  <label className="flex cursor-pointer items-center text-sm text-muted">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="mr-3 h-[18px] w-[18px] accent-accent"
                    />
                    Acepto los{' '}
                    {/* Placeholder temporal hasta que existan los terminos reales.
                        stopPropagation + preventDefault porque el enlace vive dentro
                        del <label> de la casilla: sin eso, abrirlo tambien la marcaria. */}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('No seas sapo 👀'); }}
                      className="ml-1 text-accent underline"
                    >
                      términos y condiciones
                    </button>
                  </label>
                  {errors.acceptTerms && <p className={`${FIELD_ERROR_CLASS} ml-[30px]`}>{errors.acceptTerms}</p>}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-4 text-base font-semibold text-ink-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-on-accent/30 border-t-ink-on-accent" />
                    Procesando...
                  </>
                ) : (
                  isLogin ? 'Iniciar sesión' : 'Crear cuenta'
                )}
              </button>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-line" />
                <span className="text-sm text-muted">o</span>
                <div className="h-px flex-1 bg-line" />
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-line py-3.5 text-base font-medium text-ink transition-colors hover:border-accent hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <GoogleIcon />
                Continuar con Google
              </button>

              {isLogin && (
                <div className="mt-5 text-center">
                  <button
                    type="button"
                    className="text-sm text-accent underline"
                    onClick={() => alert('Función de recuperación de contraseña')}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}
            </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
