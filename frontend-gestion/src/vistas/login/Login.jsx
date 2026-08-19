import React from 'react';
import { useLogin } from '../../hooks/useLogin';
import InputPassword from '../../components/ui/InputPassword';
import Boton from '../../components/ui/Boton';
import { UsersIcon } from '../../components/icons/Icons';
import './login.css';

export default function Login({ onLoginSuccess }) {
  const {
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
    handleSocialLogin,
    resetMessages
  } = useLogin(onLoginSuccess);

  return (
    <div className="embossed-page-wrapper">
      <div className={`embossed-container ${isSignUp ? 'right-panel-active' : ''}`}>
        
        {/* FORMULARIO REGISTRO */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignUpSubmit}>
            <h2>Crear Cuenta</h2>
            <p className="subtitle">Regístrate y comienza tu experiencia</p>

            {errorMsg && isSignUp && <div className="alert-message error">{errorMsg}</div>}

            <div className="input-row">
              <div className="input-group">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Nombre"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Apellido"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <InputPassword
                name="password"
                placeholder="Crear contraseña"
                value={formData.password}
                onChange={handleChange}
                mostrar={mostrarSignUpPassword}
                onToggleMostrar={() => setMostrarSignUpPassword((prev) => !prev)}
                required
              />
            </div>

            <div className="input-group">
              <InputPassword
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                mostrar={mostrarConfirmPassword}
                onToggleMostrar={() => setMostrarConfirmPassword((prev) => !prev)}
                required
              />
            </div>

            <Boton type="submit" cargando={cargando} textoCargando="Procesando...">
              Crear Cuenta
            </Boton>

          </form>
        </div>

        {/* FORMULARIO INICIO DE SESIÓN / RECUPERAR CONTRASEÑA */}
        <div className="form-container sign-in-container">
          {!vistaOlvidado ? (
            <form onSubmit={handleLoginSubmit}>
              <h2>Iniciar Sesión</h2>
              <p className="subtitle">Ingresa para acceder a tu panel de control</p>

              {errorMsg && !isSignUp && <div className="alert-message error">{errorMsg}</div>}
              {successMsg && <div className="alert-message success">{successMsg}</div>}

              <div className="input-group">
                <input
                  type="text"
                  name="email"
                  placeholder="Nombre de usuario o correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <InputPassword
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  mostrar={mostrarPassword}
                  onToggleMostrar={() => setMostrarPassword((prev) => !prev)}
                  required
                />
              </div>

              <div className="options-row">
                <button
                  type="button"
                  className="btn-forgot-link"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setVistaOlvidado(true);
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Boton type="submit" cargando={cargando} textoCargando="Ingresando...">
                Ingresar Ahora
              </Boton>

              {/* REDIRECCIÓN MEJORADA A VISTA PÚBLICA */}
              <div className="nit-public-access-card">
                <span>¿Eres cliente y buscas tus declaraciones?</span>
                <button
                  type="button"
                  className="btn-consulta-nit"
                  onClick={() => {
                    window.location.href = '/consulta';
                  }}
                >
                  <UsersIcon size={16} /> Consultar por NIT
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={pasoRecuperacion === 1 ? handleRecuperarSubmit : handleRestablecerSubmit}>
              <h2>Recuperar Contraseña</h2>
              <p className="subtitle">
                {pasoRecuperacion === 1 
                  ? 'Ingresa tu correo para recibir las instrucciones y el código' 
                  : 'Ingresa el código generado y tu nueva contraseña'}
              </p>

              {errorMsg && <div className="alert-message error">{errorMsg}</div>}
              {successMsg && <div className="alert-message success">{successMsg}</div>}

              {pasoRecuperacion === 1 ? (
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="input-group">
                    <input
                      type="text"
                      name="codigoVerificacion"
                      placeholder="Código de verificación"
                      value={codigoVerificacion}
                      onChange={(e) => setCodigoVerificacion(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <InputPassword
                      name="nuevaPassword"
                      placeholder="Nueva contraseña"
                      value={nuevaPassword}
                      onChange={(e) => setNuevaPassword(e.target.value)}
                      mostrar={mostrarNuevaPassword}
                      onToggleMostrar={() => setMostrarNuevaPassword((prev) => !prev)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <Boton 
                  type="submit" 
                  className="btn-primary" 
                  cargando={cargando} 
                  textoCargando="Procesando..."
                >
                  {pasoRecuperacion === 1 ? 'Enviar Código' : 'Restablecer Contraseña'}
                </Boton>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setVistaOlvidado(false);
                    setPasoRecuperacion(1);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                >
                  ← Volver al Inicio de Sesión
                </button>
              </div>
            </form>
          )}
        </div>

        {/* OVERLAY DESLIZANTE */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <span className="badge">¡Bienvenido de nuevo!</span>
              <p>Ingresa tus datos para continuar disfrutando de la plataforma.</p>
              <button
                className="ghost-btn"
                onClick={() => {
                  resetMessages();
                  setVistaOlvidado(false);
                  setIsSignUp(false);
                }}
              >
                Iniciar Sesión
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <span className="badge">Únete a nosotros</span>
              <h2>¿Ya tienes una cuenta?</h2>
              <p>Inicia sesión para continuar disfrutando de nuestro sistema.</p>
              <button
                className="ghost-btn"
                onClick={() => {
                  resetMessages();
                  setVistaOlvidado(false);
                  setIsSignUp(true);
                }}
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}