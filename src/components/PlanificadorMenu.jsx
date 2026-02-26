// src/components/PlanificadorMenu.jsx
import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Calendar, Clock, Plus, X, Save, Search, ChefHat, Download } from 'lucide-react';
import { TIEMPOS_COMIDA, INTERCAMBIOS_NUTRICIONALES } from '../utils/constantes';
import './PlanificadorMenu.css';
import { generarPDFProfesional } from '../utils/pdfGenerator'; 

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
  // 🔍 DEBUG: Verificar qué llega
  console.log('=== PLANIFICADOR RECIBIÓ ===');
  console.log('datosNutricionales:', datosNutricionales);
  console.log('intercambios:', datosNutricionales?.intercambios);
  console.log('===========================');

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
  const [exportando, setExportando] = useState(false);
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
   * Calcula los intercambios totales del plan actual
   */
  const calcularIntercambiosDelPlan = () => {
    const totales = {
      lecheDescremada: 0,
      lecheSemidescremada: 0,
      lecheEntera: 0,
      vegetales: 0,
      frutas: 0,
      panesCereales: 0,
      cerealesConGrasa: 0,
      cerealesSinGrasa: 0,
      proteinasMagras: 0,
      proteinasSemimagras: 0,
      proteinasAltas: 0,
      grasas: 0
    };

    // Recorrer todo el grid del plan
    Object.values(gridPlan).forEach(tiempoData => {
      Object.values(tiempoData).forEach(prep => {
        if (prep && prep.intercambios) {
          // Sumar intercambios de cada preparación
          Object.entries(prep.intercambios).forEach(([key, value]) => {
            const cantidad = parseFloat(value) || 0;
            if (cantidad > 0 && totales.hasOwnProperty(key)) {
              totales[key] += cantidad;
            }
          });
        }
      });
    });

    return totales;
  };

  /**
   * Compara intercambios del plan vs objetivo
   */
  const compararIntercambios = () => {
    if (!datosNutricionales?.intercambios) return [];

    const actuales = calcularIntercambiosDelPlan();
    const comparacion = [];

    // Mapeo de intercambios de calculadora a sistema del planificador
    const mapeo = {
      'lacteos.descremados': { key: 'lecheDescremada', nombre: 'Leche Descremada', sigla: 'LD', color: '#E3F2FD', border: '#90CAF9' },
      'lacteos.semidescremados': { key: 'lecheSemidescremada', nombre: 'Leche Semidescremada', sigla: 'LS', color: '#BBDEFB', border: '#64B5F6' },
      'lacteos.enteros': { key: 'lecheEntera', nombre: 'Leche Entera', sigla: 'LE', color: '#90CAF9', border: '#42A5F5' },
      'verduras.verduras': { key: 'vegetales', nombre: 'Vegetales', sigla: 'V', color: '#E8F5E9', border: '#81C784' },
      'frutas.frutas': { key: 'frutas', nombre: 'Frutas', sigla: 'F', color: '#FFF9C4', border: '#FFD54F' },
      'cereales.panesCereales': { key: 'panesCereales', nombre: 'Panes y Cereales', sigla: 'PC', color: '#FFE0B2', border: '#FFB74D' },
      'cereales.conGrasa': { key: 'cerealesConGrasa', nombre: 'Cereales con Grasa', sigla: 'CG', color: '#FFE0B2', border: '#FFB74D' },
      'cereales.sinGrasa': { key: 'cerealesSinGrasa', nombre: 'Cereales sin Grasa', sigla: 'CSG', color: '#FFE0B2', border: '#FFB74D' },
      'proteinas.magra': { key: 'proteinasMagras', nombre: 'Proteína Magra', sigla: 'PM', color: '#FCE4EC', border: '#F48FB1' },
      'proteinas.mediana': { key: 'proteinasSemimagras', nombre: 'Proteína Semimagra', sigla: 'PS', color: '#F8BBD0', border: '#EC407A' },
      'proteinas.alta': { key: 'proteinasAltas', nombre: 'Proteína Alta', sigla: 'PA', color: '#FCE4EC', border: '#F48FB1' },
      'grasas.grasas': { key: 'grasas', nombre: 'Grasas', sigla: 'G', color: '#FFF8E1', border: '#FFC107' }
    };

    // Procesar cada grupo
    Object.entries(mapeo).forEach(([path, info]) => {
      const [categoria, subcategoria] = path.split('.');
      const objetivo = datosNutricionales.intercambios?.[categoria]?.[subcategoria]?.intercambios || 0;
      const actual = actuales[info.key] || 0;

      if (objetivo > 0) {
        const diferencia = actual - objetivo;
        const porcentaje = objetivo > 0 ? Math.round((actual / objetivo) * 100) : 0;
        
        let estado = 'correcto';
        if (actual < objetivo) estado = 'falta';
        if (actual > objetivo) estado = 'sobra';

        comparacion.push({
          ...info,
          objetivo,
          actual,
          diferencia,
          porcentaje,
          estado
        });
      }
    });

    return comparacion;
  };

  // Recalcular cuando cambie el grid
  const comparacionIntercambios = compararIntercambios();

  /**
   * Calcula los macronutrientes totales del plan
   */
  const calcularMacrosDelPlan = () => {
    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarbohidratos = 0;
    let totalGrasas = 0;

    // Valores nutricionales por intercambio (promedios estándar)
    const valoresPorIntercambio = {
      lecheDescremada: { kcal: 80, prot: 8, carbs: 12, grasas: 0 },
      lecheSemidescremada: { kcal: 125, prot: 8, carbs: 12, grasas: 5 },
      lecheEntera: { kcal: 160, prot: 8, carbs: 12, grasas: 8 },
      vegetales: { kcal: 25, prot: 2, carbs: 5, grasas: 0 },
      frutas: { kcal: 60, prot: 0, carbs: 15, grasas: 0 },
      panesCereales: { kcal: 80, prot: 3, carbs: 15, grasas: 0 },
      cerealesConGrasa: { kcal: 115, prot: 3, carbs: 15, grasas: 5 },
      cerealesSinGrasa: { kcal: 80, prot: 3, carbs: 15, grasas: 0 },
      proteinasMagras: { kcal: 55, prot: 7, carbs: 0, grasas: 3 },
      proteinasSemimagras: { kcal: 75, prot: 7, carbs: 0, grasas: 5 },
      proteinasAltas: { kcal: 100, prot: 7, carbs: 0, grasas: 8 },
      grasas: { kcal: 45, prot: 0, carbs: 0, grasas: 5 }
    };

    // Recorrer el plan y sumar
    Object.values(gridPlan).forEach(tiempoData => {
      Object.values(tiempoData).forEach(prep => {
        if (prep && prep.intercambios) {
          Object.entries(prep.intercambios).forEach(([key, value]) => {
            const cantidad = parseFloat(value) || 0;
            if (cantidad > 0 && valoresPorIntercambio[key]) {
              const valores = valoresPorIntercambio[key];
              totalCalorias += valores.kcal * cantidad;
              totalProteinas += valores.prot * cantidad;
              totalCarbohidratos += valores.carbs * cantidad;
              totalGrasas += valores.grasas * cantidad;
            }
          });
        }
      });
    });

    return {
      calorias: Math.round(totalCalorias),
      proteinas: Math.round(totalProteinas),
      carbohidratos: Math.round(totalCarbohidratos),
      grasas: Math.round(totalGrasas)
    };
  };

  // Calcular macros del plan
  const macrosDelPlan = calcularMacrosDelPlan();

  /**
   * Exporta el plan a un archivo de texto formateado
   */
  const exportarPlanPDF = async () => {
  setExportando(true);

  try {
    const datosExportacion = {
      nombrePaciente: nombrePaciente,
      nombreNutricionista: 'Lesly Carolina Ayala Chicas',
      logo: null, // ← SIN LOGO POR AHORA (arregla el error)
      gridPlan: gridPlan,
      tiemposComida: tiemposSeleccionados,
      numOpciones: numOpciones,
      datosNutricionales: datosNutricionales,
      recomendaciones: []
    };

    generarPDFProfesional(datosExportacion);

  } catch (error) {
    console.error('Error al exportar:', error);
    alert('Error al exportar el plan a PDF');
  } finally {
    setExportando(false);
  }
};

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
        <>
          {/* 🔍 DEBUG TEMPORAL - Remover después */}
          <div style={{
            background: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            <strong>🔍 DEBUG - Datos Recibidos:</strong>
            <div style={{ marginTop: '0.5rem' }}>
              <div>✓ Calorías: {datosNutricionales.calorias}</div>
              <div>✓ Proteínas: {datosNutricionales.proteinas}g</div>
              <div>✓ ¿Tiene intercambios?: {datosNutricionales.intercambios ? 'SÍ' : 'NO'}</div>
              {datosNutricionales.intercambios && (
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    Ver estructura completa de intercambios
                  </summary>
                  <pre style={{ 
                    overflow: 'auto', 
                    maxHeight: '300px',
                    background: '#f8f9fa',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    marginTop: '0.5rem'
                  }}>
                    {JSON.stringify(datosNutricionales.intercambios, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>

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

          {/* Card de intercambios nutricionales */}
          {datosNutricionales.intercambios && (
            <div className="intercambios-calculadora-card">
              <h3 className="intercambios-calculadora-title">
                📊 Sistema de Intercambios
              </h3>
              <p className="intercambios-calculadora-subtitle">
                Utiliza estos intercambios como guía al seleccionar preparaciones
              </p>
              <div className="intercambios-badges-list">
                {/* Lácteos */}
                {Object.entries(datosNutricionales.intercambios.lacteos || {}).map(([key, data]) => {
                  if (data.intercambios > 0) {
                    const iniciales = {
                      descremados: 'LD',
                      semidescremados: 'LS',
                      enteros: 'LE'
                    };
                    const colores = {
                      descremados: { bg: '#E3F2FD', border: '#90CAF9' },
                      semidescremados: { bg: '#BBDEFB', border: '#64B5F6' },
                      enteros: { bg: '#90CAF9', border: '#42A5F5' }
                    };
                    return (
                      <span 
                        key={key}
                        className="intercambio-badge-compact"
                        style={{
                          '--badge-bg': colores[key].bg,
                          '--badge-border': colores[key].border
                        }}
                        title={`Leche ${key}: ${data.intercambios} intercambios`}
                      >
                        {iniciales[key]}: {data.intercambios}
                      </span>
                    );
                  }
                  return null;
                })}

                {/* Vegetales */}
                {datosNutricionales.intercambios.verduras?.verduras?.intercambios > 0 && (
                  <span 
                    className="intercambio-badge-compact"
                    style={{
                      '--badge-bg': '#E8F5E9',
                      '--badge-border': '#81C784'
                    }}
                    title={`Vegetales: ${datosNutricionales.intercambios.verduras.verduras.intercambios} intercambios`}
                  >
                    V: {datosNutricionales.intercambios.verduras.verduras.intercambios}
                  </span>
                )}

                {/* Frutas */}
                {datosNutricionales.intercambios.frutas?.frutas?.intercambios > 0 && (
                  <span 
                    className="intercambio-badge-compact"
                    style={{
                      '--badge-bg': '#FFF9C4',
                      '--badge-border': '#FFD54F'
                    }}
                    title={`Frutas: ${datosNutricionales.intercambios.frutas.frutas.intercambios} intercambios`}
                  >
                    F: {datosNutricionales.intercambios.frutas.frutas.intercambios}
                  </span>
                )}

                {/* Cereales */}
                {Object.entries(datosNutricionales.intercambios.cereales || {}).map(([key, data]) => {
                  if (data.intercambios > 0) {
                    const iniciales = {
                      panesCereales: 'PC',
                      conGrasa: 'CG',
                      sinGrasa: 'CSG'
                    };
                    const nombres = {
                      panesCereales: 'Panes y Cereales',
                      conGrasa: 'Cereales con Grasa',
                      sinGrasa: 'Cereales sin Grasa'
                    };
                    return (
                      <span 
                        key={key}
                        className="intercambio-badge-compact"
                        style={{
                          '--badge-bg': '#FFE0B2',
                          '--badge-border': '#FFB74D'
                        }}
                        title={`${nombres[key]}: ${data.intercambios} intercambios`}
                      >
                        {iniciales[key]}: {data.intercambios}
                      </span>
                    );
                  }
                  return null;
                })}

                {/* Proteínas */}
                {Object.entries(datosNutricionales.intercambios.proteinas || {}).map(([key, data]) => {
                  if (data.intercambios > 0) {
                    const iniciales = {
                      magra: 'PM',
                      mediana: 'PS',
                      alta: 'PA'
                    };
                    const nombres = {
                      magra: 'Proteína Magra',
                      mediana: 'Proteína Semimagra',
                      alta: 'Proteína Alta en Grasa'
                    };
                    return (
                      <span 
                        key={key}
                        className="intercambio-badge-compact"
                        style={{
                          '--badge-bg': '#FCE4EC',
                          '--badge-border': '#F48FB1'
                        }}
                        title={`${nombres[key]}: ${data.intercambios} intercambios`}
                      >
                        {iniciales[key]}: {data.intercambios}
                      </span>
                    );
                  }
                  return null;
                })}

                {/* Grasas */}
                {datosNutricionales.intercambios.grasas?.grasas?.intercambios > 0 && (
                  <span 
                    className="intercambio-badge-compact"
                    style={{
                      '--badge-bg': '#FFF8E1',
                      '--badge-border': '#FFC107'
                    }}
                    title={`Grasas: ${datosNutricionales.intercambios.grasas.grasas.intercambios} intercambios`}
                  >
                    G: {datosNutricionales.intercambios.grasas.grasas.intercambios}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Contador de intercambios */}
          {comparacionIntercambios && comparacionIntercambios.length > 0 && (
            <div className="contador-intercambios-card">
              <h3 className="contador-title">
                Progreso de Intercambios
              </h3>
              <p className="contador-subtitle">
                Compara tus intercambios actuales con el objetivo
              </p>
              <div className="contador-grid">
                {comparacionIntercambios.map((item) => (
                  <div key={item.key} className="contador-item">
                    <div className="contador-header">
                      <span 
                        className="contador-badge"
                        style={{
                          '--badge-bg': item.color,
                          '--badge-border': item.border
                        }}
                        title={item.nombre}
                      >
                        {item.sigla}
                      </span>
                      <div className="contador-valores">
                        <span className={`contador-actual estado-${item.estado}`}>
                          {item.actual}
                        </span>
                        <span className="contador-separador">/</span>
                        <span className="contador-objetivo">{item.objetivo}</span>
                      </div>
                    </div>
                    <div className="contador-barra-container">
                      <div 
                        className={`contador-barra estado-${item.estado}`}
                        style={{ width: `${Math.min(item.porcentaje, 100)}%` }}
                      />
                    </div>
                    {item.diferencia !== 0 && (
                      <div className={`contador-diferencia estado-${item.estado}`}>
                        {item.diferencia > 0 ? `+${item.diferencia}` : item.diferencia}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen de Macronutrientes del Plan */}
          {datosNutricionales && (macrosDelPlan.calorias > 0 || Object.keys(gridPlan).some(t => Object.values(gridPlan[t]).some(p => p))) && (
            <div className="resumen-macros-card">
              <h3 className="resumen-macros-title">
                Resumen Nutricional del Plan
              </h3>
              <div className="resumen-macros-grid">
                <div className="macro-comparison">
                  <div className="macro-comparison-header">
                    <span className="macro-icon"></span>
                    <span className="macro-nombre">Calorías</span>
                  </div>
                  <div className="macro-valores">
                    <div className="macro-valor-item">
                      <span className="macro-label">Plan:</span>
                      <span className="macro-actual">{macrosDelPlan.calorias}</span>
                      <span className="macro-unidad">kcal</span>
                    </div>
                    <div className="macro-valor-item">
                      <span className="macro-label">Objetivo:</span>
                      <span className="macro-objetivo">{datosNutricionales.calorias}</span>
                      <span className="macro-unidad">kcal</span>
                    </div>
                  </div>
                  <div className="macro-diferencia-bar">
                    <div 
                      className={`macro-bar ${macrosDelPlan.calorias >= datosNutricionales.calorias * 0.95 && macrosDelPlan.calorias <= datosNutricionales.calorias * 1.05 ? 'correcto' : macrosDelPlan.calorias < datosNutricionales.calorias ? 'falta' : 'sobra'}`}
                      style={{ width: `${Math.min((macrosDelPlan.calorias / datosNutricionales.calorias) * 100, 100)}%` }}
                    />
                  </div>
                  <span className={`macro-diff ${macrosDelPlan.calorias >= datosNutricionales.calorias * 0.95 && macrosDelPlan.calorias <= datosNutricionales.calorias * 1.05 ? 'correcto' : macrosDelPlan.calorias < datosNutricionales.calorias ? 'falta' : 'sobra'}`}>
                    {macrosDelPlan.calorias - datosNutricionales.calorias > 0 ? '+' : ''}{macrosDelPlan.calorias - datosNutricionales.calorias} kcal
                  </span>
                </div>

                <div className="macro-comparison">
                  <div className="macro-comparison-header">
                    <span className="macro-icon"></span>
                    <span className="macro-nombre">Proteínas</span>
                  </div>
                  <div className="macro-valores">
                    <div className="macro-valor-item">
                      <span className="macro-label">Plan:</span>
                      <span className="macro-actual">{macrosDelPlan.proteinas}</span>
                      <span className="macro-unidad">g</span>
                    </div>
                    <div className="macro-valor-item">
                      <span className="macro-label">Objetivo:</span>
                      <span className="macro-objetivo">{datosNutricionales.proteinas}</span>
                      <span className="macro-unidad">g</span>
                    </div>
                  </div>
                  <div className="macro-diferencia-bar">
                    <div 
                      className={`macro-bar ${macrosDelPlan.proteinas >= datosNutricionales.proteinas * 0.95 && macrosDelPlan.proteinas <= datosNutricionales.proteinas * 1.05 ? 'correcto' : macrosDelPlan.proteinas < datosNutricionales.proteinas ? 'falta' : 'sobra'}`}
                      style={{ width: `${Math.min((macrosDelPlan.proteinas / datosNutricionales.proteinas) * 100, 100)}%` }}
                    />
                  </div>
                  <span className={`macro-diff ${macrosDelPlan.proteinas >= datosNutricionales.proteinas * 0.95 && macrosDelPlan.proteinas <= datosNutricionales.proteinas * 1.05 ? 'correcto' : macrosDelPlan.proteinas < datosNutricionales.proteinas ? 'falta' : 'sobra'}`}>
                    {macrosDelPlan.proteinas - datosNutricionales.proteinas > 0 ? '+' : ''}{macrosDelPlan.proteinas - datosNutricionales.proteinas} g
                  </span>
                </div>

                <div className="macro-comparison">
                  <div className="macro-comparison-header">
                    <span className="macro-icon"></span>
                    <span className="macro-nombre">Carbohidratos</span>
                  </div>
                  <div className="macro-valores">
                    <div className="macro-valor-item">
                      <span className="macro-label">Plan:</span>
                      <span className="macro-actual">{macrosDelPlan.carbohidratos}</span>
                      <span className="macro-unidad">g</span>
                    </div>
                    <div className="macro-valor-item">
                      <span className="macro-label">Objetivo:</span>
                      <span className="macro-objetivo">{datosNutricionales.carbohidratos}</span>
                      <span className="macro-unidad">g</span>
                    </div>
                  </div>
                  <div className="macro-diferencia-bar">
                    <div 
                      className={`macro-bar ${macrosDelPlan.carbohidratos >= datosNutricionales.carbohidratos * 0.95 && macrosDelPlan.carbohidratos <= datosNutricionales.carbohidratos * 1.05 ? 'correcto' : macrosDelPlan.carbohidratos < datosNutricionales.carbohidratos ? 'falta' : 'sobra'}`}
                      style={{ width: `${Math.min((macrosDelPlan.carbohidratos / datosNutricionales.carbohidratos) * 100, 100)}%` }}
                    />
                  </div>
                  <span className={`macro-diff ${macrosDelPlan.carbohidratos >= datosNutricionales.carbohidratos * 0.95 && macrosDelPlan.carbohidratos <= datosNutricionales.carbohidratos * 1.05 ? 'correcto' : macrosDelPlan.carbohidratos < datosNutricionales.carbohidratos ? 'falta' : 'sobra'}`}>
                    {macrosDelPlan.carbohidratos - datosNutricionales.carbohidratos > 0 ? '+' : ''}{macrosDelPlan.carbohidratos - datosNutricionales.carbohidratos} g
                  </span>
                </div>

                <div className="macro-comparison">
                  <div className="macro-comparison-header">
                    <span className="macro-icon"></span>
                    <span className="macro-nombre">Grasas</span>
                  </div>
                  <div className="macro-valores">
                    <div className="macro-valor-item">
                      <span className="macro-label">Plan:</span>
                      <span className="macro-actual">{macrosDelPlan.grasas}</span>
                      <span className="macro-unidad">g</span>
                    </div>
                    <div className="macro-valor-item">
                      <span className="macro-label">Objetivo:</span>
                      <span className="macro-objetivo">{datosNutricionales.grasas}</span>
                      <span className="macro-unidad">g</span>
                    </div>
                  </div>
                  <div className="macro-diferencia-bar">
                    <div 
                      className={`macro-bar ${macrosDelPlan.grasas >= datosNutricionales.grasas * 0.95 && macrosDelPlan.grasas <= datosNutricionales.grasas * 1.05 ? 'correcto' : macrosDelPlan.grasas < datosNutricionales.grasas ? 'falta' : 'sobra'}`}
                      style={{ width: `${Math.min((macrosDelPlan.grasas / datosNutricionales.grasas) * 100, 100)}%` }}
                    />
                  </div>
                  <span className={`macro-diff ${macrosDelPlan.grasas >= datosNutricionales.grasas * 0.95 && macrosDelPlan.grasas <= datosNutricionales.grasas * 1.05 ? 'correcto' : macrosDelPlan.grasas < datosNutricionales.grasas ? 'falta' : 'sobra'}`}>
                    {macrosDelPlan.grasas - datosNutricionales.grasas > 0 ? '+' : ''}{macrosDelPlan.grasas - datosNutricionales.grasas} g
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
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
          onClick={exportarPlanPDF}
          disabled={exportando || !nombrePaciente.trim() || Object.keys(gridPlan).every(t => Object.values(gridPlan[t]).every(p => !p))}
          className="btn-exportar-plan"
          title="Exportar plan a archivo de texto"
        >
          <Download className="icon-sm" />
          {exportando ? 'Exportando...' : 'Exportar Plan'}
        </button>

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