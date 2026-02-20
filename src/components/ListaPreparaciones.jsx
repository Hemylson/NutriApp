// src/components/ListaPreparaciones.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Search, Trash2, Edit, Eye, ChefHat, X, Clock, Utensils } from 'lucide-react';
import './ListaPreparaciones.css';

/**
 * Componente para listar, ver, editar y eliminar preparaciones guardadas
 */
export default function ListaPreparaciones({ idUsuario = 'usuario-temporal', onEditar, onCrear }) {
  // Estados
  const [preparaciones, setPreparaciones] = useState([]);
  const [preparacionesFiltradas, setPreparacionesFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [preparacionSeleccionada, setPreparacionSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  /**
   * Carga las preparaciones desde Firestore
   */
  const cargarPreparaciones = async () => {
    setCargando(true);
    try {
      const q = query(
        collection(db, 'usuarios', idUsuario, 'preparaciones'),
        orderBy('creadoEn', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const preps = [];
      
      querySnapshot.forEach((doc) => {
        preps.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setPreparaciones(preps);
      setPreparacionesFiltradas(preps);
    } catch (error) {
      console.error('Error al cargar preparaciones:', error);
      alert('Error al cargar las preparaciones');
    } finally {
      setCargando(false);
    }
  };

  // Cargar preparaciones al montar el componente
  useEffect(() => {
    cargarPreparaciones();
  }, [idUsuario]);

  /**
   * Filtra preparaciones por búsqueda
   */
  useEffect(() => {
    if (!busqueda.trim()) {
      setPreparacionesFiltradas(preparaciones);
      return;
    }

    const filtradas = preparaciones.filter(prep =>
      prep.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      prep.ingredientes.some(ing => 
        ing.alimento.toLowerCase().includes(busqueda.toLowerCase())
      ) ||
      (prep.metodoCoccion && prep.metodoCoccion.toLowerCase().includes(busqueda.toLowerCase()))
    );

    setPreparacionesFiltradas(filtradas);
  }, [busqueda, preparaciones]);

  /**
   * Elimina una preparación
   */
  const eliminarPreparacion = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'usuarios', idUsuario, 'preparaciones', id));
      await cargarPreparaciones();
      alert('✅ Preparación eliminada exitosamente');
      
      if (preparacionSeleccionada?.id === id) {
        setMostrarModal(false);
        setPreparacionSeleccionada(null);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar la preparación');
    }
  };

  /**
   * Abre el modal con los detalles de la preparación
   */
  const verDetalle = (preparacion) => {
    setPreparacionSeleccionada(preparacion);
    setMostrarModal(true);
  };

  /**
   * Cierra el modal
   */
  const cerrarModal = () => {
    setMostrarModal(false);
    setTimeout(() => setPreparacionSeleccionada(null), 300);
  };

  return (
    <div className="lista-container">
      {/* Header con búsqueda */}
      <div className="lista-header">
        <div className="header-title">
          <ChefHat className="header-icon" />
          <div>
            <h2 className="lista-title">Mis Preparaciones</h2>
            <p className="lista-subtitle">
              {preparaciones.length} {preparaciones.length === 1 ? 'preparación guardada' : 'preparaciones guardadas'}
            </p>
          </div>
        </div>

        {/* Botón Nueva Preparación */}
        {onCrear && (
          <button 
            onClick={onCrear}
            className="btn-crear-nuevo"
          >
            <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Preparación
          </button>
        )}
      </div>

      {/* Buscador - Segunda fila */}
      <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, ingrediente o método..."
            className="search-input"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="clear-search"
              title="Limpiar búsqueda"
            >
              <X className="icon-sm" />
            </button>
          )}
      </div>

      {/* Lista de preparaciones */}
      {cargando ? (
        <div className="loading-state">
          <div className="loading-spinner-large" />
          <p>Cargando preparaciones...</p>
        </div>
      ) : preparacionesFiltradas.length === 0 ? (
        <div className="empty-state">
          <ChefHat className="empty-icon" />
          <h3>
            {busqueda 
              ? 'No se encontraron preparaciones' 
              : 'Aún no tienes preparaciones guardadas'
            }
          </h3>
          <p>
            {busqueda
              ? 'Intenta con otros términos de búsqueda'
              : 'Crea tu primera preparación para comenzar'
            }
          </p>
        </div>
      ) : (
        <div className="preparaciones-grid">
          {preparacionesFiltradas.map((prep) => (
            <div key={prep.id} className="preparacion-card">
              {/* Header de la card */}
              <div className="card-header">
                <h3 className="card-title">{prep.nombre}</h3>
                {prep.metodoCoccion && (
                  <span className="metodo-badge">
                    <Utensils className="icon-xs" />
                    {prep.metodoCoccion}
                  </span>
                )}
              </div>

              {/* Info rápida */}
              <div className="card-info">
                <div className="info-item">
                  <span className="info-label">Ingredientes:</span>
                  <span className="info-value">{prep.ingredientes.length}</span>
                </div>
                {prep.creadoEn && (
                  <div className="info-item">
                    <Clock className="icon-xs" />
                    <span className="info-value">
                      {new Date(prep.creadoEn.seconds * 1000).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>

              {/* Preview de ingredientes */}
              <div className="ingredientes-preview">
                {prep.ingredientes.slice(0, 3).map((ing, idx) => (
                  <span key={idx} className="ingrediente-tag">
                    {ing.alimento}
                  </span>
                ))}
                {prep.ingredientes.length > 3 && (
                  <span className="ingrediente-tag more">
                    +{prep.ingredientes.length - 3} más
                  </span>
                )}
              </div>

              {/* Acciones */}
              <div className="card-actions">
                <button
                  onClick={() => verDetalle(prep)}
                  className="btn-action btn-view"
                  title="Ver detalles"
                >
                  <Eye className="icon-sm" />
                  Ver
                </button>
                <button
                  onClick={() => onEditar && onEditar(prep)}
                  className="btn-action btn-edit"
                  title="Editar"
                >
                  <Edit className="icon-sm" />
                  Editar
                </button>
                <button
                  onClick={() => eliminarPreparacion(prep.id, prep.nombre)}
                  className="btn-action btn-delete"
                  title="Eliminar"
                >
                  <Trash2 className="icon-sm" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {mostrarModal && preparacionSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="modal-header">
              <h2 className="modal-title">{preparacionSeleccionada.nombre}</h2>
              <button onClick={cerrarModal} className="modal-close">
                <X className="icon-md" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="modal-body">
              {/* Método de cocción */}
              {preparacionSeleccionada.metodoCoccion && (
                <div className="detalle-section">
                  <h3 className="detalle-title">
                    <Utensils className="icon-sm" />
                    Método de cocción
                  </h3>
                  <p className="detalle-text">{preparacionSeleccionada.metodoCoccion}</p>
                </div>
              )}

              {/* Ingredientes */}
              <div className="detalle-section">
                <h3 className="detalle-title">
                  <ChefHat className="icon-sm" />
                  Ingredientes ({preparacionSeleccionada.ingredientes.length})
                </h3>
                <ul className="ingredientes-list">
                  {preparacionSeleccionada.ingredientes.map((ing, idx) => (
                    <li key={idx} className="ingrediente-item-detail">
                      <span className="ingrediente-numero">{idx + 1}</span>
                      <span className="ingrediente-nombre">{ing.alimento}</span>
                      <span className="ingrediente-cantidad">
                        {ing.cantidad} {ing.unidad}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Acompañamiento */}
              {preparacionSeleccionada.acompanamiento && (
                <div className="detalle-section">
                  <h3 className="detalle-title">Acompañamiento</h3>
                  <p className="detalle-text">{preparacionSeleccionada.acompanamiento}</p>
                </div>
              )}

              {/* Notas */}
              {preparacionSeleccionada.notas && (
                <div className="detalle-section">
                  <h3 className="detalle-title">Notas</h3>
                  <p className="detalle-text">{preparacionSeleccionada.notas}</p>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="modal-footer">
              <button
                onClick={() => {
                  cerrarModal();
                  onEditar && onEditar(preparacionSeleccionada);
                }}
                className="btn-modal btn-edit-modal"
              >
                <Edit className="icon-sm" />
                Editar
              </button>
              <button
                onClick={() => eliminarPreparacion(preparacionSeleccionada.id, preparacionSeleccionada.nombre)}
                className="btn-modal btn-delete-modal"
              >
                <Trash2 className="icon-sm" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}