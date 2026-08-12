import React from 'react';
import { KeyIcon, EditIcon, UserCheckIcon, UserXIcon } from '../icons/Icons';

const ACCIONES_TABLA = {
  clave: { Icono: KeyIcon, clase: 'btn-key', title: 'Ver Credenciales' },
  editar: { Icono: EditIcon, clase: 'btn-edit', title: 'Editar Datos' },
  activar: { Icono: UserCheckIcon, clase: 'btn-success-icon', title: 'Activar' },
  inactivar: { Icono: UserXIcon, clase: 'btn-danger-icon', title: 'Inactivar' }
}; 

export default function Boton({
  children,
  onClick,
  type = 'button',
  className = 'submit-btn',
  cargando = false,
  textoCargando = 'Procesando...',
  tipoAccion,
  title,
  style,
  disabled = false
}) {
  if (tipoAccion && ACCIONES_TABLA[tipoAccion]) {
    const { Icono, clase, title: defaultTitle } = ACCIONES_TABLA[tipoAccion];
    return (
      <button
        type={type}
        className={`btn-action ${clase} ${className}`.trim()}
        title={title || defaultTitle}
        onClick={onClick}
        style={style}
        disabled={cargando || disabled}
      >
        <Icono size={16} />
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      style={style}
      disabled={cargando || disabled}
    >
      {cargando ? textoCargando : children}
    </button>
  );
}
