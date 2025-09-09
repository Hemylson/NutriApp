import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calculator, ChevronLeft, ChevronRight, Utensils, Search, Grid, Table, Target, Droplets } from 'lucide-react';

const Step3Intercambios = ({ 
  formData = {}, 
  onNext = () => {}, 
  onPrev = () => {}, 
  onChange = () => {}
}) => {
  const [viewMode, setViewMode] = useState('cards');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inicializar intercambios con valores por defecto
  const initializeIntercambios = useCallback(() => {
    const defaultIntercambios = {
      lacteos: {
        descremados: { intercambios: 0, cho: 0, chon: 0, cooh: 0, kcal: 0 },
        enteros: { intercambios: 0, cho: 0, chon: 0, cooh: 0, kcal: 0 },
        semidescremados: { intercambios: 0, cho: 0, chon: 0, cooh: 0, kcal: 0 }
      },
      frutas: {
        frutas: { intercambios: 0, cho: 0, chon: 0, cooh: 0, kcal: 0 }
      },
      cereales: {
        panesCereales: { intercambios: 0, cho: 0, chon: 0, cooh: 0, kcal: 0 }
      },
      proteinas: {
        magra: { intercambios: 0, cho: 0, chon: 0, cooh: 0, kcal: 0 },
        mediana: { intercambios: 0, cho: 0, chon: 0, cooh: 0, kcal: 0 },
        alta: { intercambios: 0, cho: 0, chon: 0, cooh: 0, kcal: 0 }
      },
      verduras: {
        verduras: { intercambios: 0, cho: 0, chon: 0, cooh: 0, kcal: 0 }
      },
      grasas: {
        grasas: { intercambios: 0, cho: 0, chon: 0, cooh: 0, kcal: 0 }
      }
    };

    // Combinar con datos existentes si los hay
    const existingData = formData?.intercambios || {};
    const mergedData = { ...defaultIntercambios };
    
    // Mantener valores existentes si están presentes
    Object.keys(existingData).forEach(categoria => {
      if (mergedData[categoria]) {
        Object.keys(existingData[categoria]).forEach(subcategoria => {
          if (mergedData[categoria][subcategoria]) {
            mergedData[categoria][subcategoria] = {
              ...mergedData[categoria][subcategoria],
              ...existingData[categoria][subcategoria]
            };
          }
        });
      }
    });

    return mergedData;
  }, [formData?.intercambios]);

  const [intercambios, setIntercambios] = useState(initializeIntercambios);

  // Obtener datos de pasos anteriores con valores por defecto seguros
  const totalCalories = parseInt(formData.get) || 2000;
  const macros = formData.macros || {};
  const metaProteinas = parseInt(macros.proteinasGramos) || 150;
  const metaCarbohidratos = parseInt(macros.carbohidratosGramos) || 250;
  const metaGrasas = parseInt(macros.grasasGramos) || 67;

  // Categorías de alimentos con sus iconos y colores
  const categorias = {
    lacteos: { 
      nombre: 'Lácteos', 
      icon: '🥛', 
      color: '#EB92A3', 
      bgColor: 'rgba(235, 146, 163, 0.1)',
      subcategorias: {
        descremados: 'Leche Descremada',
        semidescremados: 'Leche Semidescremada',
        enteros: 'Leche Entera'
      }
    },
    verduras: { 
      nombre: 'Verduras', 
      icon: '🥬', 
      color: '#A8CFC2', 
      bgColor: 'rgba(168, 207, 194, 0.1)',
      subcategorias: {
        verduras: 'Verduras'
      }
    },
    frutas: { 
      nombre: 'Frutas', 
      icon: '🍎', 
      color: '#F0BCC9', 
      bgColor: 'rgba(240, 188, 201, 0.1)',
      subcategorias: {
        frutas: 'Frutas'
      }
    },
    cereales: { 
      nombre: 'Panes y Cereales', 
      icon: '🌾', 
      color: '#8CAFCF', 
      bgColor: 'rgba(140, 175, 207, 0.1)',
      subcategorias: {
        panesCereales: 'Panes y Cereales'
      }
    },
    proteinas: { 
      nombre: 'Proteínas', 
      icon: '🥩', 
      color: '#E3C0CF', 
      bgColor: 'rgba(227, 192, 207, 0.1)',
      subcategorias: {
        magra: 'Carne Magra',
        mediana: 'Carne Semigorda',
        alta: 'Carnes Gordas'
      }
    },
    grasas: { 
      nombre: 'Grasas', 
      icon: '🫒',
      color: '#DDA0DD', 
      bgColor: 'rgba(221, 160, 221, 0.1)',
      subcategorias: {
        grasas: 'Grasas'
      }
    }
  };

  // Valores unitarios por intercambio
  const getValorUnitario = (categoria, subcategoria) => {
    const valores = {
      lacteos: {
        descremados: { cho: 12, chon: 8, cooh: 0, kcal: 80 },
        semidescremados: { cho: 12, chon: 8, cooh: 4, kcal: 120 },
        enteros: { cho: 12, chon: 8, cooh: 8, kcal: 160 }
      },
      verduras: {
        verduras: { cho: 5, chon: 2, cooh: 0, kcal: 25 }
      },
      frutas: {
        frutas: { cho: 15, chon: 0, cooh: 0, kcal: 60 }
      },
      cereales: {
        panesCereales: { cho: 15, chon: 3, cooh: 2, kcal: 90 }
      },
      proteinas: {
        magra: { cho: 0, chon: 7, cooh: 3, kcal: 55 },
        mediana: { cho: 0, chon: 7, cooh: 5, kcal: 75 },
        alta: { cho: 0, chon: 7, cooh: 8, kcal: 95 }
      },
      grasas: {
        grasas: { cho: 0, chon: 0, cooh: 5, kcal: 45 }
      }
    };
    
    return valores[categoria]?.[subcategoria] || { cho: 0, chon: 0, cooh: 0, kcal: 0 };
  };

  // Calcular totales
  const calcularTotales = useCallback(() => {
    let totalCho = 0, totalChon = 0, totalCooh = 0, totalKcal = 0;
    
    Object.values(intercambios).forEach(categoria => {
      Object.values(categoria).forEach(item => {
        totalCho += item.cho || 0;
        totalChon += item.chon || 0;
        totalCooh += item.cooh || 0;
        totalKcal += item.kcal || 0;
      });
    });
    
    return { totalCho, totalChon, totalCooh, totalKcal };
  }, [intercambios]);

  const totales = calcularTotales();

  // Calcular precisión respecto a las metas
  const calcularPrecision = useCallback(() => {
    const precisionProteinas = metaProteinas > 0 ? (totales.totalChon / metaProteinas) * 100 : 0;
    const precisionCarbohidratos = metaCarbohidratos > 0 ? (totales.totalCho / metaCarbohidratos) * 100 : 0;
    const precisionGrasas = metaGrasas > 0 ? (totales.totalCooh / metaGrasas) * 100 : 0;
    const precisionCalorias = totalCalories > 0 ? (totales.totalKcal / totalCalories) * 100 : 0;
    
    return {
      proteinas: precisionProteinas,
      carbohidratos: precisionCarbohidratos,
      grasas: precisionGrasas,
      calorias: precisionCalorias,
      promedio: (precisionProteinas + precisionCarbohidratos + precisionGrasas + precisionCalorias) / 4
    };
  }, [totales, metaProteinas, metaCarbohidratos, metaGrasas, totalCalories]);

  const precision = calcularPrecision();

  const handleIntercambioChange = (categoria, subcategoria, value) => {
    // Permitir vacío y solo números enteros hasta 99
    if (value === '' || (/^\d{1,2}$/.test(value) && parseInt(value) <= 99)) {
      const newValue = value === '' ? 0 : parseInt(value);
      const valorUnitario = getValorUnitario(categoria, subcategoria);

      const nuevoIntercambio = {
        intercambios: newValue,
        cho: valorUnitario.cho * newValue,
        chon: valorUnitario.chon * newValue,
        cooh: valorUnitario.cooh * newValue,
        kcal: valorUnitario.kcal * newValue
      };

      setIntercambios(prev => ({
        ...prev,
        [categoria]: {
          ...prev[categoria],
          [subcategoria]: nuevoIntercambio
        }
      }));
    }
  };

  // Actualizar datos del formulario padre
  useEffect(() => {
    onChange({ intercambios, totalesNutricionales: totales });
  }, [intercambios, totales, onChange]);

  // Filtrar categorías según búsqueda
  const categoriasFiltradas = Object.entries(categorias).filter(([key, categoria]) => 
    categoria.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Object.values(categoria.subcategorias).some(sub => 
      sub.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const isValid = () => {
    return precision.promedio >= 85 && precision.promedio <= 115;
  };

  const getPrecisionColor = (precisionValue) => {
    if (precisionValue >= 85 && precisionValue <= 115) return '#4CAF50';
    if (precisionValue >= 70 && precisionValue <= 130) return '#FF9800';
    return '#F44336';
  };

  const renderNutritionValue = (value, type) => {
    const typeColors = {
      cho: '#F0BCC9',
      chon: '#A8CFC2', 
      cooh: '#8CAFCF',
      kcal: '#EB92A3'
    };
    
    const typeLabels = {
      cho: 'CHO',
      chon: 'PROT',
      cooh: 'GRAS',
      kcal: 'KCAL'
    };
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px',
        backgroundColor: typeColors[type],
        borderRadius: '8px',
        minWidth: '50px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '12px'
      }}>
        <span style={{ fontSize: '14px' }}>{Math.round(value)}</span>
        <span style={{ fontSize: '10px', opacity: 0.8 }}>
          {type === 'kcal' ? 'kcal' : 'g'}
        </span>
      </div>
    );
  };

  // Ref para el resumen nutricional
  const resumenRef = useRef(null);

  // Handler para scroll al resumen
  const scrollToResumen = () => {
    if (resumenRef.current) {
      resumenRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderCardView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Resumen de Metas */}
      <div 
        ref={resumenRef}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e3e3e3'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <Target style={{ width: '24px', height: '24px', color: '#666' }} />
          <h3 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Resumen Nutricional</h3>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {Math.round(totales.totalKcal)}
            </div>
            <div style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Total kcal</div>
            <div style={{ fontSize: '12px', color: '#888' }}>Meta: {totalCalories}</div>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: getPrecisionColor(precision.calorias),
              marginTop: '4px'
            }}>
              {precision.calorias.toFixed(1)}%
            </div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {Math.round(totales.totalCho)}g
            </div>
            <div style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Carbohidratos</div>
            <div style={{ fontSize: '12px', color: '#888' }}>Meta: {metaCarbohidratos}g</div>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: getPrecisionColor(precision.carbohidratos),
              marginTop: '4px'
            }}>
              {precision.carbohidratos.toFixed(1)}%
            </div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {Math.round(totales.totalChon)}g
            </div>
            <div style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Proteínas</div>
            <div style={{ fontSize: '12px', color: '#888' }}>Meta: {metaProteinas}g</div>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: getPrecisionColor(precision.proteinas),
              marginTop: '4px'
            }}>
              {precision.proteinas.toFixed(1)}%
            </div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {Math.round(totales.totalCooh)}g
            </div>
            <div style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Grasas</div>
            <div style={{ fontSize: '12px', color: '#888' }}>Meta: {metaGrasas}g</div>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: getPrecisionColor(precision.grasas),
              marginTop: '4px'
            }}>
              {precision.grasas.toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: isValid() ? '#e8f5e8' : '#fff3cd',
          border: `2px solid ${isValid() ? '#4CAF50' : '#FF9800'}`
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#333' }}>
            Precisión General: {precision.promedio.toFixed(1)}%
          </div>
          <div style={{
            fontSize: '14px',
            color: isValid() ? '#4CAF50' : '#FF9800',
            marginTop: '4px'
          }}>
            {isValid() ? '✅ Dentro del rango óptimo' : '⚠️ Requiere ajustes'}
          </div>
        </div>
      </div>

      {/* Cards de Categorías */}
      {categoriasFiltradas.map(([categoriaKey, categoria]) => (
        <div 
          key={categoriaKey} 
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: `2px solid ${categoria.color}`
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: categoria.bgColor,
            borderRadius: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: categoria.color,
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              <span style={{ fontSize: '24px' }}>{categoria.icon}</span>
              {categoria.nombre}
            </div>
            <div style={{
              backgroundColor: categoria.color,
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {Math.round(Object.values(intercambios[categoriaKey] || {}).reduce((sum, item) => sum + (item.kcal || 0), 0))} kcal
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            {Object.entries(categoria.subcategorias).map(([subKey, subNombre]) => {
              const item = intercambios[categoriaKey]?.[subKey] || { intercambios: 0, cho: 0, chon: 0, cooh: 0, kcal: 0 };
              return (
                <div 
                  key={subKey} 
                  style={{
                    border: '1px solid #e3e3e3',
                    borderRadius: '12px',
                    padding: '16px',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '16px',
                      color: '#333',
                      flex: '1',
                      minWidth: '150px'
                    }}>{subNombre}</h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flex: 'none'
                    }}>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={item.intercambios || ''}
                        onChange={(e) => handleIntercambioChange(categoriaKey, subKey, e.target.value)}
                        style={{
                          width: '60px',
                          padding: '8px',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '16px',
                          textAlign: 'center',
                          backgroundColor: 'white'
                        }}
                        placeholder="0"
                      />
                      <span style={{ fontSize: '14px', color: '#666' }}>intercambios</span>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                    gap: '8px'
                  }}>
                    {renderNutritionValue(item.cho || 0, 'cho')}
                    {renderNutritionValue(item.chon || 0, 'chon')}
                    {renderNutritionValue(item.cooh || 0, 'cooh')}
                    {renderNutritionValue(item.kcal || 0, 'kcal')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflowX: 'auto'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '600px'
      }}>
        <thead>
          <tr>
            <th style={{
              padding: '12px',
              textAlign: 'left',
              backgroundColor: '#f8f9fa',
              border: '1px solid #ddd',
              fontWeight: 'bold'
            }}>Grupo de Alimento</th>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              border: '1px solid #ddd',
              fontWeight: 'bold'
            }}>Intercambios</th>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              backgroundColor: '#F0BCC9',
              border: '1px solid #ddd',
              color: 'white',
              fontWeight: 'bold'
            }}>CHO (g)</th>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              backgroundColor: '#A8CFC2',
              border: '1px solid #ddd',
              color: 'white',
              fontWeight: 'bold'
            }}>CHON (g)</th>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              backgroundColor: '#8CAFCF',
              border: '1px solid #ddd',
              color: 'white',
              fontWeight: 'bold'
            }}>COOH (g)</th>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              backgroundColor: '#EB92A3',
              border: '1px solid #ddd',
              color: 'white',
              fontWeight: 'bold'
            }}>KCAL</th>
          </tr>
        </thead>
        <tbody>
          {categoriasFiltradas.map(([categoriaKey, categoria]) => (
            <React.Fragment key={categoriaKey}>
              <tr style={{ backgroundColor: categoria.bgColor }}>
                <td style={{
                  padding: '12px',
                  fontWeight: 'bold',
                  color: categoria.color,
                  border: '1px solid #ddd'
                }}>
                  {categoria.icon} {categoria.nombre.toUpperCase()}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>-</td>
                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>-</td>
                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>-</td>
                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>-</td>
                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>-</td>
              </tr>
              {Object.entries(categoria.subcategorias).map(([subKey, subNombre]) => {
                const item = intercambios[categoriaKey]?.[subKey] || { intercambios: 0, cho: 0, chon: 0, cooh: 0, kcal: 0 };
                return (
                  <tr key={subKey} style={{ backgroundColor: 'white' }}>
                    <td style={{
                      padding: '12px',
                      border: '1px solid #ddd',
                      paddingLeft: '24px'
                    }}>{subNombre}</td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid #ddd'
                    }}>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={item.intercambios || ''}
                        onChange={(e) => handleIntercambioChange(categoriaKey, subKey, e.target.value)}
                        style={{
                          width: '60px',
                          padding: '6px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontSize: '14px'
                        }}
                        placeholder="0"
                      />
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid #ddd',
                      fontWeight: 'bold'
                    }}>{Math.round(item.cho || 0)}</td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid #ddd',
                      fontWeight: 'bold'
                    }}>{Math.round(item.chon || 0)}</td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid #ddd',
                      fontWeight: 'bold'
                    }}>{Math.round(item.cooh || 0)}</td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid #ddd',
                      fontWeight: 'bold'
                    }}>{Math.round(item.kcal || 0)}</td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
          <tr style={{
            backgroundColor: '#333',
            color: 'white',
            fontWeight: 'bold'
          }}>
            <td style={{
              padding: '12px',
              border: '1px solid #333',
              fontWeight: 'bold'
            }}>TOTAL</td>
            <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #333' }}>-</td>
            <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #333' }}>
              {Math.round(totales.totalCho)}
            </td>
            <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #333' }}>
              {Math.round(totales.totalChon)}
            </td>
            <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #333' }}>
              {Math.round(totales.totalCooh)}
            </td>
            <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #333' }}>
              {Math.round(totales.totalKcal)}
              </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          backgroundColor: '#EB92A3', // Cambiado a rosa pastel
          borderRadius: '50%',
          marginBottom: '16px'
        }}>
          <Utensils style={{ width: '40px', height: '40px', color: 'white' }} />
        </div>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#333',
          margin: '0 0 8px 0'
        }}>Tabla de Intercambios</h2>
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: 0,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Ajusta los intercambios por grupo de alimentos para alcanzar tus metas nutricionales
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          position: 'relative',
          flex: '1',
          minWidth: '250px',
          maxWidth: '400px'
        }}>
          <Search style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            color: '#666'
          }} />
          <input
            type="text"
            placeholder="Buscar grupo de alimentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: '2px solid #ddd',
              borderRadius: '12px',
              fontSize: '16px',
              backgroundColor: 'white',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{
          display: 'flex',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '4px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <button
            onClick={() => setViewMode('cards')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: viewMode === 'cards' ? '#F0BCC9' : 'transparent', // Rosa pastel
              color: viewMode === 'cards' ? 'white' : '#666',
              transition: 'all 0.2s'
            }}
          >
            <Grid style={{ width: '16px', height: '16px' }} />
            Tarjetas
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: viewMode === 'table' ? '#8CAFCF' : 'transparent', // Azul pastel
              color: viewMode === 'table' ? 'white' : '#666',
              transition: 'all 0.2s'
            }}
          >
            <Table style={{ width: '16px', height: '16px' }} />
            Tabla
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginBottom: '40px' }}>
        {viewMode === 'cards' ? renderCardView() : renderTableView()}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginTop: '32px'
      }}>
        <button 
          onClick={onPrev}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#f8f9fa',
            border: '2px solid #ddd',
            borderRadius: '12px',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#333',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#e9ecef';
            e.target.style.borderColor = '#adb5bd';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.borderColor = '#ddd';
          }}
        >
          <ChevronLeft style={{ width: '20px', height: '20px' }} />
          Anterior
        </button>
        
        <button 
          onClick={onNext}
          disabled={!isValid()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: isValid() ? '#EB92A3' : '#ccc', // Rosa pastel
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            cursor: isValid() ? 'pointer' : 'not-allowed',
            color: 'white',
            transition: 'all 0.2s',
            opacity: isValid() ? 1 : 0.6
          }}
          onMouseOver={(e) => {
            if (isValid()) {
              e.target.style.backgroundColor = '#F0BCC9'; // Más claro al pasar el mouse
            }
          }}
          onMouseOut={(e) => {
            if (isValid()) {
              e.target.style.backgroundColor = '#EB92A3';
            }
          }}
        >
          Finalizar
          <ChevronRight style={{ width: '20px', height: '20px' }} />
        </button>
      </div>

      {/* Botón flotante scroll arriba (solo móvil) */}
      <button
        onClick={scrollToResumen}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          width: '56px',
          height: '56px',
          backgroundColor: '#EB92A3', // Rosa pastel
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: window.innerWidth <= 768 ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#F0BCC9';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#EB92A3';
          e.target.style.transform = 'scale(1)';
        }}
        title="Ir al resumen nutricional"
      >
        ⬆
      </button>
    </div>
  );
};

export default Step3Intercambios;