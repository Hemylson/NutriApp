import React, { useState, useEffect } from 'react';
import { Clock, Grid, Table, ChevronLeft, ChevronRight, Plus, Minus, Coffee, Sun, Moon, Sunset, AlertCircle, Target } from 'lucide-react';
import './Step4DistribucionComidas.css';

const Step4DistribucionComidas = ({
  formData = {},
  onNext = () => {},
  onPrev = () => {},
  onChange = () => {}
}) => {
  const [viewMode, setViewMode] = useState('cards');
  
  // Tiempos de comida predefinidos
  const mealTimes = {
    desayuno: { name: 'Desayuno', icon: Coffee, color: '#F0BCC9', time: '7:00 AM' },
    merienda1: { name: 'Media Mañana', icon: Sun, color: '#A8CFC2', time: '10:00 AM' },
    almuerzo: { name: 'Almuerzo', icon: Sun, color: '#8CAFCF', time: '12:30 PM' },
    merienda2: { name: 'Media Tarde', icon: Sunset, color: '#E3C0CF', time: '4:00 PM' },
    cena: { name: 'Cena', icon: Moon, color: '#EB92A3', time: '7:00 PM' }
  };

  // Mapear los grupos de alimentos desde los datos de intercambios
  const mapFoodGroups = () => {
    const intercambios = formData?.intercambios || {};
    const groups = [];
    
    // Lácteos
    if (intercambios.lacteos) {
      Object.entries(intercambios.lacteos).forEach(([key, data]) => {
        if (data.intercambios > 0) {
          const names = {
            descremados: 'Lácteos Descremados',
            semidescremados: 'Lácteos Semidescremados', 
            enteros: 'Lácteos Enteros'
          };
          groups.push({
            id: key,
            name: names[key] || key,
            totalIntercambios: data.intercambios,
            unit: 'intercambios'
          });
        }
      });
    }
    
    // Verduras
    if (intercambios.verduras?.verduras?.intercambios > 0) {
      groups.push({
        id: 'verduras',
        name: 'Verduras',
        totalIntercambios: intercambios.verduras.verduras.intercambios,
        unit: 'intercambios'
      });
    }
    
    // Frutas
    if (intercambios.frutas?.frutas?.intercambios > 0) {
      groups.push({
        id: 'frutas',
        name: 'Frutas',
        totalIntercambios: intercambios.frutas.frutas.intercambios,
        unit: 'intercambios'
      });
    }
    
    // Cereales
    if (intercambios.cereales) {
      Object.entries(intercambios.cereales).forEach(([key, data]) => {
        if (data.intercambios > 0) {
          const names = {
            panesCereales: 'Panes y Cereales',
            conGrasa: 'Cereales con Grasa',
            sinGrasa: 'Cereales sin Grasa'
          };
          groups.push({
            id: key,
            name: names[key] || key,
            totalIntercambios: data.intercambios,
            unit: 'intercambios'
          });
        }
      });
    }
    
    // Proteínas
    if (intercambios.proteinas) {
      Object.entries(intercambios.proteinas).forEach(([key, data]) => {
        if (data.intercambios > 0) {
          const names = {
            magra: 'Carne Magra',
            mediana: 'Carne Semigorda',
            alta: 'Carnes Gordas'
          };
          groups.push({
            id: key,
            name: names[key] || key,
            totalIntercambios: data.intercambios,
            unit: 'intercambios'
          });
        }
      });
    }
    
    // Grasas
    if (intercambios.grasas?.grasas?.intercambios > 0) {
      groups.push({
        id: 'grasas',
        name: 'Grasas',
        totalIntercambios: intercambios.grasas.grasas.intercambios,
        unit: 'intercambios'
      });
    }
    
    return groups;
  };

  const foodGroups = mapFoodGroups();

  // Inicializar distribución
  const initializeDistribution = () => {
    const distribution = {};
    foodGroups.forEach(food => {
      distribution[food.id] = {
        desayuno: 0,
        merienda1: 0, 
        almuerzo: 0,
        merienda2: 0,
        cena: 0,
        total: food.totalIntercambios
      };
    });
    
    // Mantener distribución existente si la hay
    const existing = formData?.distribucionComidas || {};
    Object.keys(existing).forEach(foodId => {
      if (distribution[foodId]) {
        distribution[foodId] = { ...distribution[foodId], ...existing[foodId] };
      }
    });
    
    return distribution;
  };

  const [distributionData, setDistributionData] = useState(initializeDistribution());

  // Calcular totales por comida
  const calculateMealTotals = () => {
    const totals = {};
    Object.keys(mealTimes).forEach(mealId => {
      totals[mealId] = foodGroups.reduce((sum, food) => {
        return sum + (distributionData[food.id]?.[mealId] || 0);
      }, 0);
    });
    return totals;
  };

  const mealTotals = calculateMealTotals();

  // Calcular porcentajes de adecuación
  const calculateAdequacyPercentages = () => {
    const totalIntercambios = Object.values(mealTotals).reduce((sum, val) => sum + val, 0);
    const percentages = {};
    
    Object.keys(mealTimes).forEach(mealId => {
      percentages[mealId] = totalIntercambios > 0 ? (mealTotals[mealId] / totalIntercambios) * 100 : 0;
    });
    
    return percentages;
  };

  const adequacyPercentages = calculateAdequacyPercentages();

  // Actualizar datos del formulario padre
  useEffect(() => {
    onChange({ distribucionComidas: distributionData });
  }, [distributionData, onChange]);

  // Manejar cambio en la distribución
  const handleDistributionChange = (foodId, mealId, delta) => {
    setDistributionData(prev => {
      const current = prev[foodId]?.[mealId] || 0;
      const newValue = Math.max(0, current + delta);
      const currentTotal = Object.keys(mealTimes).reduce((sum, meal) => {
        return sum + (meal === mealId ? newValue : (prev[foodId]?.[meal] || 0));
      }, 0);
      
      const maxTotal = foodGroups.find(f => f.id === foodId)?.totalIntercambios || 0;
      
      if (currentTotal <= maxTotal) {
        return {
          ...prev,
          [foodId]: {
            ...prev[foodId],
            [mealId]: newValue
          }
        };
      }
      return prev;
    });
  };

  // Validar si la distribución está completa
  const isValid = () => {
    return foodGroups.every(food => {
      const distributed = Object.keys(mealTimes).reduce((sum, mealId) => {
        return sum + (distributionData[food.id]?.[mealId] || 0);
      }, 0);
      return distributed === food.totalIntercambios;
    });
  };

  const getAdequacyColor = (percentage) => {
    if (percentage >= 15 && percentage <= 35) return '#4CAF50';
    if (percentage >= 10 && percentage <= 40) return '#FF9800'; 
    return '#F44336';
  };

  const renderMobileFriendlyCards = () => (
    <div className="cards-container">
      {/* Resumen por tiempo de comida */}
      <div className="summary-card">
        <h3 className="summary-title">
          <Clock className="summary-icon" />
          Resumen por Tiempo de Comida
        </h3>
        
        <div className="meal-summary-grid">
          {Object.entries(mealTimes).map(([mealId, meal]) => {
            const IconComponent = meal.icon;
            return (
              <div 
                key={mealId} 
                className="meal-summary-item"
                style={{ backgroundColor: meal.color }}
              >
                <IconComponent className="meal-icon" />
                <div className="meal-name">{meal.name}</div>
                <div className="meal-time">{meal.time}</div>
                <div className="meal-total">{mealTotals[mealId]} int.</div>
                <div className="meal-percentage">
                  {adequacyPercentages[mealId].toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cards por grupo de alimento */}
      {foodGroups.map((food) => {
        const distributed = Object.keys(mealTimes).reduce((sum, mealId) => {
          return sum + (distributionData[food.id]?.[mealId] || 0);
        }, 0);
        
        return (
          <div key={food.id} className="food-group-card">
            <div className="food-group-header">
              <h4 className="food-group-name">{food.name}</h4>
              <div className="food-group-total">
                Total: {distributed}/{food.totalIntercambios}
              </div>
            </div>
            
            <div className="meal-distribution-grid">
              {Object.entries(mealTimes).map(([mealId, meal]) => {
                const value = distributionData[food.id]?.[mealId] || 0;
                return (
                  <div 
                    key={mealId} 
                    className="meal-distribution-item"
                    style={{
                      backgroundColor: value > 0 ? meal.color : '#f5f5f5',
                      color: value > 0 ? 'white' : '#666'
                    }}
                  >
                    <div className="meal-distribution-name">{meal.name}</div>
                    <div className="meal-distribution-controls">
                      <button 
                        className="control-button"
                        onClick={() => handleDistributionChange(food.id, mealId, -1)}
                        disabled={value <= 0}
                      >
                        <Minus className="control-icon" />
                      </button>
                      <span className="value-display">{value}</span>
                      <button 
                        className="control-button"
                        onClick={() => handleDistributionChange(food.id, mealId, 1)}
                        disabled={distributed >= food.totalIntercambios}
                      >
                        <Plus className="control-icon" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {distributed !== food.totalIntercambios && (
              <div className="distribution-warning">
                Faltan por distribuir: {food.totalIntercambios - distributed} intercambios
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderTableView = () => (
    <div className="table-container">
      {/* Resumen de tiempos de comida */}
      <div className="table-meal-summary">
        {Object.entries(mealTimes).map(([mealId, meal]) => {
          const IconComponent = meal.icon;
          return (
            <div 
              key={mealId} 
              className="table-meal-summary-item"
              style={{ borderColor: meal.color }}
            >
              <div className="table-meal-summary-header">
                <IconComponent style={{ color: meal.color }} className="table-meal-icon" />
                <span className="table-meal-name">{meal.name}</span>
              </div>
              <div className="table-meal-time">{meal.time}</div>
              <div className="table-meal-total" style={{ color: meal.color }}>
                {mealTotals[mealId]} int.
              </div>
              <div 
                className="table-meal-adequacy"
                style={{ color: getAdequacyColor(adequacyPercentages[mealId]) }}
              >
                {adequacyPercentages[mealId].toFixed(1)}% adec.
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla principal */}
      <div className="table-wrapper">
        <table className="distribution-table">
          <thead>
            <tr>
              <th className="table-header-food">Grupo de Alimento</th>
              {Object.entries(mealTimes).map(([mealId, meal]) => {
                const IconComponent = meal.icon;
                return (
                  <th 
                    key={mealId} 
                    className="table-header-meal"
                    style={{ backgroundColor: meal.color }}
                  >
                    <div className="table-header-content">
                      <IconComponent className="table-header-icon" />
                      <span className="table-header-text">{meal.name}</span>
                      <span className="table-header-time">{meal.time}</span>
                    </div>
                  </th>
                );
              })}
              <th className="table-header-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {foodGroups.map((food, index) => {
              const distributed = Object.keys(mealTimes).reduce((sum, mealId) => {
                return sum + (distributionData[food.id]?.[mealId] || 0);
              }, 0);
              
              return (
                <tr 
                  key={food.id} 
                  className={`table-row ${index % 2 === 0 ? 'even' : 'odd'} ${distributed !== food.totalIntercambios ? 'incomplete' : ''}`}
                >
                  <td className="table-food-name">
                    <div>
                      {food.name}
                      <span className="food-total-info">({distributed}/{food.totalIntercambios})</span>
                    </div>
                  </td>
                  {Object.keys(mealTimes).map((mealId) => {
                    const value = distributionData[food.id]?.[mealId] || 0;
                    return (
                      <td key={mealId} className="table-meal-cell">
                        <div className="table-controls">
                          <button 
                            className="table-control-button"
                            onClick={() => handleDistributionChange(food.id, mealId, -1)}
                            disabled={value <= 0}
                          >
                            <Minus className="table-control-icon" />
                          </button>
                          <input
                            type="number"
                            value={value}
                            readOnly
                            className="table-value-input"
                          />
                          <button 
                            className="table-control-button"
                            onClick={() => handleDistributionChange(food.id, mealId, 1)}
                            disabled={distributed >= food.totalIntercambios}
                          >
                            <Plus className="table-control-icon" />
                          </button>
                        </div>
                      </td>
                    );
                  })}
                  <td className="table-total-cell">
                    <span className={distributed === food.totalIntercambios ? 'complete' : 'incomplete'}>
                      {distributed}/{food.totalIntercambios}
                    </span>
                  </td>
                </tr>
              );
            })}
            
            {/* Fila de totales */}
            <tr className="table-totals-row">
              <td className="table-totals-label">TOTAL POR COMIDA</td>
              {Object.keys(mealTimes).map((mealId) => (
                <td key={mealId} className="table-totals-value">
                  {mealTotals[mealId]}
                </td>
              ))}
              <td className="table-totals-grand">
                {Object.values(mealTotals).reduce((sum, val) => sum + val, 0)}
              </td>
            </tr>
            
            {/* Fila de porcentajes */}
            <tr className="table-adequacy-row">
              <td className="table-adequacy-label">% ADECUACIÓN</td>
              {Object.keys(mealTimes).map((mealId) => (
                <td 
                  key={mealId} 
                  className="table-adequacy-value"
                  style={{ color: getAdequacyColor(adequacyPercentages[mealId]) }}
                >
                  {adequacyPercentages[mealId].toFixed(1)}%
                </td>
              ))}
              <td className="table-adequacy-total">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  if (foodGroups.length === 0) {
    return (
      <div className="step4-container">
        <div className="no-data-message">
          <AlertCircle className="no-data-icon" />
          <h3>No hay intercambios para distribuir</h3>
          <p>Debe completar los pasos anteriores antes de continuar con la distribución de comidas.</p>
          <button onClick={onPrev} className="nav-button prev-button">
            <ChevronLeft className="nav-icon" />
            Volver al paso anterior
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="step4-container">
      {/* Header */}
      <div className="step4-header">
        <div className="icon-container">
          <Clock className="header-icon" />
        </div>
        <h2 className="step-title">Distribución de Tiempos de Comida</h2>
        <p className="step-subtitle">
          Distribuye tus intercambios a lo largo del día según tus horarios de comida
        </p>
      </div>

      {/* View Toggle */}
      <div className="view-toggle-container">
        <div className="view-toggle">
          <button
            onClick={() => setViewMode('cards')}
            className={`toggle-button ${viewMode === 'cards' ? 'active' : ''}`}
          >
            <Grid className="toggle-icon" />
            Vista Móvil
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`toggle-button ${viewMode === 'table' ? 'active' : ''}`}
          >
            <Table className="toggle-icon" />
            Vista Tabla
          </button>
        </div>
      </div>

      {/* Validation Status */}
      {!isValid() && (
        <div className="validation-alert">
          <AlertCircle className="alert-icon" />
          <div>
            <strong>Distribución incompleta:</strong> Algunos grupos de alimentos no han sido completamente distribuidos entre las comidas.
          </div>
        </div>
      )}

      {/* Content */}
      <div className="step4-content">
        {viewMode === 'cards' ? renderMobileFriendlyCards() : renderTableView()}
      </div>

      {/* Navigation */}
      <div className="navigation-buttons">
        <button onClick={onPrev} className="nav-button prev-button">
          <ChevronLeft className="nav-icon" />
          Anterior
        </button>
        
        <button 
          onClick={() => {
            console.log('Botón finalizar clickeado en Step4');
            console.log('isValid():', isValid());
            console.log('onNext función:', typeof onNext);
            if (isValid()) {
              console.log('Validación pasada, llamando onNext');
              onNext();
            } else {
              console.log('Validación falló');
            }
          }}
  disabled={!isValid()}
  className={`nav-button next-button ${!isValid() ? 'disabled' : ''}`}
>
  Finalizar
  <ChevronRight className="nav-icon" />
</button>
      </div>
    </div>
  );
};

export default Step4DistribucionComidas;