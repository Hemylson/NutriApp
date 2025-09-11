import React, { useCallback, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';

const PDFExporter = ({
  datosPersonales = {},
  macros = {},
  mealPlan = {},
  mealTimes = {},
  intercambios = {},
  totalesNutricionales = {},
  getIntercambioName,
  safeParseFloat,
  className = '',
  onSuccess = () => {},
  onError = () => {}
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Utilidad segura para parsear números (usa safeParseFloat si está disponible)
  const safeNum = (v, fallback = 0) => {
    if (typeof safeParseFloat === 'function') {
      const parsed = safeParseFloat(v, fallback);
      const n = Number(parsed);
      return Number.isFinite(n) ? n : fallback;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  // Clasificación IMC robusta
  const getIMCClassification = (imc) => {
    const imcValue = safeNum(imc, null);
    if (imcValue === null || imcValue === undefined || isNaN(imcValue)) return { text: 'No disponible', color: '#CFCFCF' };
    if (imcValue < 18.5) return { text: 'Bajo peso', color: '#8CAFCF' };
    if (imcValue < 25) return { text: 'Peso normal', color: '#A8CFC2' };
    if (imcValue < 30) return { text: 'Sobrepeso', color: '#F0BCC9' };
    return { text: 'Obesidad', color: '#EB92A3' };
  };

  const createPDFContent = useCallback(() => {
    // Valores seguros / por defecto
    const datos = datosPersonales || {};
    const macrosObj = macros || {};
    const mealPlanObj = mealPlan || {};
    const mealTimesObj = mealTimes || {};
    const intercambiosObj = intercambios || {};
    const totales = totalesNutricionales || { totalCho: 0, totalChon: 0, totalCooh: 0, totalKcal: 0 };

    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const imcVal = (datos.imc !== undefined && datos.imc !== null && !isNaN(Number(datos.imc))) ? Number(datos.imc) : null;
    const imcDisplay = imcVal !== null ? `${imcVal.toFixed(1)} kg/m²` : '—';
    const imcClassification = getIMCClassification(imcVal);

    // Generar secciones de comidas de forma segura
    const mealSectionsHtml = Object.entries(mealTimesObj || {}).map(([mealId, meal]) => {
      const foods = Array.isArray(mealPlanObj[mealId]) ? mealPlanObj[mealId] : [];
      const foodsHtml = foods.length > 0
        ? `<ul class="food-list">${foods.map(food => `<li>${safeNum(food.quantity, 0)} intercambios de ${food.name || '—'}</li>`).join('')}</ul>`
        : `<p style="color:#999; font-style:italic;">Sin alimentos asignados</p>`;

      return `
        <div class="meal-section">
          <h3 class="meal-title">${(meal && meal.name) ? meal.name : mealId} <span class="meal-time">(${(meal && meal.time) ? meal.time : ''})</span></h3>
          ${foodsHtml}
        </div>
      `;
    }).join('');

    // Generar filas de intercambios con comprobaciones
    const intercambioRows = Object.entries(intercambiosObj || {}).map(([categoria, subcategorias]) => {
      if (!subcategorias || typeof subcategorias !== 'object') return '';
      return Object.entries(subcategorias).map(([subKey, data]) => {
        const count = safeNum(data?.intercambios, 0);
        if (count <= 0) return '';
        const cho = Math.round(safeNum(data?.cho, 0));
        const chon = Math.round(safeNum(data?.chon, 0));
        const cooh = Math.round(safeNum(data?.cooh, 0));
        const kcal = Math.round(safeNum(data?.kcal, 0));
        const nombre = (typeof getIntercambioName === 'function') ? getIntercambioName(categoria, subKey) : `${categoria} - ${subKey}`;
        return `
          <tr>
            <td>${nombre}</td>
            <td>${count}</td>
            <td>${cho}</td>
            <td>${chon}</td>
            <td>${cooh}</td>
            <td>${kcal}</td>
          </tr>
        `;
      }).join('');
    }).join('');

    // Valores macros con fallback para evitar undefined
    const proteinaPct = macrosObj.proteinasPorcentaje ?? '—';
    const proteinaG = macrosObj.proteinasGramos ?? 0;
    const proteinaKcal = macrosObj.proteinasKcal ?? 0;
    const carboPct = macrosObj.carbohidratosPorcentaje ?? '—';
    const carboG = macrosObj.carbohidratosGramos ?? 0;
    const carboKcal = macrosObj.carbohidratosKcal ?? 0;
    const grasaPct = macrosObj.grasasPorcentaje ?? '—';
    const grasaG = macrosObj.grasasGramos ?? 0;
    const grasaKcal = macrosObj.grasasKcal ?? 0;

    return `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; line-height: 1.6;">
        <style>
          body { margin: 0; padding: 20px; }
          .pdf-container { max-width: 800px; margin: 0 auto; position: relative; }
          .watermark {
            position: absolute;
            top: 20px;
            right: 20px; /* lo ubica a la derecha */
            font-size: 16px;
            font-style: italic;
            font-weight: bold;
            color: #ffa2baff;
            letter-spacing: 2px;
            pointer-events: none;
        }
          .pdf-header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #8CAFCF; padding-bottom: 20px; }
          .pdf-title { color: #8CAFCF; font-size: 30px; font-weight: 700; margin: 0 0 10px 0; }
          .pdf-subtitle { color: #777; font-size: 14px; margin: 0; }
          .section-title { color: #8CAFCF; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px; }
          .data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
          .data-card { border: 1px solid #e0e0e0; padding: 15px; border-radius: 10px; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
          .highlight-value { color: #8CAFCF; font-weight: bold; font-size: 18px; }
          .pdf-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          .pdf-table th { background-color: #8CAFCF; color: white; padding: 12px 8px; text-align: left; font-weight: bold; }
          .pdf-table td { border: 1px solid #ddd; padding: 10px 8px; text-align: left; }
          .pdf-table tbody tr:nth-child(even) { background-color: #f9f9f9; }
          .total-row { background-color: #8CAFCF !important; color: white !important; font-weight: bold; }
          .meal-title { color: #A8CFC2; font-size: 16px; font-weight: bold; margin-bottom: 10px; }
          .meal-time { color: #666; font-size: 14px; font-style: italic; }
          .food-list { margin: 10px 0; padding-left: 20px; }
          .macro-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
          .macro-card { text-align: center; padding: 20px; border-radius: 12px; color: white; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
          .macro-proteins { background: linear-gradient(135deg, #8CAFCF, #6c94bb); }
          .macro-carbs { background: linear-gradient(135deg, #A8CFC2, #85b6a9); }
          .macro-fats { background: linear-gradient(135deg, #F0BCC9, #e79dad); }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        </style>

        <div class="pdf-container">
          <div class="watermark">Hecho por Lesly Ayala</div>

          <div class="pdf-header">
            <h1 class="pdf-title">Plan Nutricional Personalizado</h1>
            <p class="pdf-subtitle">Generado el ${currentDate}</p>
          </div>

          <div class="pdf-section">
            <h2 class="section-title">Información Personal</h2>
            <div class="data-grid">
              <div class="data-card"><b>Género:</b> ${datos.genero ?? '—'}</div>
              <div class="data-card"><b>Edad:</b> ${datos.edad ?? '—'} años</div>
              <div class="data-card"><b>Peso:</b> ${datos.peso ?? '—'} kg</div>
              <div class="data-card"><b>Talla:</b> ${datos.talla ?? '—'} cm</div>
            </div>
          </div>

          <div class="pdf-section">
            <h2 class="section-title">Indicadores Antropométricos</h2>
            <div class="data-grid">
              <div class="data-card">
                <b>IMC:</b> <span class="highlight-value">${imcDisplay}</span>
                <div style="color: ${imcClassification?.color};">${imcClassification?.text}</div>
              </div>
              <div class="data-card"><b>Peso Ideal:</b> ${datos.pesoIdeal ?? '—'} kg</div>
              <div class="data-card"><b>GER:</b> ${datos.ger ?? '—'} kcal/día</div>
              <div class="data-card"><b>GET:</b> <span class="highlight-value">${datos.get ?? '—'} kcal/día</span></div>
            </div>
          </div>

          <div class="pdf-section">
            <h2 class="section-title">Distribución de Macronutrientes</h2>
            <div class="macro-summary">
              <div class="macro-card macro-proteins">
                <div>${proteinaPct}%</div>
                <div>Proteínas</div>
                <div>${proteinaG}g • ${proteinaKcal} kcal</div>
              </div>
              <div class="macro-card macro-carbs">
                <div>${carboPct}%</div>
                <div>Carbohidratos</div>
                <div>${carboG}g • ${carboKcal} kcal</div>
              </div>
              <div class="macro-card macro-fats">
                <div>${grasaPct}%</div>
                <div>Grasas</div>
                <div>${grasaG}g • ${grasaKcal} kcal</div>
              </div>
            </div>
          </div>

          <div class="pdf-section">
            <h2 class="section-title">Plan de Comidas Diario</h2>
            ${mealSectionsHtml}
          </div>

          <div class="pdf-section">
            <h2 class="section-title">Tabla Detallada de Intercambios</h2>
            <table class="pdf-table">
              <thead>
                <tr>
                  <th>Grupo</th><th>Intercambios</th><th>CHO</th><th>PROT</th><th>GRAS</th><th>KCAL</th>
                </tr>
              </thead>
              <tbody>
                ${intercambioRows}
                <tr class="total-row">
                  <td>TOTAL</td>
                  <td>-</td>
                  <td>${Math.round(safeNum(totales.totalCho, 0))}</td>
                  <td>${Math.round(safeNum(totales.totalChon, 0))}</td>
                  <td>${Math.round(safeNum(totales.totalCooh, 0))}</td>
                  <td>${Math.round(safeNum(totales.totalKcal, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Este plan nutricional ha sido generado de forma automatizada. Este programa fue hecho por Emilson Cossio.</p>
            <p>Hecho por Lesly Ayala.</p>
          </div>
        </div>
      </div>
    `;
  }, [datosPersonales, macros, mealPlan, mealTimes, intercambios, totalesNutricionales, getIntercambioName, safeParseFloat]);

  // Generar PDF (con limpieza garantizada del wrapper)
  const generatePDF = useCallback(async () => {
    setIsGenerating(true);
    let wrapper;
    try {
      // Import tolerante
      const mod = await import('html2pdf.js').catch(err => {
        console.error('html2pdf import error', err);
        throw err;
      });
      const html2pdf = mod?.default ?? mod;
      if (!html2pdf) throw new Error('No se pudo cargar html2pdf');

      wrapper = document.createElement('div');
      wrapper.innerHTML = createPDFContent();
      document.body.appendChild(wrapper);

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `plan-nutricional-${(datosPersonales.genero ?? 'paciente')}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      // html2pdf puede ser una función (la mayoría de builds lo son)
      const runner = (typeof html2pdf === 'function') ? html2pdf() : (html2pdf && html2pdf.default ? html2pdf.default() : null);
      if (runner && typeof runner.set === 'function') {
        await runner.set(opt).from(wrapper).save();
      } else if (typeof html2pdf === 'function') {
        // fallback
        await html2pdf().set(opt).from(wrapper).save();
      } else {
        throw new Error('html2pdf no está disponible en el formato esperado');
      }

      onSuccess('PDF generado exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      onError('Error al generar el PDF. ' + (error?.message ?? ''));
    } finally {
      // limpieza garantizada
      if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
      setIsGenerating(false);
    }
  }, [createPDFContent, datosPersonales.genero, onSuccess, onError]);

  return (
    <button
      className={`pdf-export-button ${className}`}
      onClick={generatePDF}
      disabled={isGenerating}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        backgroundColor: isGenerating ? '#ccc' : '#8CAFCF',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: isGenerating ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s ease'
      }}
    >
      {isGenerating ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Generando PDF...
        </>
      ) : (
        <>
          <FileText size={18} />
          Exportar PDF
        </>
      )}
    </button>
  );
};

export default PDFExporter;
