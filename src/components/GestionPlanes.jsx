// src/components/GestionPlanes.jsx
import { useState } from 'react';
import PlanificadorMenu from './PlanificadorMenu.jsx';
import ListaPlanes from './ListaPlanes.jsx';
import { ArrowLeft } from 'lucide-react';
import './GestionPlanes.css';

/**
 * Componente integrado que maneja la lista y creación/edición de planes
 */
export default function GestionPlanes({ idUsuario = 'usuario-temporal' }) {
  const [vista, setVista] = useState('lista'); // 'lista' | 'crear' | 'editar'
  const [planEditar, setPlanEditar] = useState(null);
  const [recargarLista, setRecargarLista] = useState(0);

  /**
   * Maneja la creación/actualización exitosa de un plan
   */
  const handleGuardado = () => {
    setVista('lista');
    setPlanEditar(null);
    setRecargarLista(prev => prev + 1);
  };

  /**
   * Maneja el inicio de edición
   */
  const handleEditar = (plan) => {
    setPlanEditar(plan);
    setVista('editar');
  };

  /**
   * Cancela la edición o creación
   */
  const handleCancelar = () => {
    setVista('lista');
    setPlanEditar(null);
  };

  return (
    <div className="gestion-planes-container">
      {/* Header de navegación */}
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
              Nuevo Plan
            </button>
          </div>

          <ListaPlanes 
            key={recargarLista}
            idUsuario={idUsuario}
            onEditar={handleEditar}
            onCrear={() => setVista('crear')}
          />
        </>
      )}

      {/* Vista: Crear */}
      {vista === 'crear' && (
        <div className="planificador-wrapper">
          <div className="planificador-header-section">
            <h2 className="planificador-main-title">Nuevo Plan de Menú</h2>
            <p className="planificador-main-subtitle">
              Crea un plan nutricional asignando preparaciones a cada tiempo de comida
            </p>
          </div>
          
          <PlanificadorMenu 
            idUsuario={idUsuario}
            onGuardado={handleGuardado}
            onCancelar={handleCancelar}
          />
        </div>
      )}

      {/* Vista: Editar */}
      {vista === 'editar' && planEditar && (
        <div className="planificador-wrapper">
          <div className="planificador-header-section">
            <h2 className="planificador-main-title">Editar Plan de Menú</h2>
            <p className="planificador-main-subtitle">
              Modificando plan de: <strong>{planEditar.nombrePaciente}</strong>
            </p>
          </div>
          
          <PlanificadorMenu 
            idUsuario={idUsuario}
            planEditar={planEditar}
            onGuardado={handleGuardado}
            onCancelar={handleCancelar}
          />
        </div>
      )}
    </div>
  );
}