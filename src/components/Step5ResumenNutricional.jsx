import React, { useState } from 'react';
import './Step5ResumenNutricional.css'; // Importa el CSS externo
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
  Check
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('resumen');
  const [copiedText, setCopiedText] = useState('');

  // Extraer datos de todos los pasos anteriores
  const datosPersonales = {
    genero: formData.genero || '',
    peso: formData.peso || '',
    talla: formData.talla || '',
    edad: formData.edad || '',
    imc: formData.imc || '',
    pesoIdeal: formData.pesoIdeal || '',
    pesoAjustado: formData.pesoAjustado || '',
    ger: formData.ger || '',
    get: formData.get || '',
    factorActividad: formData.factorActividad || ''
  };

  const macros = formData.macros || {};
  const intercambios = formData.intercambios || {};
  const distribucionComidas = formData.distribucionComidas || {};
  const totalesNutricionales = formData.totalesNutricionales || {};

  // Configuración de tiempos de comida
  const mealTimes = {
    desayuno: { name: 'Desayuno', icon: Coffee, color: '#F0BCC9', time: '7:00 AM' },
    merienda1: { name: 'Media Mañana', icon: Sun, color: '#A8CFC2', time: '10:00 AM' },
    almuerzo: { name: 'Almuerzo', icon: Sun, color: '#8CAFCF', time: '12:30 PM' },
    merienda2: { name: 'Media Tarde', icon: Sunset, color: '#E3C0CF', time: '4:00 PM' },
    cena: { name: 'Cena', icon: Moon, color: '#EB92A3', time: '7:00 PM' }
  };

  // Obtener clasificación del IMC
  const getIMCClassification = (imc) => {
    const imcValue = parseFloat(imc);
    if (imcValue < 18.5) return { text: 'Bajo peso', color: '#8CAFCF' };
    if (imcValue < 25) return { text: 'Peso normal', color: '#A8CFC2' };
    if (imcValue < 30) return { text: 'Sobrepeso', color: '#F0BCC9' };
    return { text: 'Obesidad', color: '#EB92A3' };
  };

  const imcClassification = datosPersonales.imc ? getIMCClassification(datosPersonales.imc) : null;

  // Obtener factor de actividad readable
  const getFactorActividadText = (factor) => {
    const factors = {
      '1.2': 'Sedentario (sin ejercicio)',
      '1.375': 'Ligeramente activo (1-3 días/semana)',
      '1.55': 'Moderadamente activo (3-5 días/semana)',
      '1.725': 'Muy activo (6-7 días/semana)',
      '1.9': 'Extremadamente activo (ejercicio intenso)'
    };
    return factors[factor] || factor;
  };

  // Mapear nombres de intercambios
  const getIntercambioName = (categoria, subcategoria) => {
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
  };

  // Generar plan de comidas organizado
  const generateMealPlan = () => {
    const plan = {};
    
    Object.keys(mealTimes).forEach(mealId => {
      plan[mealId] = [];
      
      Object.entries(distribucionComidas).forEach(([foodId, distribution]) => {
        const quantity = distribution[mealId];
        if (quantity > 0) {
          // Encontrar el nombre del alimento
          let foodName = foodId;
          Object.entries(intercambios).forEach(([categoria, subcategorias]) => {
            Object.entries(subcategorias).forEach(([subKey, data]) => {
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
  };

  const mealPlan = generateMealPlan();

  // Generar texto para compartir/copiar
  const generateShareableText = () => {
    return `
🍎 PLAN NUTRICIONAL PERSONALIZADO

👤 DATOS PERSONALES:
• Género: ${datosPersonales.genero === 'masculino' ? 'Masculino' : 'Femenino'}
• Edad: ${datosPersonales.edad} años
• Peso: ${datosPersonales.peso} kg
• Talla: ${datosPersonales.talla} cm

📊 INDICADORES:
• IMC: ${datosPersonales.imc} kg/m² (${imcClassification?.text})
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
  };

  // Handler para exportar/imprimir
  const handleExport = async (type) => {
    if (type === 'print') {
      window.print();
    } else if (type === 'pdf') {
      // Simulación de descarga PDF
      const element = document.createElement('a');
      const file = new Blob([generateShareableText()], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = 'plan-nutricional.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else if (type === 'share') {
      const text = generateShareableText();
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Mi Plan Nutricional',
            text: text
          });
        } catch (err) {
          console.log('Error sharing:', err);
          fallbackShare(text);
        }
      } else {
        fallbackShare(text);
      }
    }
  };

  const fallbackShare = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText('¡Copiado al portapapeles!');
      setTimeout(() => setCopiedText(''), 3000);
    } catch (err) {
      console.log('Error copying to clipboard:', err);
      setCopiedText('No se pudo copiar');
      setTimeout(() => setCopiedText(''), 3000);
    }
  };

  const renderResumenGeneral = () => (
    <div className="resumen-content">
      {/* Datos Personales */}
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
            <span className="data-value">{datosPersonales.edad} años</span>
          </div>
          <div className="data-item">
            <span className="data-label">Peso:</span>
            <span className="data-value">{datosPersonales.peso} kg</span>
          </div>
          <div className="data-item">
            <span className="data-label">Talla:</span>
            <span className="data-value">{datosPersonales.talla} cm</span>
          </div>
        </div>
      </div>

      {/* Indicadores Antropométricos */}
      <div className="section-card">
        <div className="section-header">
          <Calculator className="section-icon" />
          <h3>Indicadores Antropométricos</h3>
        </div>
        <div className="indicators-grid">
          <div className="indicator-card imc">
            <h4>IMC</h4>
            <div className="indicator-value">{datosPersonales.imc} kg/m²</div>
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
            <h4>Peso Ideal</h4>
            <div className="indicator-value">{datosPersonales.pesoIdeal} kg</div>
            <div className="indicator-note">Fórmula de Broca</div>
          </div>
          <div className="indicator-card">
            <h4>Peso Ajustado</h4>
            <div className="indicator-value">{datosPersonales.pesoAjustado} kg</div>
            <div className="indicator-note">Para cálculos nutricionales</div>
          </div>
        </div>
      </div>

      {/* Gasto Energético */}
      <div className="section-card">
        <div className="section-header">
          <Activity className="section-icon" />
          <h3>Gasto Energético</h3>
        </div>
        <div className="energy-grid">
          <div className="energy-card">
            <h4>GER</h4>
            <div className="energy-value">{datosPersonales.ger} kcal/día</div>
            <div className="energy-note">Gasto Energético en Reposo</div>
          </div>
          <div className="energy-card primary">
            <h4>GET</h4>
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

      <div className="intercambios-table-wrapper">
        <table className="intercambios-table">
          <thead>
            <tr>
              <th>Grupo de Alimento</th>
              <th>Intercambios</th>
              <th>CHO (g)</th>
              <th>PROT (g)</th>
              <th>GRAS (g)</th>
              <th>KCAL</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(intercambios).map(([categoria, subcategorias]) => (
              <React.Fragment key={categoria}>
                {Object.entries(subcategorias).map(([subKey, data]) => {
                  if (data.intercambios > 0) {
                    return (
                      <tr key={`${categoria}-${subKey}`}>
                        <td className="food-name">{getIntercambioName(categoria, subKey)}</td>
                        <td className="intercambios-count">{data.intercambios}</td>
                        <td>{Math.round(data.cho)}</td>
                        <td>{Math.round(data.chon)}</td>
                        <td>{Math.round(data.cooh)}</td>
                        <td>{Math.round(data.kcal)}</td>
                      </tr>
                    );
                  }
                  return null;
                })}
                </React.Fragment>
            ))}
            <tr className="total-row">
              <td><strong>TOTAL</strong></td>
              <td>-</td>
              <td><strong>{Math.round(totalesNutricionales.totalCho)}</strong></td>
              <td><strong>{Math.round(totalesNutricionales.totalChon)}</strong></td>
              <td><strong>{Math.round(totalesNutricionales.totalCooh)}</strong></td>
              <td><strong>{Math.round(totalesNutricionales.totalKcal)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="step5-container">
      {/* Header */}
      <div className="step5-header">
        <div className="icon-container">
          <FileText className="header-icon" />
        </div>
        <h1 className="step-title">Resumen Nutricional</h1>
        <p className="step-subtitle">
          Tu plan nutricional personalizado está listo. Revisa todos los detalles de tu programa alimentario y guárdalo para futuras referencias.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="action-button print"
          onClick={() => handleExport('print')}
        >
          <Printer className="action-icon" />
          Imprimir
        </button>
        <button 
          className="action-button download"
          onClick={() => handleExport('pdf')}
        >
          <Download className="action-icon" />
          Descargar
        </button>
        <button 
          className="action-button share"
          onClick={() => handleExport('share')}
        >
          <Share className="action-icon" />
          Compartir
        </button>
      </div>

      {/* Copy Notification */}
      {copiedText && (
        <div className="copy-notification">
          <Check className="action-icon" />
          {copiedText}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'resumen' ? 'active' : ''}`}
          onClick={() => setActiveTab('resumen')}
        >
          <User className="tab-icon" />
          Resumen General
        </button>
        <button 
          className={`tab-button ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('plan')}
        >
          <Clock className="tab-icon" />
          Plan de Comidas
        </button>
        <button 
          className={`tab-button ${activeTab === 'intercambios' ? 'active' : ''}`}
          onClick={() => setActiveTab('intercambios')}
        >
          <Utensils className="tab-icon" />
          Tabla de Intercambios
        </button>
      </div>

      {/* Contenido de las Tabs */}
      <div className="tab-content">
        {activeTab === 'resumen' && renderResumenGeneral()}
        {activeTab === 'plan' && renderPlanComidas()}
        {activeTab === 'intercambios' && renderIntercambios()}
      </div>

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        <button className="nav-button prev" onClick={onPrev}>
          <ChevronLeft className="nav-icon" />
          Volver
        </button>
        <button className="nav-button finish" onClick={onFinish}>
          Finalizar Plan
        </button>
      </div>
    </div>
  );
};

export default Step5ResumenNutricional;