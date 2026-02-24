// src/components/PlanificadorMenu.jsx
import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Calendar, Clock, Plus, X, Save, Search, ChefHat } from 'lucide-react';
import { TIEMPOS_COMIDA, INTERCAMBIOS_NUTRICIONALES } from '../utils/constantes';
import './PlanificadorMenu.css';

/**
 * Planificador de menú - Asigna preparaciones a tiempos de comida
 */
export default function PlanificadorMenu({ 
  idUsuario = 'usuario-temporal',
  planEditar = null,
  onGuardado,
  onCancelar,
  datosNutricionales = null // Datos desde la calculadora
}) {
  // Estados del plan
  const [nombrePaciente, setNombrePaciente] = useState('');
  const [tiemposSeleccionados, setTiemposSeleccionados] = useState([
    'Desayuno',
    'Refrigerio AM',
    'Almuerzo',
    'Refrigerio PM',
    'Cena'
  ]);
  const [numOpciones, setNumOpciones] = useState(3);
  const [gridPlan, setGridPlan] = useState({});

  // Estados de UI
  const [preparaciones, setPreparaciones] = useState([]);
  const [busquedaPrep, setBusquedaPrep] = useState('');
  const [preparacionesFiltradas, setPreparacionesFiltradas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [mostrarSelectorPrep, setMostrarSelectorPrep] = useState(false);
  const [celdaActiva, setCeldaActiva] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idPlan, setIdPlan] = useState(null);

  /**
   * Carga datos nutricionales si vienen de la calculadora
   */
  useEffect(() => {
    if (datosNutricionales) {
      // Pre-cargar nombre del paciente si viene
      if (datosNutricionales.nombrePaciente) {
        setNombrePaciente(datosNutricionales.nombrePaciente);
      }
    }
  }, [datosNutricionales]);

  /**
   * Carga los datos del plan a editar
   */
  useEffect(() => {
    if (planEditar) {
      setModoEdicion(true);
      setIdPlan(planEditar.id);
      setNombrePaciente(planEditar.nombrePaciente || '');
      setTiemposSeleccionados(planEditar.tiemposComida || []);
      setNumOpciones(planEditar.numOpciones || 3);
      setGridPlan(planEditar.gridPlan || {});
    }
  }, [planEditar]);

  /**
   * Carga las preparaciones disponibles
   */
  useEffect(() => {
    const cargarPreparaciones = async () => {
      try {
        const q = query(
          collection(db, 'usuarios', idUsuario, 'preparaciones'),
          orderBy('nombre', 'asc')
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
      }
    };

    cargarPreparaciones();
  }, [idUsuario]);

  /**
   * Inicializa el grid del plan
   */
  useEffect(() => {
    const nuevoGrid = {};
    tiemposSeleccionados.forEach(tiempo => {
      nuevoGrid[tiempo] = {};
      for (let i = 1; i <= numOpciones; i++) {
        nuevoGrid[tiempo][i] = null;
      }
    });
    setGridPlan(nuevoGrid);
  }, [tiemposSeleccionados, numOpciones]);

  /**
   * Filtra preparaciones por búsqueda
   */
  useEffect(() => {
    if (!busquedaPrep.trim()) {
      setPreparacionesFiltradas(preparaciones);
      return;
    }

    const filtradas = preparaciones.filter(prep =>
      prep.nombre.toLowerCase().includes(busquedaPrep.toLowerCase())
    );
    setPreparacionesFiltradas(filtradas);
  }, [busquedaPrep, preparaciones]);

  /**
   * Abre el selector de preparación para una celda
   */
  const abrirSelector = (tiempo, opcion) => {
    setCeldaActiva({ tiempo, opcion });
    setMostrarSelectorPrep(true);
    setBusquedaPrep('');
  };

  /**
   * Asigna una preparación a una celda
   */
  const asignarPreparacion = (preparacion) => {
    if (!celdaActiva) return;

    setGridPlan(prev => ({
      ...prev,
      [celdaActiva.tiempo]: {
        ...prev[celdaActiva.tiempo],
        [celdaActiva.opcion]: preparacion
      }
    }));

    setMostrarSelectorPrep(false);
    setCeldaActiva(null);
  };

  /**
   * Remueve una preparación de una celda
   */
  const removerPreparacion = (tiempo, opcion) => {
    setGridPlan(prev => ({
      ...prev,
      [tiempo]: {
        ...prev[tiempo],
        [opcion]: null
      }
    }));
  };

  /**
   * Guarda o actualiza el plan en Firestore
   */
  const guardarPlan = async () => {
    if (!nombrePaciente.trim()) {
      alert('Por favor ingresa el nombre del paciente');
      return;
    }

    setGuardando(true);

    try {
      const planData = {
        nombrePaciente: nombrePaciente.trim(),
        tiemposComida: tiemposSeleccionados,
        numOpciones,
        gridPlan,
        actualizadoEn: Timestamp.now()
      };

      if (modoEdicion && idPlan) {
        // Actualizar plan existente
        const docRef = doc(db, 'usuarios', idUsuario, 'planesPlan', idPlan);
        await updateDoc(docRef, planData);
        
        console.log('Plan actualizado con ID:', idPlan);
        alert('✅ Plan actualizado exitosamente');
        
        if (onGuardado) {
          onGuardado({ id: idPlan, ...planData });
        }
      } else {
        // Crear nuevo plan
        planData.idUsuario = idUsuario;
        planData.creadoEn = Timestamp.now();

        const docRef = await addDoc(
          collection(db, 'usuarios', idUsuario, 'planesPlan'),
          planData
        );

        console.log('Plan guardado con ID:', docRef.id);
        alert('✅ Plan guardado exitosamente');

        if (onGuardado) {
          onGuardado({ id: docRef.id, ...planData });
        }
      }
    } catch (error) {
      console.error('Error al guardar plan:', error);
      alert(modoEdicion ? 'Error al actualizar el plan' : 'Error al guardar el plan');
    } finally {
      setGuardando(false);
    }
  };

  /**
   * Obtiene el ícono de reloj según el tiempo de comida
   */
  const obtenerHoraTiempo = (tiempo) => {
    const horas = {
      'Desayuno': '7:00 AM',
      'Refrigerio AM': '10:00 AM',
      'Almuerzo': '12:00 PM',
      'Refrigerio PM': '3:00 PM',
      'Cena': '7:00 PM'
    };
    return horas[tiempo] || '';
  };

  return (
    <div className="planificador-container">
      {/* Header */}
      <div className="planificador-header">
        <div className="header-icon-wrapper">
          <Calendar className="header-icon" />
        </div>
        <div>
          <h2 className="planificador-title">Planificador de Menú</h2>
          <p className="planificador-subtitle">
            Asigna preparaciones a cada tiempo de comida
          </p>
        </div>
      </div>

      {/* Card de requerimientos nutricionales (si vienen de calculadora) */}
      {datosNutricionales && (
        <div className="requerimientos-card">
          <h3 className="requerimientos-title">🎯 Requerimientos Nutricionales</h3>
          <div className="requerimientos-grid">
            <div className="req-item">
              <span className="req-label">Calorías</span>
              <span className="req-value">{datosNutricionales.calorias} kcal</span>
            </div>
            <div className="req-item">
              <span className="req-label">Proteínas</span>
              <span className="req-value">{datosNutricionales.proteinas} g</span>
            </div>
            <div className="req-item">
              <span className="req-label">Carbohidratos</span>
              <span className="req-value">{datosNutricionales.carbohidratos} g</span>
            </div>
            <div className="req-item">
              <span className="req-label">Grasas</span>
              <span className="req-value">{datosNutricionales.grasas} g</span>
            </div>
          </div>
        </div>
      )}

      {/* Configuración del plan */}
      <div className="config-card">
        <h3 className="config-title">Configuración del Plan</h3>
        
        <div className="config-grid">
          <div className="config-field">
            <label className="config-label">Nombre del Paciente *</label>
            <input
              type="text"
              value={nombrePaciente}
              onChange={(e) => setNombrePaciente(e.target.value)}
              placeholder="Ej: María González"
              className="config-input"
            />
          </div>

          <div className="config-field">
            <label className="config-label">Número de Opciones</label>
            <select
              value={numOpciones}
              onChange={(e) => setNumOpciones(parseInt(e.target.value))}
              className="config-select"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <option key={num} value={num}>{num} opción{num > 1 ? 'es' : ''}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid del plan */}
      <div className="plan-grid-card">
        <div className="plan-grid-wrapper">
          <table className="plan-table">
            <thead>
              <tr>
                <th className="col-tiempo">Tiempo de Comida</th>
                {Array.from({ length: numOpciones }, (_, i) => (
                  <th key={i} className="col-opcion">
                    Opción {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tiemposSeleccionados.map(tiempo => (
                <tr key={tiempo} className="row-tiempo">
                  <td className="cell-tiempo">
                    <div className="tiempo-info">
                      <span className="tiempo-nombre">{tiempo}</span>
                      <span className="tiempo-hora">
                        <Clock className="icon-xs" />
                        {obtenerHoraTiempo(tiempo)}
                      </span>
                    </div>
                  </td>
                  {Array.from({ length: numOpciones }, (_, i) => {
                    const opcion = i + 1;
                    const prep = gridPlan[tiempo]?.[opcion];
                    
                    return (
                      <td key={opcion} className="cell-preparacion">
                        {prep ? (
                          <div className="prep-asignada">
                            <div className="prep-nombre">{prep.nombre}</div>
                            <div className="prep-info">
                              {prep.ingredientes.length} ingredientes
                            </div>
                            {prep.intercambios && Object.values(prep.intercambios).some(val => val > 0) && (
                              <div className="prep-intercambios">
                                {Object.entries(prep.intercambios)
                                  .filter(([_, value]) => value > 0)
                                  .map(([key, value]) => {
                                    const intercambio = INTERCAMBIOS_NUTRICIONALES.find(i => i.id === key);
                                    return intercambio ? (
                                      <span 
                                        key={key}
                                        className="intercambio-badge-mini"
                                        style={{
                                          '--badge-color': intercambio.color,
                                          '--badge-border': intercambio.borderColor
                                        }}
                                        title={intercambio.nombre}
                                      >
                                        {intercambio.iniciales}: {value}
                                      </span>
                                    ) : null;
                                  })}
                              </div>
                            )}
                            <button
                              onClick={() => removerPreparacion(tiempo, opcion)}
                              className="btn-remover"
                              title="Remover"
                            >
                              <X className="icon-xs" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => abrirSelector(tiempo, opcion)}
                            className="btn-agregar"
                          >
                            <Plus className="icon-sm" />
                            Agregar
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="planificador-actions">
        <button
          onClick={guardarPlan}
          disabled={guardando || !nombrePaciente.trim()}
          className="btn-guardar-plan"
        >
          <Save className="icon-sm" />
          {guardando 
            ? (modoEdicion ? 'Actualizando...' : 'Guardando...') 
            : (modoEdicion ? 'Actualizar Plan' : 'Guardar Plan')
          }
        </button>
      </div>

      {/* Modal selector de preparación */}
      {mostrarSelectorPrep && (
        <div className="modal-overlay" onClick={() => setMostrarSelectorPrep(false)}>
          <div className="modal-selector" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Seleccionar Preparación</h3>
              <button
                onClick={() => setMostrarSelectorPrep(false)}
                className="modal-close"
              >
                <X className="icon-md" />
              </button>
            </div>

            <div className="modal-body">
              {/* Búsqueda */}
              <div className="search-prep">
                <Search className="search-icon" />
                <input
                  type="text"
                  value={busquedaPrep}
                  onChange={(e) => setBusquedaPrep(e.target.value)}
                  placeholder="Buscar preparación..."
                  className="search-input"
                  autoFocus
                />
              </div>

              {/* Lista de preparaciones */}
              <div className="prep-list">
                {preparacionesFiltradas.length === 0 ? (
                  <div className="no-prep">
                    <ChefHat className="icon-lg" />
                    <p>
                      {busquedaPrep 
                        ? 'No se encontraron preparaciones'
                        : 'No tienes preparaciones guardadas'
                      }
                    </p>
                  </div>
                ) : (
                  preparacionesFiltradas.map(prep => (
                    <button
                      key={prep.id}
                      onClick={() => asignarPreparacion(prep)}
                      className="prep-item-selector"
                    >
                      <div className="prep-item-header">
                        <div className="prep-item-nombre">{prep.nombre}</div>
                        <div className="prep-item-meta">
                          <span className="prep-meta-ingredientes">
                            {prep.ingredientes.length} ing.
                          </span>
                          {prep.metodoCoccion && (
                            <span className="prep-meta-metodo">
                              {prep.metodoCoccion}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Intercambios */}
                      {prep.intercambios && Object.values(prep.intercambios).some(val => val > 0) && (
                        <div className="prep-intercambios-list">
                          {Object.entries(prep.intercambios)
                            .filter(([_, value]) => value > 0)
                            .map(([key, value]) => {
                              const intercambio = INTERCAMBIOS_NUTRICIONALES.find(i => i.id === key);
                              return intercambio ? (
                                <span 
                                  key={key}
                                  className="intercambio-badge-selector"
                                  style={{
                                    '--badge-color': intercambio.color,
                                    '--badge-border': intercambio.borderColor
                                  }}
                                  title={intercambio.nombre}
                                >
                                  {intercambio.iniciales}: {value}
                                </span>
                              ) : null;
                            })}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}