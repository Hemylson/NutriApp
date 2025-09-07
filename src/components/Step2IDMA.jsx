import React, { useState, useEffect } from 'react';
import { Calculator, ChevronLeft, ChevronRight, Target, Zap, Building, Wheat } from 'lucide-react';

const Step2IDMA = ({ 
  formData = {}, 
  onNext, 
  onPrev, 
  onChange,
  totalCalories = 2000 // GET del paso anterior
}) => {
  const [macros, setMacros] = useState({
    // Proteínas
    proteinasPorcentaje: '20',
    proteinasKcal: '',
    proteinasGramos: '',
    // Carbohidratos
    carbohidratosPorcentaje: '50',
    carbohidratosKcal: '',
    carbohidratosGramos: '',
    // Grasas
    grasasPorcentaje: '30',
    grasasKcal: '',
    grasasGramos: '',
    ...formData.macros
  });

  // Calorías por gramo de cada macronutriente
  const CALORIAS_POR_GRAMO = {
    proteinas: 4,
    carbohidratos: 4,
    grasas: 9
  };

  // Calcular valores automáticamente cuando cambien porcentajes o calorías
  useEffect(() => {
    if (totalCalories && totalCalories > 0) {
      const proteinasKcal = Math.round((totalCalories * parseFloat(macros.proteinasPorcentaje || 0)) / 100);
      const carbohidratosKcal = Math.round((totalCalories * parseFloat(macros.carbohidratosPorcentaje || 0)) / 100);
      const grasasKcal = Math.round((totalCalories * parseFloat(macros.grasasPorcentaje || 0)) / 100);

      const proteinasGramos = Math.round(proteinasKcal / CALORIAS_POR_GRAMO.proteinas);
      const carbohidratosGramos = Math.round(carbohidratosKcal / CALORIAS_POR_GRAMO.carbohidratos);
      const grasasGramos = Math.round(grasasKcal / CALORIAS_POR_GRAMO.grasas);

      setMacros(prev => ({
        ...prev,
        proteinasKcal: proteinasKcal.toString(),
        carbohidratosKcal: carbohidratosKcal.toString(),
        grasasKcal: grasasKcal.toString(),
        proteinasGramos: proteinasGramos.toString(),
        carbohidratosGramos: carbohidratosGramos.toString(),
        grasasGramos: grasasGramos.toString()
      }));
    }
  }, [macros.proteinasPorcentaje, macros.carbohidratosPorcentaje, macros.grasasPorcentaje, totalCalories]);

  // Actualizar datos del formulario padre cuando cambien los macros
  useEffect(() => {
    if (onChange) {
      onChange({ macros });
    }
  }, [macros, onChange]);

  const handlePorcentajeChange = (macro, value) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      setMacros(prev => ({
        ...prev,
        [`${macro}Porcentaje`]: value
      }));
      
      // Ajustar otros porcentajes si la suma excede 100%
      adjustOtherPercentages(macro, numValue);
    }
  };

  const handleKcalChange = (macro, value) => {
    const numValue = parseFloat(value) || 0;
    if (totalCalories && totalCalories > 0) {
      const porcentaje = Math.min(100, (numValue / totalCalories) * 100);
      const gramos = Math.round(numValue / CALORIAS_POR_GRAMO[macro]);
      
      setMacros(prev => ({
        ...prev,
        [`${macro}Kcal`]: value,
        [`${macro}Porcentaje`]: porcentaje.toFixed(1),
        [`${macro}Gramos`]: gramos.toString()
      }));
      
      adjustOtherPercentages(macro, porcentaje);
    }
  };

  const handleGramosChange = (macro, value) => {
    const numValue = parseFloat(value) || 0;
    const kcal = Math.round(numValue * CALORIAS_POR_GRAMO[macro]);
    const porcentaje = totalCalories ? Math.min(100, (kcal / totalCalories) * 100) : 0;
    
    setMacros(prev => ({
      ...prev,
      [`${macro}Gramos`]: value,
      [`${macro}Kcal`]: kcal.toString(),
      [`${macro}Porcentaje`]: porcentaje.toFixed(1)
    }));
    
    adjustOtherPercentages(macro, porcentaje);
  };

  const adjustOtherPercentages = (changedMacro, newValue) => {
    const macrosList = ['proteinas', 'carbohidratos', 'grasas'];
    const otherMacros = macrosList.filter(m => m !== changedMacro);
    
    const currentTotal = parseFloat(macros[`${otherMacros[0]}Porcentaje`] || 0) + 
                        parseFloat(macros[`${otherMacros[1]}Porcentaje`] || 0) + 
                        newValue;
    
    if (currentTotal > 100) {
      const excess = currentTotal - 100;
      const reduction = excess / 2;
      
      setTimeout(() => {
        setMacros(prev => ({
          ...prev,
          [`${otherMacros[0]}Porcentaje`]: Math.max(0, parseFloat(prev[`${otherMacros[0]}Porcentaje`] || 0) - reduction).toFixed(1),
          [`${otherMacros[1]}Porcentaje`]: Math.max(0, parseFloat(prev[`${otherMacros[1]}Porcentaje`] || 0) - reduction).toFixed(1)
        }));
      }, 100);
    }
  };

  const getTotalPercentage = () => {
    return parseFloat(macros.proteinasPorcentaje || 0) + 
           parseFloat(macros.carbohidratosPorcentaje || 0) + 
           parseFloat(macros.grasasPorcentaje || 0);
  };

  const getTotalKcal = () => {
    return parseInt(macros.proteinasKcal || 0) + 
           parseInt(macros.carbohidratosKcal || 0) + 
           parseInt(macros.grasasKcal || 0);
  };

  const isValid = () => {
    const total = getTotalPercentage();
    return total >= 95 && total <= 105; // Permitir pequeña variación por redondeos
  };

  const renderMacroCard = (macro, icon, color, bgColor, title) => {
    const Icon = icon;
    return (
      <div className={`macro-card ${macro}-card`} style={{ borderColor: color }}>
        <div className="macro-header" style={{ background: bgColor }}>
          <Icon className="w-6 h-6" style={{ color: color }} />
          <h4 className="macro-title" style={{ color: color }}>{title}</h4>
        </div>
        
        <div className="macro-inputs">
          {/* Porcentaje */}
          <div className="input-group">
            <label className="input-label">Porcentaje</label>
            <div className="input-container">
              <input
                type="number"
                value={macros[`${macro}Porcentaje`]}
                onChange={(e) => handlePorcentajeChange(macro, e.target.value)}
                className="form-input"
                min="0"
                max="100"
                step="0.1"
              />
              <span className="input-unit">%</span>
            </div>
          </div>

          {/* Calorías */}
          <div className="input-group">
            <label className="input-label">Calorías</label>
            <div className="input-container">
              <input
                type="number"
                value={macros[`${macro}Kcal`]}
                onChange={(e) => handleKcalChange(macro, e.target.value)}
                className="form-input"
                min="0"
              />
              <span className="input-unit">kcal</span>
            </div>
          </div>

          {/* Gramos */}
          <div className="input-group">
            <label className="input-label">Gramos</label>
            <div className="input-container">
              <input
                type="number"
                value={macros[`${macro}Gramos`]}
                onChange={(e) => handleGramosChange(macro, e.target.value)}
                className="form-input"
                min="0"
                step="0.1"
              />
              <span className="input-unit">g</span>
            </div>
          </div>
        </div>

        {/* Barra visual del porcentaje */}
        <div className="percentage-bar">
          <div 
            className="percentage-fill"
            style={{ 
              width: `${Math.min(100, parseFloat(macros[`${macro}Porcentaje`] || 0))}%`,
              backgroundColor: color
            }}
          />
        </div>
        <div className="percentage-text" style={{ color: color }}>
          {parseFloat(macros[`${macro}Porcentaje`] || 0).toFixed(1)}%
        </div>
      </div>
    );
  };

  return (
    <div className="step2-container">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="icon-container">
          <Target className="w-12 h-12" />
        </div>
        <h2 className="step-title">Distribución de Macronutrientes</h2>
        <p className="step-subtitle">
          Ajusta la distribución de proteínas, carbohidratos y grasas según tus objetivos
        </p>
        <div className="calories-info">
          <span className="calories-label">Calorías totales:</span>
          <span className="calories-value">{totalCalories} kcal/día</span>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="summary-card">
        <div className="summary-header">
          <Calculator className="w-5 h-5" />
          <h3>Resumen IDMA</h3>
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total %:</span>
            <span className={`summary-value ${getTotalPercentage() === 100 ? 'valid' : 'invalid'}`}>
              {getTotalPercentage().toFixed(1)}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total kcal:</span>
            <span className="summary-value">{getTotalKcal()} kcal</span>
          </div>
        </div>
        {!isValid() && (
          <div className="validation-warning">
            ⚠️ La suma de porcentajes debe ser aproximadamente 100%
          </div>
        )}
      </div>

      {/* Cards de macronutrientes */}
      <div className="macros-grid">
        {renderMacroCard('proteinas', Zap, '#EB92A3', 'rgba(235, 146, 163, 0.1)', 'Proteínas')}
        {renderMacroCard('carbohidratos', Wheat, '#A8CFC2', 'rgba(168, 207, 194, 0.1)', 'Carbohidratos')}
        {renderMacroCard('grasas', Building, '#8CAFCF', 'rgba(140, 175, 207, 0.1)', 'Grasas')}
      </div>

      {/* Botones de navegación */}
      <div className="navigation-buttons">
        <button 
          onClick={onPrev}
          className="nav-button prev-button"
        >
          <ChevronLeft className="w-5 h-5" />
          Anterior
        </button>
        
        <button 
          onClick={onNext}
          disabled={!isValid()}
          className="nav-button next-button"
        >
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <style jsx>{`
        :root {
          --cheery: #EB92A3;
          --irresistible: #E3C0CF;
          --inThePink: #F0BCC9;
          --grayLight: #F8F7F7;
          --grayMedium: #CFC8C8;
          --grayDark: #6D6562;
          --accentSage: #A8CFC2;
          --accentBlue: #8CAFCF;
          --white: #ffffff;
          --shadow-soft: 0 4px 20px rgba(235, 146, 163, 0.15);
          --shadow-medium: 0 8px 30px rgba(235, 146, 163, 0.2);
          --border-radius: 12px;
          --border-radius-large: 20px;
        }

        .step2-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .icon-container {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--cheery), var(--irresistible));
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: var(--white);
          box-shadow: var(--shadow-soft);
        }

        .step-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--grayDark);
          margin-bottom: 0.5rem;
        }

        .step-subtitle {
          color: var(--grayDark);
          opacity: 0.8;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .calories-info {
          background: linear-gradient(135deg, var(--accentSage), var(--accentBlue));
          color: var(--white);
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          display: inline-block;
          font-weight: 600;
          box-shadow: var(--shadow-soft);
        }

        .calories-label {
          margin-right: 0.5rem;
        }

        .calories-value {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .summary-card {
          background: var(--white);
          border: 2px solid var(--grayMedium);
          border-radius: var(--border-radius);
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-soft);
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: var(--grayDark);
        }

        .summary-header h3 {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: var(--grayLight);
          border-radius: 8px;
        }

        .summary-label {
          font-weight: 600;
          color: var(--grayDark);
        }

        .summary-value {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .summary-value.valid {
          color: var(--accentSage);
        }

        .summary-value.invalid {
          color: var(--cheery);
        }

        .validation-warning {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(235, 146, 163, 0.1);
          border: 1px solid var(--cheery);
          border-radius: 8px;
          color: var(--cheery);
          font-weight: 600;
          text-align: center;
        }

        .macros-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .macro-card {
          background: var(--white);
          border: 2px solid;
          border-radius: var(--border-radius);
          padding: 1.5rem;
          box-shadow: var(--shadow-soft);
          transition: all 0.3s ease;
        }

        .macro-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-medium);
        }

        .macro-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          border-radius: 8px;
        }

        .macro-title {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0;
        }

        .macro-inputs {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--grayDark);
          margin-bottom: 0.5rem;
        }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--grayMedium);
          background: var(--grayLight);
          color: var(--grayDark);
          border-radius: var(--border-radius);
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.3s ease;
          padding-right: 3rem;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--cheery);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(235, 146, 163, 0.1);
        }

        .input-unit {
          position: absolute;
          right: 0.75rem;
          color: var(--grayMedium);
          font-size: 0.9rem;
          font-weight: 600;
          pointer-events: none;
        }

        .percentage-bar {
          width: 100%;
          height: 8px;
          background: var(--grayLight);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .percentage-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .percentage-text {
          text-align: center;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .navigation-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border: none;
          border-radius: var(--border-radius);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 140px;
          justify-content: center;
        }

        .prev-button {
          background: var(--grayMedium);
          color: var(--grayDark);
        }

        .prev-button:hover {
          background: var(--grayDark);
          color: var(--white);
          transform: translateY(-2px);
          box-shadow: var(--shadow-soft);
        }

        .next-button {
          background: linear-gradient(135deg, var(--cheery), var(--irresistible));
          color: var(--white);
        }

        .next-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-medium);
        }

        .next-button:disabled {
          background: var(--grayMedium);
          color: var(--grayDark);
          cursor: not-allowed;
          opacity: 0.6;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .step2-container {
            padding: 1rem;
          }

          .step-title {
            font-size: 1.6rem;
          }

          .step-subtitle {
            font-size: 1rem;
          }

          .macros-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .navigation-buttons {
            flex-direction: column;
          }

          .nav-button {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Step2IDMA;