import React from 'react';
import { X, KeyRound } from 'lucide-react';
import { useModalAccesos } from '../../hooks/useModalAcceso';
import InputPassword from '../../components/ui/InputPassword';
import './modalacceso.css';

export default function ModalAccesos({ cliente, onClose }) {
  const {
    copiado,
    mostrarClave,
    credenciales,
    cargando,
    copiarAlPortapapeles,
    toggleMostrar
  } = useModalAccesos(cliente);

  return (
    <div className="modal-backdrop">
      <div className="modal-box accesos-modal">
        <div className="modal-header">
          <div className="key-icon">
            <KeyRound size={20} color="#D97706" />
          </div>
          <h3>Bóveda de Credenciales - {cliente?.nombreRazonSocial || cliente?.nombre}</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} color="#64748B" />
          </button>
        </div>

        <div className="modal-body">
          {cargando ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>
              Cargando credenciales seguras...
            </p>
          ) : (
            <>
              {/* Agencia Virtual */}
              <div className="credential-row">
                <div className="input-group-modal">
                  <label>Agencia Virtual (SAT)</label>
                  <InputPassword
                    value={credenciales.claveAV || ''}
                    mostrar={mostrarClave.AV}
                    onToggleMostrar={() => toggleMostrar('AV')}
                    readOnly
                    onCopy={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ userSelect: 'none' }}
                  />
                </div>
                <button 
                  type="button" 
                  className="btn-copy"
                  onClick={() => copiarAlPortapapeles(credenciales.claveAV, 'AV')}
                >
                  {copiado === 'AV' ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>

              {/* FEL */}
              <div className="credential-row">
                <div className="input-group-modal">
                  <label>Factura Electrónica (FEL)</label>
                  <InputPassword
                    value={credenciales.claveFEL || ''}
                    mostrar={mostrarClave.FEL}
                    onToggleMostrar={() => toggleMostrar('FEL')}
                    readOnly
                    onCopy={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ userSelect: 'none' }}
                  />
                </div>
                <button 
                  type="button"
                  className="btn-copy"
                  onClick={() => copiarAlPortapapeles(credenciales.claveFEL, 'FEL')}
                >
                  {copiado === 'FEL' ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>

              {/* Correo */}
              <div className="credential-row">
                <div className="input-group-modal">
                  <label>Contraseña del Correo</label>
                  <InputPassword
                    value={credenciales.claveCorreo || ''}
                    mostrar={mostrarClave.Correo}
                    onToggleMostrar={() => toggleMostrar('Correo')}
                    readOnly
                    onCopy={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ userSelect: 'none' }}
                  />
                </div>
                <button 
                  type="button"
                  className="btn-copy"
                  onClick={() => copiarAlPortapapeles(credenciales.claveCorreo, 'Correo')}
                >
                  {copiado === 'Correo' ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}