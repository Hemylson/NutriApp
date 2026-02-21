// src/components/ListaPlanes.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Calendar, Trash2, Edit, Eye, X, Clock, User } from 'lucide-react';
import './ListaPlanes.css';

/**
 * Componente para listar planes de menú guardados
 */
export default function ListaPlanes({ idUsuario = 'usuario-temporal', onEditar, onCrear }) {
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  /**
   * Carga los planes guardados
   */
  const cargarPlanes = async () => {
    setCargando(true);
    try {
      const q = query(
        collection(db, 'usuarios', idUsuario, 'planesPlan'),
        orderBy('creadoEn', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const planesData = [];
      
      querySnapshot.forEach((doc) => {
        planesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setPlanes(planesData);
    } catch (error) {
      console.error('Error al cargar planes:', error);
      alert('Error al cargar los planes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlanes();
  }, [idUsuario]);

  /**
   * Elimina un plan
   */
  const eliminarPlan = async (id, nombrePaciente) => {
    if (!confirm(`¿Estás seguro de eliminar el plan de "${nombrePaciente}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'usuarios', idUsuario, 'planesPlan', id));
      await cargarPlanes();
      alert('✅ Plan eliminado exitosamente');
      
      if (planSeleccionado?.id === id) {
        setMostrarModal(false);
        setPlanSeleccionado(null);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el plan');
    }
  };

  /**
   * Abre el modal con los detalles del plan
   */
  const verDetalle = (plan) => {
    setPlanSeleccionado(plan);
    setMostrarModal(true);
  };

  /**
   * Cierra el modal
   */
  const cerrarModal = () => {
    setMostrarModal(false);
    setTimeout(() => setPlanSeleccionado(null), 300);
  };

  /**
   * Cuenta las preparaciones asignadas en un plan
   */
  const contarPreparaciones = (gridPlan) => {
    let count = 0;
    Object.values(gridPlan).forEach(tiempo => {
      Object.values(tiempo).forEach(prep => {
        if (prep) count++;
      });
    });
    return count;
  };

  /**
   * Calcula el total de celdas en el grid
   */
  const totalCeldas = (plan) => {
    return plan.tiemposComida.length * plan.numOpciones;
  };

  return (
    <div className="lista-planes-container">
      {/* Header */}
      <div className="planes-header">
        <div className="header-title">
          <Calendar className="header-icon" />
          <div>
            <h2 className="planes-title">Planes de Menú Guardados</h2>
            <p className="planes-subtitle">
              {planes.length} {planes.length === 1 ? 'plan guardado' : 'planes guardados'}
            </p>
          </div>
        </div>

        {/* Botón Nuevo Plan */}
        {onCrear && (
          <button 
            onClick={onCrear}
            className="btn-crear-nuevo"
          >
            <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Plan
          </button>
        )}
      </div>

      {/* Lista de planes */}
      {cargando ? (
        <div className="loading-state">
          <div className="loading-spinner-large" />
          <p>Cargando planes...</p>
        </div>
      ) : planes.length === 0 ? (
        <div className="empty-state">
          <Calendar className="empty-icon" />
          <h3>Aún no tienes planes guardados</h3>
          <p>Crea tu primer plan de menú para comenzar</p>
        </div>
      ) : (
        <div className="planes-grid">
          {planes.map((plan) => {
            const preparacionesAsignadas = contarPreparaciones(plan.gridPlan);
            const totalCeldasPlan = totalCeldas(plan);
            const porcentajeCompletado = Math.round((preparacionesAsignadas / totalCeldasPlan) * 100);

            return (
              <div key={plan.id} className="plan-card">
                {/* Header de la card */}
                <div className="plan-card-header">
                  <div className="paciente-info">
                    <User className="icon-sm" />
                    <h3 className="paciente-nombre">{plan.nombrePaciente}</h3>
                  </div>
                  <div className={`completion-badge ${porcentajeCompletado === 100 ? 'complete' : ''}`}>
                    {porcentajeCompletado}% completo
                  </div>
                </div>

                {/* Info del plan */}
                <div className="plan-info-grid">
                  <div className="info-item">
                    <span className="info-label">Tiempos de comida:</span>
                    <span className="info-value">{plan.tiemposComida.length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Opciones:</span>
                    <span className="info-value">{plan.numOpciones}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Preparaciones:</span>
                    <span className="info-value">{preparacionesAsignadas}/{totalCeldasPlan}</span>
                  </div>
                  {plan.creadoEn && (
                    <div className="info-item">
                      <Clock className="icon-xs" />
                      <span className="info-value">
                        {new Date(plan.creadoEn.seconds * 1000).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Preview de tiempos */}
                <div className="tiempos-preview">
                  {plan.tiemposComida.slice(0, 3).map((tiempo, idx) => (
                    <span key={idx} className="tiempo-tag">
                      {tiempo}
                    </span>
                  ))}
                  {plan.tiemposComida.length > 3 && (
                    <span className="tiempo-tag more">
                      +{plan.tiemposComida.length - 3}
                    </span>
                  )}
                </div>

                {/* Barra de progreso */}
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${porcentajeCompletado}%` }}
                  />
                </div>

                {/* Acciones */}
                <div className="plan-actions">
                  <button
                    onClick={() => verDetalle(plan)}
                    className="btn-action btn-view"
                    title="Ver detalles"
                  >
                    <Eye className="icon-sm" />
                    Ver
                  </button>
                  <button
                    onClick={() => onEditar && onEditar(plan)}
                    className="btn-action btn-edit"
                    title="Editar"
                  >
                    <Edit className="icon-sm" />
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarPlan(plan.id, plan.nombrePaciente)}
                    className="btn-action btn-delete"
                    title="Eliminar"
                  >
                    <Trash2 className="icon-sm" />
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de detalles */}
      {mostrarModal && planSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="modal-header">
              <h2 className="modal-title">
                Plan de: {planSeleccionado.nombrePaciente}
              </h2>
              <button onClick={cerrarModal} className="modal-close">
                <X className="icon-md" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="modal-body">
              {/* Info general */}
              <div className="modal-section">
                <h3 className="section-title">Información General</h3>
                <div className="info-grid">
                  <div className="info-detail">
                    <span className="detail-label">Tiempos de comida:</span>
                    <span className="detail-value">{planSeleccionado.tiemposComida.length}</span>
                  </div>
                  <div className="info-detail">
                    <span className="detail-label">Opciones por tiempo:</span>
                    <span className="detail-value">{planSeleccionado.numOpciones}</span>
                  </div>
                  <div className="info-detail">
                    <span className="detail-label">Total de celdas:</span>
                    <span className="detail-value">{totalCeldas(planSeleccionado)}</span>
                  </div>
                  <div className="info-detail">
                    <span className="detail-label">Preparaciones asignadas:</span>
                    <span className="detail-value">{contarPreparaciones(planSeleccionado.gridPlan)}</span>
                  </div>
                </div>
              </div>

              {/* Grid del plan */}
              <div className="modal-section">
                <h3 className="section-title">Distribución del Menú</h3>
                <div className="plan-grid-preview">
                  {planSeleccionado.tiemposComida.map(tiempo => (
                    <div key={tiempo} className="tiempo-section">
                      <h4 className="tiempo-header">{tiempo}</h4>
                      <div className="opciones-grid">
                        {Array.from({ length: planSeleccionado.numOpciones }, (_, i) => {
                          const opcion = i + 1;
                          const prep = planSeleccionado.gridPlan[tiempo]?.[opcion];
                          
                          return (
                            <div key={opcion} className="opcion-cell">
                              <div className="opcion-label">Opción {opcion}</div>
                              {prep ? (
                                <div className="prep-preview">
                                  <div className="prep-preview-nombre">{prep.nombre}</div>
                                  <div className="prep-preview-info">
                                    {prep.ingredientes?.length || 0} ingredientes
                                  </div>
                                </div>
                              ) : (
                                <div className="prep-empty">Sin asignar</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="modal-footer">
              <button
                onClick={() => {
                  cerrarModal();
                  onEditar && onEditar(planSeleccionado);
                }}
                className="btn-modal btn-edit-modal"
              >
                <Edit className="icon-sm" />
                Editar Plan
              </button>
              <button
                onClick={() => eliminarPlan(planSeleccionado.id, planSeleccionado.nombrePaciente)}
                className="btn-modal btn-delete-modal"
              >
                <Trash2 className="icon-sm" />
                Eliminar Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}