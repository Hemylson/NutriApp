// src/components/GestionPreparaciones.jsx
import { useState } from 'react';
import FormularioPreparacion from './FormularioPreparacion.jsx';
import ListaPreparaciones from './ListaPreparaciones.jsx';
import { ArrowLeft } from 'lucide-react';
import './GestionPreparaciones.css';

/**
 * Componente integrado que maneja la lista y edición de preparaciones
 */
export default function GestionPreparaciones({ idUsuario = 'usuario-temporal' }) {
  const [vista, setVista] = useState('lista'); // 'lista' | 'crear' | 'editar'
  const [preparacionEditar, setPreparacionEditar] = useState(null);
  const [recargarLista, setRecargarLista] = useState(0);

  /**
   * Maneja la creación exitosa de una preparación
   */
  const handleGuardado = () => {
    setVista('lista');
    setPreparacionEditar(null);
    setRecargarLista(prev => prev + 1); // Fuerza recarga de la lista
  };

  /**
   * Maneja el inicio de edición
   */
  const handleEditar = (preparacion) => {
    setPreparacionEditar(preparacion);
    setVista('editar');
  };

  /**
   * Cancela la edición o creación
   */
  const handleCancelar = () => {
    setVista('lista');
    setPreparacionEditar(null);
  };

  return (
    <div className="gestion-container">
      {/* Header global con navegación */}
      {vista !== 'lista' && (
        <div className="header-navegacion">
          <button onClick={handleCancelar} className="btn-volver">
            <ArrowLeft className="icon-sm" />
            Volver a la lista
          </button>
        </div>
      )}

      {/* Vista: Lista */}
      {vista === 'lista' && (
        <>
          {/* Botón móvil */}
          <div className="mobile-create-button">
            <button 
              onClick={() => setVista('crear')}
              className="btn-crear-mobile"
            >
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Preparación
            </button>
          </div>

          <ListaPreparaciones 
            key={recargarLista}
            idUsuario={idUsuario}
            onEditar={handleEditar}
            onCrear={() => setVista('crear')}
          />
        </>
      )}

      {/* Vista: Crear */}
      {vista === 'crear' && (
        <div className="form-wrapper">
          <div className="form-header-section">
            <h2 className="form-main-title">Nueva Preparación</h2>
            <p className="form-main-subtitle">
              Crea un nuevo plato con sus ingredientes y método de cocción
            </p>
          </div>
          
          <FormularioPreparacion 
            idUsuario={idUsuario}
            onGuardado={handleGuardado}
            onCancelar={handleCancelar}
          />
        </div>
      )}

      {/* Vista: Editar */}
      {vista === 'editar' && preparacionEditar && (
        <div className="form-wrapper">
          <div className="form-header-section">
            <h2 className="form-main-title">Editar Preparación</h2>
            <p className="form-main-subtitle">
              Modifica los datos de: <strong>{preparacionEditar.nombre}</strong>
            </p>
          </div>
          
          <FormularioPreparacion 
            idUsuario={idUsuario}
            preparacionEditar={preparacionEditar}
            onGuardado={handleGuardado}
            onCancelar={handleCancelar}
          />
        </div>
      )}
    </div>
  );
}