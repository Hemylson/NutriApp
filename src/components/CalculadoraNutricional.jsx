import React, { useState, useEffect } from 'react';
import { User, Calculator, ChevronRight, Activity } from 'lucide-react';
import Step2IDMA from './Step2IDMA';
import Step3Intercambios from './Step3Intercambios';
// 1. Importa el paso 4
import Step4DistribucionComidas from './Step4DistribucionComidas.jsx';
import Step5ResumenNutricional from './Step5ResumenNutricional.jsx';
const CalculadoraNutricional = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Datos personales
    genero: '',
    peso: '',
    pesoLibras: '',
    talla: '',
    edad: '',
    // Valores calculados
    imc: '',
    pesoIdeal: '',
    pesoAjustado: '',
    // Gasto energético
    ger: '',
    factorActividad: '1.2',
    get: '',
    // Paso 2: Macronutrientes
    macros: {
      proteinasPorcentaje: '20',
      proteinasKcal: '',
      proteinasGramos: '',
      carbohidratosPorcentaje: '50',
      carbohidratosKcal: '',
      carbohidratosGramos: '',
      grasasPorcentaje: '30',
      grasasKcal: '',
      grasasGramos: ''
    },
    // 2. Paso 3: Intercambios
    intercambios: {
      lacteos: {
        descremados: { intercambios: 0, cho: 0, chon: 0, cooh: 0, kcal: 0 },
        enteros: { intercambios: 1, cho: 12, chon: 8, cooh: 8, kcal: 160 },
        vegetales: { intercambios: 3, cho: 15, chon: 6, cooh: 0, kcal: 75 }
      },
      frutas: {
        frutas: { intercambios: 2, cho: 30, chon: 0, cooh: 0, kcal: 120 }
      },
      cereales: {
        conGrasa: { intercambios: 6, cho: 90, chon: 18, cooh: 15, kcal: 540 },
        sinGrasa: { intercambios: 2, cho: 30, chon: 6, cooh: 0, kcal: 150 }
      },
      proteinas: {
        magra: { intercambios: 4, cho: 0, chon: 28, cooh: 12, kcal: 220 },
        mediana: { intercambios: 2, cho: 0, chon: 14, cooh: 10, kcal: 150 },
        alta: { intercambios: 1, cho: 0, chon: 7, cooh: 8, kcal: 95 }
      },
      verduras: {
        verduras: { intercambios: 3, cho: 15, chon: 6, cooh: 0, kcal: 75 }
      },
      grasas: {
        grasas: { intercambios: 3, cho: 0, chon: 0, cooh: 15, kcal: 135 }
      }
    },
    totalesNutricionales: {
      totalCho: 0,
      totalChon: 0, 
      totalCooh: 0,
      totalKcal: 0
    }
  });

  const generos = [
  { value: 'masculino', label: 'Masculino', emoji: '👨' },
  { value: 'femenino', label: 'Femenino', emoji: '👩' }
];

  // Función para obtener la clasificación del IMC
  const getIMCClassification = (imc) => {
    const imcValue = parseFloat(imc);
    if (imcValue < 18.5) return { text: 'Bajo peso', color: '#8CAFCF' };
    if (imcValue < 25) return { text: 'Peso normal', color: '#A8CFC2' };
    if (imcValue < 30) return { text: 'Sobrepeso', color: '#F0BCC9' };
    return { text: 'Obesidad', color: '#EB92A3' };
  };

  // Cálculo automático del IMC
  useEffect(() => {
    if (formData.peso && formData.talla) {
      const pesoNum = parseFloat(formData.peso);
      const tallaNum = parseFloat(formData.talla);
      if (pesoNum > 0 && tallaNum > 0) {
        const tallaMts = tallaNum / 100;
        const imc = (pesoNum / (tallaMts * tallaMts)).toFixed(1);
        if (formData.imc !== imc) {
          setFormData(prev => ({ ...prev, imc }));
        }
      }
    }
  }, [formData.peso, formData.talla]);

  // Cálculo automático del peso ideal (Fórmula de Broca modificada)
  useEffect(() => {
    if (formData.talla && formData.genero) {
      const tallaNum = parseFloat(formData.talla);
      if (tallaNum > 0) {
        let pesoIdeal;
        if (formData.genero === 'masculino') {
          pesoIdeal = ((tallaNum - 100) * 0.9).toFixed(1);
        } else {
          pesoIdeal = ((tallaNum - 100) * 0.85).toFixed(1);
        }
        if (formData.pesoIdeal !== pesoIdeal) {
          setFormData(prev => ({ ...prev, pesoIdeal }));
        }
      }
    }
  }, [formData.talla, formData.genero]);

  // Cálculo automático del peso ajustado
  useEffect(() => {
    if (formData.peso && formData.pesoIdeal) {
      const pesoNum = parseFloat(formData.peso);
      const pesoIdealNum = parseFloat(formData.pesoIdeal);
      if (pesoNum > 0 && pesoIdealNum > 0) {
        const pesoAjustado = (pesoIdealNum + ((pesoNum - pesoIdealNum) * 0.25)).toFixed(1);
        if (formData.pesoAjustado !== pesoAjustado) {
          setFormData(prev => ({ ...prev, pesoAjustado }));
        }
      }
    }
  }, [formData.peso, formData.pesoIdeal]);

  // Cálculo automático del GER (Ecuación de Harris-Benedict revisada)
  useEffect(() => {
    if (formData.peso && formData.talla && formData.edad && formData.genero) {
      const peso = parseFloat(formData.peso);
      const talla = parseFloat(formData.talla);
      const edad = parseFloat(formData.edad);
      if (peso > 0 && talla > 0 && edad > 0) {
        let ger;
        if (formData.genero === 'masculino') {
          ger = (88.362 + (13.397 * peso) + (4.799 * talla) - (5.677 * edad)).toFixed(0);
        } else {
          ger = (447.593 + (9.247 * peso) + (3.098 * talla) - (4.330 * edad)).toFixed(0);
        }
        if (formData.ger !== ger) {
          setFormData(prev => ({ ...prev, ger }));
        }
      }
    }
  }, [formData.peso, formData.talla, formData.edad, formData.genero]);

  // Cálculo automático del GET
  useEffect(() => {
    if (formData.ger && formData.factorActividad) {
      const gerNum = parseFloat(formData.ger);
      const factor = parseFloat(formData.factorActividad);
      if (gerNum > 0 && factor > 0) {
        const get = (gerNum * factor).toFixed(0);
        if (formData.get !== get) {
          setFormData(prev => ({ ...prev, get }));
        }
      }
    }
  }, [formData.ger, formData.factorActividad]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePesoChange = (value, unit) => {
    if (unit === 'kg') {
      const kg = parseFloat(value) || '';
      const lb = kg ? (kg * 2.20462).toFixed(1) : '';
      setFormData(prev => ({ ...prev, peso: value, pesoLibras: lb }));
    } else {
      const lb = parseFloat(value) || '';
      const kg = lb ? (lb / 2.20462).toFixed(1) : '';
      setFormData(prev => ({ ...prev, pesoLibras: value, peso: kg }));
    }
  };

  const handleFactorActividadChange = (value) => {
    setFormData(prev => ({ ...prev, factorActividad: value }));
  };

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  // 3. Actualiza nextStep para permitir avanzar hasta el paso 4
  const nextStep = () => {
    console.log('nextStep llamado. currentStep actual:', currentStep);
    if (currentStep < 5) {
      console.log('Avanzando al paso:', currentStep + 1);
      setCurrentStep(prev => prev + 1);
    } else {
      console.log('Ya estoy en el último paso');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStep1Valid = () => {
    return formData.genero && formData.peso && formData.talla && formData.edad && formData.get;
  };

  const renderResultCard = (title, value, unit, description, className = '') => {
    return (
      <div className={`result-card ${className}`}>
        <div className="result-header">
          <h4 className="result-title">{title}</h4>
          <span className="result-description">{description}</span>
        </div>
        <div className="result-value">
          <span className="value-number">{value}</span>
          <span className="value-unit">{unit}</span>
        </div>
      </div>
    );
  };

  // Paso 1
  const renderStep1 = () => {
    const imcClassification = formData.imc ? getIMCClassification(formData.imc) : null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="icon-container">
            <User className="w-12 h-12" />
          </div>
          <h2 className="step-title">Calculadora Nutricional</h2>
          <p className="step-subtitle">Ingresa tu información para calcular tus necesidades energéticas</p>
        </div>

        <div className="form-grid">
          {/* Género */}
          <div className="form-group">
            <label className="form-label">
              Género <span className="required">*</span>
            </label>
            <div className="button-grid">
              {generos.map((genero) => (
                <button
                  key={genero.value}
                  onClick={() => handleInputChange('genero', genero.value)}
                  className={`option-button ${formData.genero === genero.value ? 'active' : ''}`}
                  type="button"
                >
                  <span className="emoji">{genero.emoji}</span>
                  {genero.label}
                </button>
              ))}
            </div>
          </div>

          {/* Peso */}
          <div className="form-group">
            <label className="form-label">
              Peso <span className="required">*</span>
            </label>
            <div className="dual-input">
              <div className="input-container">
                <input
                  type="number"
                  value={formData.peso}
                  onChange={(e) => handlePesoChange(e.target.value, 'kg')}
                  className="form-input"
                  placeholder="70"
                  min="1"
                  step="0.1"
                />
                <span className="input-unit">kg</span>
              </div>
              <div className="input-container">
                <input
                  type="number"
                  value={formData.pesoLibras}
                  onChange={(e) => handlePesoChange(e.target.value, 'lb')}
                  className="form-input"
                  placeholder="154.3"
                  min="1"
                  step="0.1"
                />
                <span className="input-unit">lb</span>
              </div>
            </div>
          </div>

          {/* Talla */}
          <div className="form-group">
            <label className="form-label">
              Talla <span className="required">*</span>
            </label>
            <div className="input-container">
              <input
                type="number"
                value={formData.talla}
                onChange={(e) => handleInputChange('talla', e.target.value)}
                className="form-input"
                placeholder="170"
                min="50"
                max="250"
                step="0.1"
              />
              <span className="input-unit">cm</span>
            </div>
          </div>

          {/* Edad */}
          <div className="form-group">
            <label className="form-label">
              Edad <span className="required">*</span>
            </label>
            <div className="input-container">
              <input
                type="number"
                value={formData.edad}
                onChange={(e) => handleInputChange('edad', e.target.value)}
                className="form-input"
                placeholder="25"
                min="1"
                max="120"
              />
              <span className="input-unit">años</span>
            </div>
          </div>
        </div>

        {/* Resultados Calculados */}
        {(formData.imc || formData.pesoIdeal || formData.pesoAjustado || formData.ger || formData.get) && (
          <div className="results-section">
            <div className="section-header">
              <Calculator className="w-6 h-6" />
              <h3 className="section-title">Valores Calculados</h3>
            </div>

            <div className="results-grid">
              {/* IMC */}
              {formData.imc && (
                <div className="result-card imc-card">
                  <div className="result-header">
                    <h4 className="result-title">IMC</h4>
                    <span className="result-description">Índice de Masa Corporal</span>
                  </div>
                  <div className="result-value">
                    <span className="value-number">{formData.imc}</span>
                    <span className="value-unit">kg/m²</span>
                  </div>
                  {imcClassification && (
                    <div className="imc-classification" style={{ color: imcClassification.color }}>
                      {imcClassification.text}
                    </div>
                  )}
                </div>
              )}

              {/* Peso Ideal */}
              {formData.pesoIdeal && (
                <div className="result-card">
                  <div className="result-header">
                    <h4 className="result-title">Peso Ideal</h4>
                    <span className="result-description">Fórmula de Broca</span>
                  </div>
                  <div className="result-value">
                    <span className="value-number">{formData.pesoIdeal}</span>
                    <span className="value-unit">kg</span>
                  </div>
                </div>
              )}

              {/* Peso Ajustado */}
              {formData.pesoAjustado && (
                <div className="result-card">
                  <div className="result-header">
                    <h4 className="result-title">Peso Ajustado</h4>
                    <span className="result-description">Para cálculos nutricionales</span>
                  </div>
                  <div className="result-value">
                    <span className="value-number">{formData.pesoAjustado}</span>
                    <span className="value-unit">kg</span>
                  </div>
                </div>
              )}
            </div>

            {/* Gasto Energético */}
            {(formData.ger || formData.get) && (
              <>
                <div className="section-header energy-header">
                  <Activity className="w-6 h-6" />
                  <h3 className="section-title">Gasto Energético</h3>
                </div>

                <div className="results-grid">
                  {/* GER */}
                  {formData.ger && (
                    <div className="result-card energy-card">
                      <div className="result-header">
                        <h4 className="result-title">GER</h4>
                        <span className="result-description">Gasto Energético en Reposo</span>
                      </div>
                      <div className="result-value">
                        <span className="value-number">{formData.ger}</span>
                        <span className="value-unit">kcal/día</span>
                      </div>
                    </div>
                  )}

                  {/* Factor de Actividad */}
                  <div className="form-group activity-selector">
                    <label className="form-label">
                      Factor de Actividad Física
                    </label>
                    <select
                      value={formData.factorActividad}
                      onChange={(e) => handleFactorActividadChange(e.target.value)}
                      className="form-select"
                    >
                      <option value="1.2">1.2 - Sedentario (sin ejercicio)</option>
                      <option value="1.375">1.375 - Ligeramente activo (1-3 días/semana)</option>
                      <option value="1.55">1.55 - Moderadamente activo (3-5 días/semana)</option>
                      <option value="1.725">1.725 - Muy activo (6-7 días/semana)</option>
                      <option value="1.9">1.9 - Extremadamente activo (ejercicio intenso)</option>
                    </select>
                  </div>

                  {/* GET */}
                  {formData.get && (
                    <div className="result-card get-card">
                      <div className="result-header">
                        <h4 className="result-title">GET</h4>
                        <span className="result-description">Gasto Energético Total</span>
                      </div>
                      <div className="result-value primary">
                        <span className="value-number">{formData.get}</span>
                        <span className="value-unit">kcal/día</span>
                      </div>
                      <div className="get-note">
                        Tu requerimiento calórico diario
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Botón siguiente */}
        {isStep1Valid() && formData.get && (
          <div className="step-navigation">
            <button
              onClick={nextStep}
              className="next-step-button"
            >
              Siguiente: Macronutrientes
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Renderiza el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return (
          <Step2IDMA
            formData={formData}
            totalCalories={parseInt(formData.get) || 0}
            onNext={nextStep}
            onPrev={prevStep}
            onChange={updateFormData}
          />
        );
      case 3:
        return (
          <Step3Intercambios
            formData={formData}
            onNext={nextStep} // 4. Avanza al paso 4
            onPrev={prevStep}
            onChange={updateFormData}
          />
        );
      case 4:
        return (
          <Step4DistribucionComidas
            formData={formData}
            onNext={() => {
              console.log('onNext del Step4 ejecutado');
              nextStep();
            }}
            onPrev={prevStep}
            onChange={updateFormData}
          />
        );
      case 5:  // Agregar este caso
      return (
        <Step5ResumenNutricional
          formData={formData}
          onPrev={prevStep}
          onFinish={() => {
            // Aquí puedes manejar la finalización del proceso
            console.log('Plan nutricional completado');
            // Opcional: resetear o redirigir
          }}
        />
      );
      default:
        return renderStep1();
    }
  };

  return (
    <div className="calculator-container">
      <div className="calculator-card">
        {/* 4. Actualizar la barra de progreso */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* 5. Actualizar los indicadores de pasos */}
        <div className="steps-indicator">
          <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}>
            1. Datos Básicos
          </div>
          <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}>
            2. Macronutrientes
          </div>
          <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}>
            3. Intercambios
          </div>
          <div className={`step-indicator ${currentStep >= 4 ? 'active' : ''}`}>
            4. Distribución Comidas
          </div>
          <div className={`step-indicator ${currentStep >= 5 ? 'active' : ''}`}>  {/* Agregar esta línea */}
            5. Resumen Final
          </div>

        </div>

        {/* Contenido del paso actual */}
        <div className="form-content">
          {renderCurrentStep()}
        </div>
      </div>

      {/* Tus estilos actuales + estilos adicionales */}
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

        * {
          box-sizing: border-box;
        }

        .calculator-container {
          max-width: 900px;
          margin: 2rem auto;
          padding: 0 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .calculator-card {
          background: var(--white);
          border-radius: var(--border-radius-large);
          box-shadow: var(--shadow-medium);
          overflow: hidden;
          border: 1px solid rgba(235, 146, 163, 0.1);
        }

        .progress-bar {
          height: 4px;
          background: var(--grayLight);
          position: relative;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--cheery), var(--accentSage));
          transition: width 0.5s ease;
        }

        .form-content {
          padding: 2rem;
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
          margin-bottom: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--grayDark);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .required {
          color: var(--cheery);
          font-weight: 700;
        }

        .button-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .option-button {
          padding: 1rem;
          border: 2px solid var(--grayMedium);
          background: var(--grayLight);
          color: var(--grayDark);
          border-radius: var(--border-radius);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .option-button:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-soft);
        }

        .option-button.active {
          border-color: var(--cheery);
          background: var(--cheery);
          color: var(--white);
          box-shadow: var(--shadow-soft);
        }

        .emoji {
          font-size: 1.2rem;
        }

        .dual-input {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-input {
          width: 100%;
          padding: 1rem;
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
          right: 1rem;
          color: var(--grayMedium);
          font-size: 0.9rem;
          font-weight: 600;
          pointer-events: none;
        }

        .form-select {
          width: 100%;
          padding: 1rem;
          border: 2px solid var(--grayMedium);
          background: var(--grayLight);
          color: var(--grayDark);
          border-radius: var(--border-radius);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .form-select:focus {
          outline: none;
          border-color: var(--irresistible);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(227, 192, 207, 0.1);
        }

        .results-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid rgba(235, 146, 163, 0.1);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          color: var(--grayDark);
        }

        .section-header.energy-header {
          color: var(--accentBlue);
          margin-top: 2rem;
        }

        .section-title {
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .result-card {
          background: var(--white);
          border: 2px solid var(--accentSage);
          border-radius: var(--border-radius);
          padding: 1.25rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .result-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-soft);
        }

        .result-card.imc-card {
          border-color: var(--accentBlue);
          background: linear-gradient(135deg, rgba(140, 175, 207, 0.05), var(--white));
        }

        .result-card.energy-card {
          border-color: var(--irresistible);
          background: linear-gradient(135deg, rgba(227, 192, 207, 0.05), var(--white));
        }

        .result-card.get-card {
          border-color: var(--cheery);
          background: linear-gradient(135deg, rgba(235, 146, 163, 0.05), var(--white));
          border-width: 3px;
        }

        .result-header {
          margin-bottom: 0.75rem;
        }

        .result-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--grayDark);
          margin: 0 0 0.25rem 0;
        }

        .result-description {
          font-size: 0.8rem;
          color: var(--grayMedium);
          font-weight: 500;
        }

        .result-value {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .result-value.primary .value-number {
          font-size: 2rem;
          color: var(--cheery);
        }

        .value-number {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--grayDark);
        }

        .value-unit {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--grayMedium);
        }

        .imc-classification {
          margin-top: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.8);
          text-align: center;
        }

        .get-note {
          margin-top: 0.75rem;
          font-size: 0.8rem;
          color: var(--cheery);
          font-weight: 600;
          text-align: center;
          padding: 0.5rem;
          background: rgba(235, 146, 163, 0.1);
          border-radius: 8px;
        }

        .activity-selector {
          grid-column: 1 / -1;
        }

        .footer-info {
          background: linear-gradient(135deg, var(--grayLight), rgba(235, 146, 163, 0.05));
          padding: 1.5rem;
          border-top: 1px solid rgba(235, 146, 163, 0.1);
        }

        .info-card {
          background: var(--white);
          border-radius: var(--border-radius);
          padding: 1.5rem;
          border-left: 4px solid var(--accentSage);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .info-card h4 {
          margin: 0 0 1rem 0;
          color: var(--grayDark);
          font-size: 1.1rem;
        }

        .info-card ul {
          margin: 0;
          padding-left: 1.25rem;
          color: var(--grayDark);
        }

        .info-card li {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          line-height: 1.4;
        }


        /* Responsive Design */
        @media (min-width: 769px) {
        .form-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr); /* 3 columnas iguales */
            gap: 2rem;
        }

          /* Género ocupa toda la fila */
        .form-group:nth-child(1) {
            grid-column: 1 / -1;
        }

        /* Peso, Talla y Edad se distribuyen en las 3 columnas */
        .form-group:nth-child(2),
        .form-group:nth-child(3),
        .form-group:nth-child(4) {
            grid-column: auto;
            }
        }

        .form-content {
            padding: 1.5rem;
        }

          .step-title {
            font-size: 1.6rem;
          }

          .step-subtitle {
            font-size: 1rem;
          }

          .icon-container {
            width: 60px;
            height: 60px;
          }

          .form-grid {
            grid-template-columns: 1fr !important;
            max-width: none !important;
          }
          
          .form-group:nth-child(1) { grid-area: auto !important; }
          .form-group:nth-child(2) { grid-area: auto !important; }
          .form-group:nth-child(3) { grid-area: auto !important; }
          .form-group:nth-child(4) { grid-area: auto !important; }

          .dual-input {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .button-grid {
            grid-template-columns: 1fr;
          }

          .results-grid {
            grid-template-columns: 1fr;
          }

          .result-card {
            padding: 1rem;
          }

          .value-number {
            font-size: 1.5rem;
          }

          .result-value.primary .value-number {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 480px) {
          .step-title {
            font-size: 1.4rem;
          }

          .form-input,
          .form-select {
            padding: 0.8rem;
          }

          .option-button {
            padding: 0.8rem;
            font-size: 0.9rem;
          }

          .result-card {
            padding: 0.8rem;
          }

          .footer-info,
          .info-card {
            padding: 1rem;
          }
        }

        /* Estilos adicionales para navegación */
        .step-navigation {
          margin-top: 2rem;
          text-align: center;
        }

        .next-step-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, var(--cheery), var(--irresistible));
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: var(--shadow-soft);
        }

        .next-step-button:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-medium);
        }

        .steps-indicator {
          display: flex;
          justify-content: center;
          gap: 2rem;
          padding: 1rem;
          background: var(--grayLight);
          margin-bottom: 1rem;
        }

        .step-indicator {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--grayMedium);
          transition: all 0.3s ease;
        }

        .step-indicator.active {
          background: linear-gradient(135deg, var(--cheery), var(--irresistible));
          color: var(--white);
          box-shadow: var(--shadow-soft);
        }

        @media (max-width: 768px) {
          .steps-indicator {
            flex-direction: column;
            gap: 0.5rem;
          }
          .step-indicator {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CalculadoraNutricional;