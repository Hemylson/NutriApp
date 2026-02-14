// src/components/FormularioPreparacion.jsx
import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UNIDADES_PREDEFINIDAS, METODOS_COCCION, generarId } from '../utils/constantes';
import './FormularioPreparacion.css';

/**
 * Formulario para crear preparaciones (platos/recetas)
 * Estilo kawaii profesional
 */
export default function FormularioPreparacion({ idUsuario = 'usuario-temporal', onGuardado }) {
  // Estado del formulario
  const [nombre, setNombre] = useState('');
  const [metodoCoccion, setMetodoCoccion] = useState('');
  const [notas, setNotas] = useState('');
  const [acompanamiento, setAcompanamiento] = useState('');
  const [ingredientes, setIngredientes] = useState([
    { id: generarId(), alimento: '', cantidad: '', unidad: 'g' }
  ]);

  // Estados de UI
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  /**
   * Agrega un nuevo ingrediente vacío
   */
  const agregarIngrediente = () => {
    setIngredientes([
      ...ingredientes,
      { id: generarId(), alimento: '', cantidad: '', unidad: 'g' }
    ]);
  };

  /**
   * Actualiza un campo específico de un ingrediente
   */
  const actualizarIngrediente = (id, campo, valor) => {
    setIngredientes(ingredientes.map(ing => 
      ing.id === id ? { ...ing, [campo]: valor } : ing
    ));
  };

  /**
   * Elimina un ingrediente
   */
  const eliminarIngrediente = (id) => {
    if (ingredientes.length > 1) {
      setIngredientes(ingredientes.filter(ing => ing.id !== id));
    }
  };

  /**
   * Valida el formulario antes de guardar
   */
  const validarFormulario = () => {
    if (!nombre.trim()) {
      setError('El nombre del plato es obligatorio');
      return false;
    }

    const ingredientesFiltrados = ingredientes.filter(ing => ing.alimento.trim() !== '');
    if (ingredientesFiltrados.length === 0) {
      setError('Debe agregar al menos un ingrediente');
      return false;
    }

    // Validar que todos los ingredientes tengan cantidad
    const ingredientesInvalidos = ingredientesFiltrados.filter(
      ing => !ing.cantidad || parseFloat(ing.cantidad) <= 0
    );
    if (ingredientesInvalidos.length > 0) {
      setError('Todos los ingredientes deben tener una cantidad válida');
      return false;
    }

    setError('');
    return true;
  };

  /**
   * Guarda la preparación en Firestore
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);
    setError('');

    try {
      // Filtrar ingredientes vacíos y convertir cantidades a números
      const ingredientesFiltrados = ingredientes
        .filter(ing => ing.alimento.trim() !== '')
        .map(ing => ({
          id: ing.id,
          alimento: ing.alimento.trim(),
          cantidad: parseFloat(ing.cantidad),
          unidad: ing.unidad,
          notas: ing.notas || ''
        }));

      // Crear el objeto de preparación
      const preparacion = {
        idUsuario,
        nombre: nombre.trim(),
        ingredientes: ingredientesFiltrados,
        metodoCoccion: metodoCoccion || '',
        notas: notas.trim(),
        acompanamiento: acompanamiento.trim(),
        creadoEn: Timestamp.now(),
        actualizadoEn: Timestamp.now()
      };

      // Guardar en Firestore
      const docRef = await addDoc(
        collection(db, 'usuarios', idUsuario, 'preparaciones'),
        preparacion
      );

      console.log('Preparación guardada con ID:', docRef.id);

      // Limpiar formulario
      setNombre('');
      setMetodoCoccion('');
      setNotas('');
      setAcompanamiento('');
      setIngredientes([
        { id: generarId(), alimento: '', cantidad: '', unidad: 'g' }
      ]);

      // Callback opcional
      if (onGuardado) {
        onGuardado({ id: docRef.id, ...preparacion });
      }

      alert('✅ Preparación guardada exitosamente');
    } catch (err) {
      console.error('Error al guardar preparación:', err);
      setError('Error al guardar la preparación. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="preparacion-container">
      <form onSubmit={handleSubmit} className="preparacion-form">
        {/* Mensaje de error */}
        {error && (
          <div className="error-alert">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Nombre del plato */}
        <div className="form-group">
          <label className="form-label required">Nombre del plato</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Ensalada César con Pollo"
            className="form-input"
            required
          />
        </div>

        {/* Método de cocción */}
        <div className="form-group">
          <label className="form-label">Método de cocción</label>
          <div className="metodos-grid">
            {METODOS_COCCION.map(metodo => (
              <button
                key={metodo}
                type="button"
                onClick={() => setMetodoCoccion(metodo)}
                className={`metodo-card ${metodoCoccion === metodo ? 'active' : ''}`}
              >
                {metodo}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredientes */}
        <div className="ingredientes-section">
          <div className="ingredientes-header">
            <label className="form-label required">Ingredientes</label>
            <button
              type="button"
              onClick={agregarIngrediente}
              className="add-ingrediente-btn"
            >
              <svg className="add-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar ingrediente
            </button>
          </div>

          <div className="ingredientes-list">
            {ingredientes.map((ing, index) => (
              <div key={ing.id} className="ingrediente-item">
                {/* Número */}
                <div className="ingrediente-number">
                  {index + 1}
                </div>

                {/* Campos */}
                <div className="ingrediente-fields">
                  {/* Alimento */}
                  <div className="ingrediente-field alimento">
                    <label>Alimento</label>
                    <input
                      type="text"
                      value={ing.alimento}
                      onChange={(e) => actualizarIngrediente(ing.id, 'alimento', e.target.value)}
                      placeholder="Ej: pechuga de pollo"
                    />
                  </div>

                  {/* Cantidad */}
                  <div className="ingrediente-field cantidad">
                    <label>Cantidad</label>
                    <input
                      type="number"
                      value={ing.cantidad}
                      onChange={(e) => actualizarIngrediente(ing.id, 'cantidad', e.target.value)}
                      placeholder="150"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  {/* Unidad */}
                  <div className="ingrediente-field unidad">
                    <label>Unidad</label>
                    <select
                      value={ing.unidad}
                      onChange={(e) => actualizarIngrediente(ing.id, 'unidad', e.target.value)}
                    >
                      {UNIDADES_PREDEFINIDAS.map(unidad => (
                        <option key={unidad.valor} value={unidad.valor}>
                          {unidad.etiqueta}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Botón eliminar */}
                <button
                  type="button"
                  onClick={() => eliminarIngrediente(ing.id)}
                  disabled={ingredientes.length === 1}
                  className="remove-ingrediente-btn"
                  title="Eliminar ingrediente"
                >
                  <svg className="remove-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Acompañamiento */}
        <div className="form-group">
          <label className="form-label">Acompañamiento</label>
          <input
            type="text"
            value={acompanamiento}
            onChange={(e) => setAcompanamiento(e.target.value)}
            placeholder="Ej: ½ tz de leche + 1 manzana verde pequeña"
            className="form-input"
          />
          <span className="form-hint">
            El acompañamiento se mostrará en una línea separada en el plan
          </span>
        </div>

        {/* Notas */}
        <div className="form-group">
          <label className="form-label">Notas adicionales</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Ej: Evitar exceso de sal"
            className="form-textarea"
          />
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => {
              if (confirm('¿Deseas limpiar el formulario?')) {
                setNombre('');
                setMetodoCoccion('');
                setNotas('');
                setAcompanamiento('');
                setIngredientes([
                  { id: generarId(), alimento: '', cantidad: '', unidad: 'g' }
                ]);
                setError('');
              }
            }}
            className="btn btn-secondary"
          >
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Limpiar
          </button>

          <button
            type="submit"
            disabled={guardando}
            className={`btn btn-primary ${guardando ? 'loading' : ''}`}
          >
            {guardando ? (
              <>
                <svg className="btn-icon loading-spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar Preparación
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}