import React from 'react';
import { EyeOpenIcon, EyeClosedIcon } from '../icons/Icons';

export default function InputPassword({ 
  name, 
  placeholder, 
  value, 
  onChange, 
  mostrar, 
  onToggleMostrar, 
  required = false,
  readOnly = false,
  onCopy,
  onContextMenu,
  style
}) {
  return (
    <div className="password-wrapper">
      <input
        type={mostrar ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        onCopy={onCopy}
        onContextMenu={onContextMenu}
        style={style}
      />
      <button 
        type="button" 
        className="btn-eye" 
        onClick={onToggleMostrar}
      >
        {mostrar ? <EyeClosedIcon /> : <EyeOpenIcon />}
      </button>
    </div>
  );
}