import { useState } from 'react';
import api, { UsuariosAPI, setAuthToken } from '../api/axiosConfig';

export function useLogin(onLoginSuccess) {
  // Vistas
  const [isSignUp, setIsSignUp] = useState(false);
  const [vistaOlvidado, setVistaOlvidado] = useState(false);

  // Visibilidad de contraseñas
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
  const [mostrarSignUpPassword, setMostrarSignUpPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    rememberMe: false
  });

  // Recuperación
  const [pasoRecuperacion, setPasoRecuperacion] = useState(1); 
  const [resetToken, setResetToken] = useState('');
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');

  // Interfaz
  const [errorMsg, setErrorMsg] = useState(''); 
  const [successMsg, setSuccessMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setCargando(true);

    try {
      const res = await UsuariosAPI.login({
        correo: formData.email,
        password: formData.password
      });

      const responseData = res.data;
      // Extrae el token enviado por Spring Boot
      const token = responseData.token || responseData.usuario?.token;
      const user = responseData.usuario || responseData;

      // SI SPRING BOOT NO ENVIÓ TOKEN, BLOQUEA EL INGRESO
      if (!token) {
        setErrorMsg('El servidor no devolvió el token JWT. Verifica la respuesta del backend.');
        return; 
      }

      // Almacena el token para Axios
      setAuthToken(token);
      
      // Pasa al Dashboard solo si hay token
      onLoginSuccess(user);

    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setErrorMsg('No se puede conectar con el backend (puerto 8080). Asegúrate de tener Spring Boot encendido.');
      } else {
        setErrorMsg(err.response?.data?.mensaje || 'Credenciales o respuesta de servidor inválida.');
      }
    } finally {
      setCargando(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      await UsuariosAPI.crear({
        nombre: `${formData.firstName} ${formData.lastName}`.trim(),
        correo: formData.email,
        passwordHash: formData.password,
        rol: 'CONTADOR'
      });

      setSuccessMsg('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
      setIsSignUp(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.mensaje || 'Error al registrar la cuenta.');
    } finally {
      setCargando(false);
    }
  };

  const handleRecuperarSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.email) {
      setErrorMsg('Por favor ingresa tu correo electrónico.');
      return;
    }

    setCargando(true);

    try {
      const res = await api.post('/usuarios/recuperar-password', {
        correo: formData.email
      });

      if (res.data?.token) {
        setResetToken(res.data.token);
      }
      
      setSuccessMsg('Código generado. Ingresa el código recibido para continuar.');
      setPasoRecuperacion(2);
    } catch (err) {
      setErrorMsg(err.response?.data?.mensaje || 'No se encontró un usuario con este correo.');
    } finally {
      setCargando(false);
    }
  };

  const handleRestablecerSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setCargando(true);

    try {
      await api.post('/usuarios/restablecer-password', {
        token: resetToken,
        codigo: codigoVerificacion,
        nuevaPassword: nuevaPassword
      });

      setSuccessMsg('¡Contraseña cambiada con éxito! Ya puedes iniciar sesión.');
      setTimeout(() => {
        setVistaOlvidado(false);
        setPasoRecuperacion(1);
        setResetToken('');
        setCodigoVerificacion('');
        setNuevaPassword('');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.mensaje || 'El código o token es inválido o expiró.');
    } finally {
      setCargando(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`La autenticación con ${provider} requiere configuración de OAuth en Spring Boot.`);
  };

  return {
    isSignUp, setIsSignUp,
    vistaOlvidado, setVistaOlvidado,
    mostrarPassword, setMostrarPassword,
    mostrarNuevaPassword, setMostrarNuevaPassword,
    mostrarSignUpPassword, setMostrarSignUpPassword,
    mostrarConfirmPassword, setMostrarConfirmPassword,
    formData, handleChange,
    pasoRecuperacion, setPasoRecuperacion,
    codigoVerificacion, setCodigoVerificacion,
    nuevaPassword, setNuevaPassword,
    errorMsg, setErrorMsg,
    successMsg, setSuccessMsg,
    cargando,
    handleLoginSubmit,
    handleSignUpSubmit,
    handleRecuperarSubmit,
    handleRestablecerSubmit,
    handleSocialLogin
  };
}