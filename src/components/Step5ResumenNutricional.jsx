import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Target, 
  Utensils, 
  Clock, 
  Download, 
  Printer, 
  CheckCircle,
  Activity,
  Calculator,
  Coffee,
  Sun,
  Moon,
  Sunset,
  ChevronLeft,
  Share,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Search,
  X,
  Edit3,
  Save,
  BarChart3,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import './Step5ResumenNutricional.css';
import PDFExporter from './PDFExporter';


const Step5ResumenNutricional = ({ 
  formData = {
    genero: 'femenino',
    peso: '65',
    talla: '165',
    edad: '30',
    imc: '23.9',
    pesoIdeal: '65',
    pesoAjustado: '65',
    ger: '1400',
    get: '1800',
    factorActividad: '1.55',
    macros: {
      proteinasPorcentaje: '15',
      proteinasKcal: '270',
      proteinasGramos: '67.5',
      carbohidratosPorcentaje: '55',
      carbohidratosKcal: '990',
      carbohidratosGramos: '247.5',
      grasasPorcentaje: '30',
      grasasKcal: '540',
      grasasGramos: '60'
    },
    intercambios: {
      lacteos: {
        descremados: { intercambios: 2, cho: 24, chon: 16, cooh: 0, kcal: 160 },
        semidescremados: { intercambios: 1, cho: 12, chon: 8, cooh: 5, kcal: 125 }
      },
      verduras: {
        verduras: { intercambios: 3, cho: 15, chon: 6, cooh: 0, kcal: 75 }
      },
      frutas: {
        frutas: { intercambios: 4, cho: 60, chon: 0, cooh: 0, kcal: 240 }
      },
      cereales: {
        panesCereales: { intercambios: 6, cho: 90, chon: 18, cooh: 0, kcal: 450 },
        conGrasa: { intercambios: 2, cho: 30, chon: 6, cooh: 10, kcal: 230 }
      },
      proteinas: {
        magra: { intercambios: 3, cho: 0, chon: 21, cooh: 9, kcal: 165 },
        mediana: { intercambios: 2, cho: 0, chon: 14, cooh: 10, kcal: 150 }
      },
      grasas: {
        grasas: { intercambios: 4, cho: 0, chon: 0, cooh: 20, kcal: 180 }
      }
    },
    distribucionComidas: {
      descremados: { desayuno: 1, merienda1: 0, almuerzo: 1, merienda2: 0, cena: 0 },
      semidescremados: { desayuno: 0, merienda1: 0, almuerzo: 0, merienda2: 1, cena: 0 },
      verduras: { desayuno: 0, merienda1: 0, almuerzo: 2, merienda2: 0, cena: 1 },
      frutas: { desayuno: 1, merienda1: 1, almuerzo: 1, merienda2: 1, cena: 0 },
      panesCereales: { desayuno: 2, merienda1: 0, almuerzo: 2, merienda2: 0, cena: 2 },
      conGrasa: { desayuno: 1, merienda1: 0, almuerzo: 1, merienda2: 0, cena: 0 },
      magra: { desayuno: 0, merienda1: 0, almuerzo: 2, merienda2: 0, cena: 1 },
      mediana: { desayuno: 1, merienda1: 0, almuerzo: 1, merienda2: 0, cena: 0 },
      grasas: { desayuno: 1, merienda1: 0, almuerzo: 2, merienda2: 0, cena: 1 }
    },
    totalesNutricionales: {
      totalKcal: 1775,
      totalCho: 231,
      totalChon: 89,
      totalCooh: 54
    }
  }, 
  onPrev = () => console.log('Previous step'),
  onFinish = () => console.log('Plan finished')
}) => {
  // Estados existentes
  const [activeTab, setActiveTab] = useState('resumen');
  const [copiedText, setCopiedText] = useState('');
  
  // Nuevos estados para mejoras
  const [loadingStates, setLoadingStates] = useState({
    print: false,
    download: false,
    share: false
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [tempValues, setTempValues] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    defaultTab: 'resumen',
    exportFormat: 'txt',
    showGraphics: true
  });

  const tooltipRef = useRef(null);
  const tabsRef = useRef(null);

  // Tooltips informativos
  const tooltips = {
    imc: "Índice de Masa Corporal: Indicador que relaciona peso y estatura",
    ger: "Gasto Energético en Reposo: Calorías que el cuerpo necesita en reposo",
    get: "Gasto Energético Total: Calorías totales necesarias incluyendo actividad física",
    pesoIdeal: "Calculado usando la fórmula de Broca ajustada por género",
    pesoAjustado: "Peso utilizado para cálculos nutricionales, considerando el estado actual"
  };

  // Validación mejorada de números
  const safeParseFloat = useCallback((value, fallback = 0) => {
    if (value === null || value === undefined || value === '') return fallback;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }, []);

  const handlePDFSuccess = useCallback((message) => {
    setCopiedText(message);
    setTimeout(() => setCopiedText(''), 3000);
  }, []);

  const handlePDFError = useCallback((message) => {
    setCopiedText(message);
    setTimeout(() => setCopiedText(''), 3000);
  }, []);

  // Validación de datos de entrada
  const validateData = useCallback(() => {
    const newErrors = {};
    
    if (!formData.peso || safeParseFloat(formData.peso) <= 0) {
      newErrors.peso = 'Peso debe ser un número válido mayor a 0';
    }
    
    if (!formData.talla || safeParseFloat(formData.talla) <= 0) {
      newErrors.talla = 'Talla debe ser un número válido mayor a 0';
    }
    
    if (!formData.edad || safeParseFloat(formData.edad) <= 0) {
      newErrors.edad = 'Edad debe ser un número válido mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, safeParseFloat]);

  // Extraer datos con validación
  const datosPersonales = useMemo(() => ({
    genero: formData.genero || 'femenino',
    peso: safeParseFloat(formData.peso, 65),
    talla: safeParseFloat(formData.talla, 165),
    edad: safeParseFloat(formData.edad, 30),
    imc: safeParseFloat(formData.imc, 23.9),
    pesoIdeal: safeParseFloat(formData.pesoIdeal, 65),
    pesoAjustado: safeParseFloat(formData.pesoAjustado, 65),
    ger: safeParseFloat(formData.ger, 1400),
    get: safeParseFloat(formData.get, 1800),
    factorActividad: safeParseFloat(formData.factorActividad, 1.55)
  }), [formData, safeParseFloat]);

  const macros = useMemo(() => ({
    proteinasPorcentaje: safeParseFloat(formData.macros?.proteinasPorcentaje, 15),
    proteinasKcal: safeParseFloat(formData.macros?.proteinasKcal, 270),
    proteinasGramos: safeParseFloat(formData.macros?.proteinasGramos, 67.5),
    carbohidratosPorcentaje: safeParseFloat(formData.macros?.carbohidratosPorcentaje, 55),
    carbohidratosKcal: safeParseFloat(formData.macros?.carbohidratosKcal, 990),
    carbohidratosGramos: safeParseFloat(formData.macros?.carbohidratosGramos, 247.5),
    grasasPorcentaje: safeParseFloat(formData.macros?.grasasPorcentaje, 30),
    grasasKcal: safeParseFloat(formData.macros?.grasasKcal, 540),
    grasasGramos: safeParseFloat(formData.macros?.grasasGramos, 60)
  }), [formData.macros, safeParseFloat]);

  const intercambios = formData.intercambios || {};
  const distribucionComidas = formData.distribucionComidas || {};
  const totalesNutricionales = useMemo(() => ({
    totalKcal: safeParseFloat(formData.totalesNutricionales?.totalKcal, 1775),
    totalCho: safeParseFloat(formData.totalesNutricionales?.totalCho, 231),
    totalChon: safeParseFloat(formData.totalesNutricionales?.totalChon, 89),
    totalCooh: safeParseFloat(formData.totalesNutricionales?.totalCooh, 54)
  }), [formData.totalesNutricionales, safeParseFloat]);

  // Configuración de tiempos de comida
  const mealTimes = {
    desayuno: { name: 'Desayuno', icon: Coffee, color: '#F0BCC9', time: '7:00 AM' },
    merienda1: { name: 'Media Mañana', icon: Sun, color: '#A8CFC2', time: '10:00 AM' },
    almuerzo: { name: 'Almuerzo', icon: Sun, color: '#8CAFCF', time: '12:30 PM' },
    merienda2: { name: 'Media Tarde', icon: Sunset, color: '#E3C0CF', time: '4:00 PM' },
    cena: { name: 'Cena', icon: Moon, color: '#EB92A3', time: '7:00 PM' }
  };

  // Funciones utilitarias optimizadas
  const getIMCClassification = useCallback((imc) => {
    const imcValue = safeParseFloat(imc);
    if (imcValue < 18.5) return { text: 'Bajo peso', color: '#8CAFCF' };
    if (imcValue < 25) return { text: 'Peso normal', color: '#A8CFC2' };
    if (imcValue < 30) return { text: 'Sobrepeso', color: '#F0BCC9' };
    return { text: 'Obesidad', color: '#EB92A3' };
  }, [safeParseFloat]);

  const getFactorActividadText = useCallback((factor) => {
    const factors = {
      '1.2': 'Sedentario (sin ejercicio)',
      '1.375': 'Ligeramente activo (1-3 días/semana)',
      '1.55': 'Moderadamente activo (3-5 días/semana)',
      '1.725': 'Muy activo (6-7 días/semana)',
      '1.9': 'Extremadamente activo (ejercicio intenso)'
    };
    return factors[factor.toString()] || `Factor: ${factor}`;
  }, []);

  const getIntercambioName = useCallback((categoria, subcategoria) => {
    const names = {
      lacteos: {
        descremados: 'Lácteos Descremados',
        semidescremados: 'Lácteos Semidescremados',
        enteros: 'Lácteos Enteros'
      },
      verduras: { verduras: 'Verduras' },
      frutas: { frutas: 'Frutas' },
      cereales: {
        panesCereales: 'Panes y Cereales',
        conGrasa: 'Cereales con Grasa',
        sinGrasa: 'Cereales sin Grasa'
      },
      proteinas: {
        magra: 'Carne Magra',
        mediana: 'Carne Semigorda',
        alta: 'Carnes Gordas'
      },
      grasas: { grasas: 'Grasas' }
    };
    
    return names[categoria]?.[subcategoria] || subcategoria;
  }, []);

  // Plan de comidas optimizado con useMemo
  const mealPlan = useMemo(() => {
    const plan = {};
    
    Object.keys(mealTimes).forEach(mealId => {
      plan[mealId] = [];
      
      Object.entries(distribucionComidas).forEach(([foodId, distribution]) => {
        const quantity = safeParseFloat(distribution?.[mealId], 0);
        if (quantity > 0) {
          let foodName = foodId;
          Object.entries(intercambios).forEach(([categoria, subcategorias]) => {
            Object.entries(subcategorias || {}).forEach(([subKey, data]) => {
              if (subKey === foodId) {
                foodName = getIntercambioName(categoria, subKey);
              }
            });
          });
          
          plan[mealId].push({
            name: foodName,
            quantity: quantity,
            unit: 'intercambios'
          });
        }
      });
    });
    
    return plan;
  }, [distribucionComidas, intercambios, mealTimes, getIntercambioName, safeParseFloat]);

  // Texto para compartir optimizado
  const shareableText = useMemo(() => {
    const imcClassification = getIMCClassification(datosPersonales.imc);
    
    return `
🍎 PLAN NUTRICIONAL PERSONALIZADO

👤 DATOS PERSONALES:
• Género: ${datosPersonales.genero === 'masculino' ? 'Masculino' : 'Femenino'}
• Edad: ${datosPersonales.edad} años
• Peso: ${datosPersonales.peso} kg
• Talla: ${datosPersonales.talla} cm

📊 INDICADORES:
• IMC: ${datosPersonales.imc.toFixed(1)} kg/m² (${imcClassification?.text})
• Peso Ideal: ${datosPersonales.pesoIdeal} kg
• Requerimiento Calórico: ${datosPersonales.get} kcal/día

🎯 MACRONUTRIENTES:
• Proteínas: ${macros.proteinasPorcentaje}% (${macros.proteinasGramos}g)
• Carbohidratos: ${macros.carbohidratosPorcentaje}% (${macros.carbohidratosGramos}g)
• Grasas: ${macros.grasasPorcentaje}% (${macros.grasasGramos}g)

🍽️ PLAN DE COMIDAS:
${Object.entries(mealTimes).map(([mealId, meal]) => {
  const foods = mealPlan[mealId] || [];
  return `• ${meal.name} (${meal.time}): ${foods.map(f => `${f.quantity} ${f.name}`).join(', ') || 'Sin alimentos'}`;
}).join('\n')}

📈 TOTALES NUTRICIONALES:
• Calorías: ${totalesNutricionales.totalKcal} kcal
• Carbohidratos: ${totalesNutricionales.totalCho} g
• Proteínas: ${totalesNutricionales.totalChon} g
• Grasas: ${totalesNutricionales.totalCooh} g
    `.trim();
  }, [datosPersonales, macros, mealPlan, mealTimes, totalesNutricionales, getIMCClassification]);

  // Datos para gráficos
  const chartData = useMemo(() => {
    const pieData = [
      { name: 'Proteínas', value: macros.proteinasPorcentaje, color: '#8CAFCF', kcal: macros.proteinasKcal },
      { name: 'Carbohidratos', value: macros.carbohidratosPorcentaje, color: '#A8CFC2', kcal: macros.carbohidratosKcal },
      { name: 'Grasas', value: macros.grasasPorcentaje, color: '#F0BCC9', kcal: macros.grasasKcal }
    ];

    const barData = Object.entries(mealTimes).map(([mealId, meal]) => ({
      name: meal.name,
      alimentos: (mealPlan[mealId] || []).length,
      color: meal.color
    }));

    return { pieData, barData };
  }, [macros, mealPlan, mealTimes]);

  // Handlers optimizados con useCallback
  const handleSetLoadingState = useCallback((action, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [action]: isLoading
    }));
  }, []);

  const handleExport = useCallback(async (type) => {
    if (!validateData()) {
      return;
    }

    handleSetLoadingState(type, true);

    try {
      if (type === 'print') {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
        window.print();
      } else if (type === 'download') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const element = document.createElement('a');
        const file = new Blob([shareableText], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `plan-nutricional-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        setCopiedText('¡Archivo descargado exitosamente!');
        setTimeout(() => setCopiedText(''), 3000);
      } else if (type === 'share') {
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Mi Plan Nutricional',
              text: shareableText
            });
          } catch (err) {
            if (err.name !== 'AbortError') {
              await fallbackShare(shareableText);
            }
          }
        } else {
          await fallbackShare(shareableText);
        }
      }
    } catch (error) {
      console.error(`Error in ${type}:`, error);
      setCopiedText(`Error al ${type === 'print' ? 'imprimir' : type === 'download' ? 'descargar' : 'compartir'}`);
      setTimeout(() => setCopiedText(''), 3000);
    } finally {
      handleSetLoadingState(type, false);
    }
  }, [validateData, handleSetLoadingState, shareableText]);

  const fallbackShare = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText('¡Copiado al portapapeles!');
      setTimeout(() => setCopiedText(''), 3000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setCopiedText('No se pudo copiar');
      setTimeout(() => setCopiedText(''), 3000);
    }
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    // Guardar preferencia de usuario
    setUserPreferences(prev => ({
      ...prev,
      defaultTab: tab
    }));
  }, []);

  const handleKeyNavigation = useCallback((event) => {
    if (!tabsRef.current) return;

    const tabs = ['resumen', 'plan', 'intercambios'];
    const currentIndex = tabs.indexOf(activeTab);
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        handleTabChange(tabs[prevIndex]);
        break;
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        handleTabChange(tabs[nextIndex]);
        break;
      case 'Home':
        event.preventDefault();
        handleTabChange(tabs[0]);
        break;
      case 'End':
        event.preventDefault();
        handleTabChange(tabs[tabs.length - 1]);
        break;
    }
  }, [activeTab, handleTabChange]);

  const handleConfirmAction = useCallback((action) => {
    setShowConfirmation(action);
  }, []);

  const executeAction = useCallback(() => {
    if (showConfirmation === 'finish') {
      onFinish();
    }
    setShowConfirmation(null);
  }, [showConfirmation, onFinish]);

  const handleEdit = useCallback((field, value) => {
    setEditingField(field);
    setTempValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const saveEdit = useCallback((field) => {
    // Aquí normalmente actualizarías el formData a través de una prop
    console.log(`Saving ${field}:`, tempValues[field]);
    setEditingField(null);
    setCopiedText('Valor actualizado exitosamente');
    setTimeout(() => setCopiedText(''), 2000);
  }, [tempValues]);

  const cancelEdit = useCallback(() => {
    setEditingField(null);
    setTempValues({});
  }, []);

  // Filtrado de intercambios
  const filteredIntercambios = useMemo(() => {
    if (!searchTerm) return intercambios;
    
    const filtered = {};
    Object.entries(intercambios).forEach(([categoria, subcategorias]) => {
      const filteredSub = {};
      Object.entries(subcategorias || {}).forEach(([subKey, data]) => {
        const name = getIntercambioName(categoria, subKey).toLowerCase();
        if (name.includes(searchTerm.toLowerCase()) || categoria.toLowerCase().includes(searchTerm.toLowerCase())) {
          filteredSub[subKey] = data;
        }
      });
      if (Object.keys(filteredSub).length > 0) {
        filtered[categoria] = filteredSub;
      }
    });
    
    return filtered;
  }, [intercambios, searchTerm, getIntercambioName]);

  // Tooltip handlers
  const showTooltipHandler = useCallback((key, event) => {
    setShowTooltip({ key, x: event.clientX, y: event.clientY });
  }, []);

  const hideTooltipHandler = useCallback(() => {
    setShowTooltip(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'p':
            event.preventDefault();
            handleExport('print');
            break;
          case 's':
            event.preventDefault();
            handleExport('download');
            break;
          case 'k':
            event.preventDefault();
            handleExport('share');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleExport]);

  // Validar datos al montar
  useEffect(() => {
    validateData();
  }, [validateData]);

  const imcClassification = datosPersonales.imc ? getIMCClassification(datosPersonales.imc) : null;

  // Componente de Tooltip
  const Tooltip = ({ text, x, y }) => (
    <div 
      ref={tooltipRef}
      style={{
        position: 'fixed',
        left: x + 10,
        top: y - 30,
        background: '#333',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1000,
        maxWidth: '200px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}
    >
      {text}
    </div>
  );

  // Componente de Loading Button
  const LoadingButton = ({ loading, onClick, children, className, disabled, ...props }) => (
    <button 
      className={`${className} ${loading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="action-icon animate-spin" />
          Procesando...
        </>
      ) : (
        children
      )}
    </button>
  );

  // Componente de Confirmación
  const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
    if (!isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          maxWidth: '400px',
          width: '90%'
        }}>
          <h3 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="#F0BCC9" />
            {title}
          </h3>
          <p style={{ margin: '0 0 20px 0', color: '#666' }}>{message}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button 
              onClick={onConfirm}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                background: '#F0BCC9',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderResumenGeneral = () => (
    <div className="resumen-content">
      {/* Gráfico de Macronutrientes */}
      {userPreferences.showGraphics && (
        <div className="section-card">
          <div className="section-header">
            <BarChart3 className="section-icon" />
            <h3>Distribución de Macronutrientes</h3>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {chartData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value}% (${props.payload.kcal} kcal)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Datos Personales con edición inline */}
      <div className="section-card">
        <div className="section-header">
          <User className="section-icon" />
          <h3>Datos Personales</h3>
        </div>
        <div className="data-grid">
          <div className="data-item">
            <span className="data-label">Género:</span>
            <span className="data-value">{datosPersonales.genero === 'masculino' ? '👨 Masculino' : '👩 Femenino'}</span>
          </div>
          <div className="data-item">
            <span className="data-label">Edad:</span>
            <div className="data-value-editable">
              {editingField === 'edad' ? (
                <div className="edit-field">
                  <input
                    type="number"
                    value={tempValues.edad || datosPersonales.edad}
                    onChange={(e) => setTempValues(prev => ({...prev, edad: e.target.value}))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit('edad');
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                  />
                  <button onClick={() => saveEdit('edad')} aria-label="Guardar edad">
                    <Save size={14} />
                  </button>
                  <button onClick={cancelEdit} aria-label="Cancelar edición">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="display-field">
                  <span>{datosPersonales.edad} años</span>
                  <button 
                    onClick={() => handleEdit('edad', datosPersonales.edad)}
                    aria-label="Editar edad"
                    className="edit-button"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              )}
            </div>
            {errors.edad && <span className="error-message">{errors.edad}</span>}
          </div>
          <div className="data-item">
            <span className="data-label">Peso:</span>
            <div className="data-value-editable">
              {editingField === 'peso' ? (
                <div className="edit-field">
                  <input
                    type="number"
                    step="0.1"
                    value={tempValues.peso || datosPersonales.peso}
                    onChange={(e) => setTempValues(prev => ({...prev, peso: e.target.value}))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit('peso');
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                  />
                  <button onClick={() => saveEdit('peso')} aria-label="Guardar peso">
                    <Save size={14} />
                  </button>
                  <button onClick={cancelEdit} aria-label="Cancelar edición">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="display-field">
                  <span>{datosPersonales.peso} kg</span>
                  <button 
                    onClick={() => handleEdit('peso', datosPersonales.peso)}
                    aria-label="Editar peso"
                    className="edit-button"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              )}
            </div>
            {errors.peso && <span className="error-message">{errors.peso}</span>}
          </div>
          <div className="data-item">
            <span className="data-label">Talla:</span>
            <div className="data-value-editable">
              {editingField === 'talla' ? (
                <div className="edit-field">
                  <input
                    type="number"
                    step="0.1"
                    value={tempValues.talla || datosPersonales.talla}
                    onChange={(e) => setTempValues(prev => ({...prev, talla: e.target.value}))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit('talla');
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                  />
                  <button onClick={() => saveEdit('talla')} aria-label="Guardar talla">
                    <Save size={14} />
                  </button>
                  <button onClick={cancelEdit} aria-label="Cancelar edición">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="display-field">
                  <span>{datosPersonales.talla} cm</span>
                  <button 
                    onClick={() => handleEdit('talla', datosPersonales.talla)}
                    aria-label="Editar talla"
                    className="edit-button"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              )}
            </div>
            {errors.talla && <span className="error-message">{errors.talla}</span>}
          </div>
        </div>
      </div>

      {/* Indicadores Antropométricos con tooltips */}
      <div className="section-card">
        <div className="section-header">
          <Calculator className="section-icon" />
          <h3>Indicadores Antropométricos</h3>
        </div>
        <div className="indicators-grid">
          <div className="indicator-card imc">
            <h4>
              IMC
              <button
                className="tooltip-trigger"
                onMouseEnter={(e) => showTooltipHandler('imc', e)}
                onMouseLeave={hideTooltipHandler}
                aria-label="Información sobre IMC"
              >
                <HelpCircle size={16} />
              </button>
            </h4>
            <div className="indicator-value">{datosPersonales.imc.toFixed(1)} kg/m²</div>
            {imcClassification && (
              <div 
                className="indicator-classification"
                style={{ color: imcClassification.color }}
              >
                {imcClassification.text}
              </div>
            )}
          </div>
          <div className="indicator-card">
            <h4>
              Peso Ideal
              <button
                className="tooltip-trigger"
                onMouseEnter={(e) => showTooltipHandler('pesoIdeal', e)}
                onMouseLeave={hideTooltipHandler}
                aria-label="Información sobre peso ideal"
              >
                <HelpCircle size={16} />
              </button>
            </h4>
            <div className="indicator-value">{datosPersonales.pesoIdeal} kg</div>
            <div className="indicator-note">Fórmula de Broca</div>
          </div>
          <div className="indicator-card">
            <h4>
              Peso Ajustado
              <button
                className="tooltip-trigger"
                onMouseEnter={(e) => showTooltipHandler('pesoAjustado', e)}
                onMouseLeave={hideTooltipHandler}
                aria-label="Información sobre peso ajustado"
              >
                <HelpCircle size={16} />
              </button>
            </h4>
            <div className="indicator-value">{datosPersonales.pesoAjustado} kg</div>
            <div className="indicator-note">Para cálculos nutricionales</div>
          </div>
        </div>
      </div>

      {/* Gasto Energético con tooltips */}
      <div className="section-card">
        <div className="section-header">
          <Activity className="section-icon" />
          <h3>Gasto Energético</h3>
        </div>
        <div className="energy-grid">
          <div className="energy-card">
            <h4>
              GER
              <button
                className="tooltip-trigger"
                onMouseEnter={(e) => showTooltipHandler('ger', e)}
                onMouseLeave={hideTooltipHandler}
                aria-label="Información sobre GER"
              >
                <HelpCircle size={16} />
              </button>
            </h4>
            <div className="energy-value">{datosPersonales.ger} kcal/día</div>
            <div className="energy-note">Gasto Energético en Reposo</div>
          </div>
          <div className="energy-card primary">
            <h4>
              GET
              <button
                className="tooltip-trigger"
                onMouseEnter={(e) => showTooltipHandler('get', e)}
                onMouseLeave={hideTooltipHandler}
                aria-label="Información sobre GET"
              >
                <HelpCircle size={16} />
              </button>
            </h4>
            <div className="energy-value main">{datosPersonales.get} kcal/día</div>
            <div className="energy-note">Requerimiento Calórico Total</div>
          </div>
        </div>
        <div className="activity-factor">
          <strong>Factor de Actividad:</strong> {datosPersonales.factorActividad} - {getFactorActividadText(datosPersonales.factorActividad)}
        </div>
      </div>

      {/* Distribución de Macronutrientes */}
      <div className="section-card">
        <div className="section-header">
          <Target className="section-icon" />
          <h3>Distribución de Macronutrientes (IDMA)</h3>
        </div>
        <div className="macros-summary">
          <div className="macro-card proteins">
            <h4>Proteínas</h4>
            <div className="macro-percentage">{macros.proteinasPorcentaje}%</div>
            <div className="macro-details">
              <span>{macros.proteinasKcal} kcal</span>
              <span>{macros.proteinasGramos} g</span>
            </div>
          </div>
          <div className="macro-card carbs">
            <h4>Carbohidratos</h4>
            <div className="macro-percentage">{macros.carbohidratosPorcentaje}%</div>
            <div className="macro-details">
              <span>{macros.carbohidratosKcal} kcal</span>
              <span>{macros.carbohidratosGramos} g</span>
            </div>
          </div>
          <div className="macro-card fats">
            <h4>Grasas</h4>
            <div className="macro-percentage">{macros.grasasPorcentaje}%</div>
            <div className="macro-details">
              <span>{macros.grasasKcal} kcal</span>
              <span>{macros.grasasGramos} g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen Nutricional Final */}
      <div className="section-card">
        <div className="section-header">
          <CheckCircle className="section-icon" />
          <h3>Resumen Nutricional Final</h3>
        </div>
        <div className="final-summary">
          <div className="final-item">
            <span className="final-label">Calorías Totales:</span>
            <span className="final-value primary">{totalesNutricionales.totalKcal} kcal</span>
          </div>
          <div className="final-item">
            <span className="final-label">Carbohidratos:</span>
            <span className="final-value">{totalesNutricionales.totalCho} g</span>
          </div>
          <div className="final-item">
            <span className="final-label">Proteínas:</span>
            <span className="final-value">{totalesNutricionales.totalChon} g</span>
          </div>
          <div className="final-item">
            <span className="final-label">Grasas:</span>
            <span className="final-value">{totalesNutricionales.totalCooh} g</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlanComidas = () => (
    <div className="plan-content">
      <div className="plan-header">
        <Clock className="plan-icon" />
        <h3>Plan de Comidas Personalizado</h3>
        <p>Distribución de alimentos por tiempo de comida</p>
      </div>

      {/* Gráfico de distribución de comidas */}
      {userPreferences.showGraphics && (
        <div className="chart-container" style={{ marginBottom: '24px' }}>
          <h4>Distribución de Alimentos por Comida</h4>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="alimentos" fill="#8CAFCF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="meals-grid">
        {Object.entries(mealTimes).map(([mealId, meal]) => {
          const IconComponent = meal.icon;
          const mealFoods = mealPlan[mealId] || [];
          
          return (
            <div key={mealId} className="meal-card" style={{ borderColor: meal.color }}>
              <div className="meal-header" style={{ backgroundColor: meal.color }}>
                <IconComponent className="meal-icon" />
                <div className="meal-info">
                  <h4>{meal.name}</h4>
                  <span className="meal-time">{meal.time}</span>
                </div>
              </div>
              
              <div className="meal-foods">
                {mealFoods.length > 0 ? (
                  mealFoods.map((food, index) => (
                    <div key={index} className="food-item">
                      <span className="food-name">{food.name}</span>
                      <span className="food-quantity">{food.quantity} intercambios</span>
                    </div>
                  ))
                ) : (
                  <div className="no-foods">Sin alimentos asignados</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderIntercambios = () => (
    <div className="intercambios-content">
      <div className="intercambios-header">
        <Utensils className="intercambios-icon" />
        <h3>Tabla de Intercambios Completa</h3>
        <p>Detalle de intercambios por grupo de alimentos</p>
      </div>

      {/* Buscador */}
      <div className="search-container" style={{ marginBottom: '20px' }}>
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar alimentos o grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Buscar en tabla de intercambios"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="clear-search"
              aria-label="Limpiar búsqueda"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="intercambios-table-wrapper">
        <table className="intercambios-table" role="table" aria-label="Tabla de intercambios nutricionales">
          <thead>
            <tr role="row">
              <th role="columnheader">Grupo de Alimento</th>
              <th role="columnheader">Intercambios</th>
              <th role="columnheader">CHO (g)</th>
              <th role="columnheader">PROT (g)</th>
              <th role="columnheader">GRAS (g)</th>
              <th role="columnheader">KCAL</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(filteredIntercambios).map(([categoria, subcategorias]) => (
              <React.Fragment key={categoria}>
                {Object.entries(subcategorias || {}).map(([subKey, data]) => {
                  if (safeParseFloat(data?.intercambios, 0) > 0) {
                    return (
                      <tr key={`${categoria}-${subKey}`} role="row">
                        <td role="cell" className="food-name">{getIntercambioName(categoria, subKey)}</td>
                        <td role="cell" className="intercambios-count">{safeParseFloat(data.intercambios, 0)}</td>
                        <td role="cell">{Math.round(safeParseFloat(data.cho, 0))}</td>
                        <td role="cell">{Math.round(safeParseFloat(data.chon, 0))}</td>
                        <td role="cell">{Math.round(safeParseFloat(data.cooh, 0))}</td>
                        <td role="cell">{Math.round(safeParseFloat(data.kcal, 0))}</td>
                      </tr>
                    );
                  }
                  return null;
                })}
              </React.Fragment>
            ))}
            <tr className="total-row" role="row">
              <td role="cell"><strong>TOTAL</strong></td>
              <td role="cell">-</td>
              <td role="cell"><strong>{Math.round(totalesNutricionales.totalCho)}</strong></td>
              <td role="cell"><strong>{Math.round(totalesNutricionales.totalChon)}</strong></td>
              <td role="cell"><strong>{Math.round(totalesNutricionales.totalCooh)}</strong></td>
              <td role="cell"><strong>{Math.round(totalesNutricionales.totalKcal)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      {Object.keys(filteredIntercambios).length === 0 && searchTerm && (
        <div className="no-results" style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          fontStyle: 'italic' 
        }}>
          No se encontraron resultados para "{searchTerm}"
        </div>
      )}
    </div>
  );

  return (
    <div className="step5-container">
      {/* Tooltip */}
      {showTooltip && (
        <Tooltip 
          text={tooltips[showTooltip.key]} 
          x={showTooltip.x} 
          y={showTooltip.y} 
        />
      )}

      {/* Modal de Confirmación */}
      <ConfirmationModal
        isOpen={!!showConfirmation}
        onConfirm={executeAction}
        onCancel={() => setShowConfirmation(null)}
        title={showConfirmation === 'finish' ? 'Finalizar Plan' : 'Confirmar Acción'}
        message={showConfirmation === 'finish' 
          ? '¿Estás seguro de que quieres finalizar el plan nutricional? Esta acción no se puede deshacer.'
          : 'Por favor confirma que deseas realizar esta acción.'
        }
      />

      {/* Header */}
      <div className="step5-header">
        <div className="icon-container">
          <FileText className="header-icon" />
        </div>
        <h1 className="step-title">Resumen Nutricional</h1>
        <p className="step-subtitle">
          Tu plan nutricional personalizado está listo. Revisa todos los detalles de tu programa alimentario y guárdalo para futuras referencias.
          <br />
          <small style={{ color: '#666', fontSize: '0.9em' }}>
            Atajos de teclado: Ctrl+P (imprimir), Ctrl+S (descargar), Ctrl+K (compartir)
          </small>
        </p>
      </div>

      {/* Action Buttons con estados de loading */}
      <div className="action-buttons">
        <LoadingButton
          className="action-button print"
          onClick={() => handleExport('print')}
          loading={loadingStates.print}
          aria-label="Imprimir prescripción dietética"
        >
          <Printer className="action-icon" />
          Imprimir
        </LoadingButton>
        <PDFExporter
          datosPersonales={datosPersonales}
          macros={macros}
          mealPlan={mealPlan}
          mealTimes={mealTimes}
          intercambios={intercambios}
          totalesNutricionales={totalesNutricionales}
          getIntercambioName={getIntercambioName}
          safeParseFloat={safeParseFloat}
          onSuccess={handlePDFSuccess}
          onError={handlePDFError}
          className="action-button pdf"
        />
        <LoadingButton
          className="action-button download"
          onClick={() => handleExport('download')}
          loading={loadingStates.download}
          aria-label="Descargar plan nutricional"
        >
          <Download className="action-icon" />
          Descargar
        </LoadingButton>
        <LoadingButton
          className="action-button share"
          onClick={() => handleExport('share')}
          loading={loadingStates.share}
          aria-label="Compartir plan nutricional"
        >
          <Share className="action-icon" />
          Compartir
        </LoadingButton>
      </div>

      {/* Copy Notification mejorada */}
      {copiedText && (
        <div className="copy-notification" role="status" aria-live="polite">
          <Check className="action-icon" />
          {copiedText}
        </div>
      )}

      {/* Tab Navigation con navegación por teclado */}
      <div 
        className="tab-navigation" 
        ref={tabsRef}
        role="tablist"
        onKeyDown={handleKeyNavigation}
      >
        <button 
          className={`tab-button ${activeTab === 'resumen' ? 'active' : ''}`}
          onClick={() => handleTabChange('resumen')}
          role="tab"
          aria-selected={activeTab === 'resumen'}
          aria-controls="resumen-panel"
          tabIndex={activeTab === 'resumen' ? 0 : -1}
        >
          <User className="tab-icon" />
          Resumen General
        </button>
        <button 
          className={`tab-button ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => handleTabChange('plan')}
          role="tab"
          aria-selected={activeTab === 'plan'}
          aria-controls="plan-panel"
          tabIndex={activeTab === 'plan' ? 0 : -1}
        >
          <Clock className="tab-icon" />
          Plan de Comidas
        </button>
        <button 
          className={`tab-button ${activeTab === 'intercambios' ? 'active' : ''}`}
          onClick={() => handleTabChange('intercambios')}
          role="tab"
          aria-selected={activeTab === 'intercambios'}
          aria-controls="intercambios-panel"
          tabIndex={activeTab === 'intercambios' ? 0 : -1}
        >
          <Utensils className="tab-icon" />
          Tabla de Intercambios
        </button>
      </div>

      {/* Contenido de las Tabs */}
      <div className="tab-content">
        <div
          id="resumen-panel"
          role="tabpanel"
          aria-labelledby="resumen-tab"
          hidden={activeTab !== 'resumen'}
        >
          {activeTab === 'resumen' && renderResumenGeneral()}
        </div>
        <div
          id="plan-panel"
          role="tabpanel"
          aria-labelledby="plan-tab"
          hidden={activeTab !== 'plan'}
        >
          {activeTab === 'plan' && renderPlanComidas()}
        </div>
        <div
          id="intercambios-panel"
          role="tabpanel"
          aria-labelledby="intercambios-tab"
          hidden={activeTab !== 'intercambios'}
        >
          {activeTab === 'intercambios' && renderIntercambios()}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        <button 
          className="nav-button prev" 
          onClick={onPrev}
          aria-label="Ir al paso anterior"
        >
          <ChevronLeft className="nav-icon" />
          Volver
        </button>
        <button 
          className="nav-button finish" 
          onClick={() => handleConfirmAction('finish')}
          aria-label="Finalizar plan nutricional"
        >
          Finalizar Plan
        </button>
      </div>

      {/* Información de errores si los hay */}
      {Object.keys(errors).length > 0 && (
        <div className="errors-container" role="alert" aria-live="assertive">
          <AlertTriangle size={20} />
          <div>
            <strong>Se encontraron errores en los datos:</strong>
            <ul>
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5ResumenNutricional;