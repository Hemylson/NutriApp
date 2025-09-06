import { useState } from 'react';

const Dietas = () => {
  const [dietas] = useState([
    {
      id: 1,
      nombre: "Dieta Corriente",
      descripcion: "Alimentación normal sin restricciones.",
      detalles: `
Apta para personas sin necesidades dietéticas especiales.

Indicado para: Personas sanas sin requerimientos nutricionales especiales.  
Alimentos restringidos: Ninguno.  
IDMA: 50% carbohidratos, 20% proteínas, 30% grasas.
      `,
      color: "#EB92A3" // cheery
    },
    {
      id: 2,
      nombre: "Dieta Líquidos Claros",
      descripcion: "Indicada en ayunos prolongados o postoperatorios inmediatos.",
      detalles: `
Incluye gelatina, té, jugos colados y caldos.

Indicado para: Pre y postoperatorios, procesos digestivos agudos.  
Alimentos restringidos: Grasas, fibras, lácteos.  
IDMA: Agua y trazas de CHO simples.
      `,
      color: "#E3C0CF" // irresistible
    },
    {
      id: 3,
      nombre: "Dieta Líquidos Completos",
      descripcion: "Suministro completo de nutrientes en forma líquida.",
      detalles: `
Incluye caldos, jugos, leches, sopas licuadas.

Indicado para: Dificultad para masticar/deglutir, estados postoperatorios.  
Alimentos restringidos: Alimentos sólidos.  
IDMA: 55% CHO, 20% proteína, 25% grasa.
      `,
      color: "#A8CFC2" // accentSage
    },
    {
      id: 4,
      nombre: "Dieta Mecánicamente Suave",
      descripcion: "Facilita la masticación y deglución.",
      detalles: `
Textura modificada: picado, molido o licuado.

Indicado para: Pacientes geriátricos o con disfunción neuromuscular.  
Alimentos restringidos: Duros, fibrosos o crujientes.  
IDMA: 50% CHO, 20% proteína, 30% grasa.
      `,
      color: "#8CAFCF" // accentBlue
    },
    {
      id: 5,
      nombre: "Dieta Hipercalórica",
      descripcion: "Alta en energía para cubrir requerimientos elevados.",
      detalles: `
Enriquecida con grasas y CHO.

Indicado para: Desnutrición, caquexia, quemaduras.  
Alimentos restringidos: Ninguno específico.  
IDMA: 55% CHO, 20% proteína, 25% grasa o mayor.
      `,
      color: "#F0BCC9" // inThePink
    },
    {
      id: 6,
      nombre: "Dieta Hipocalórica",
      descripcion: "Baja en calorías para promover pérdida de peso.",
      detalles: `
Control en CHO y grasas.

Indicado para: Sobrepeso y obesidad.  
Alimentos restringidos: Azúcares, grasas saturadas, frituras.  
IDMA: 45% CHO, 30% proteína, 25% grasa.
      `,
      color: "#EB92A3" // cheery
    }
  ]);

  return (
    <div className="dietas-container">
      <style jsx>{`
        .dietas-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .page-header {
          text-align: center;
          padding: 3rem 0;
          margin-bottom: 3rem;
          background: linear-gradient(135deg, #E3C0CF, #F0BCC9);
          border-radius: 20px;
          color: white;
        }

        .dietas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .dieta-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid #eee;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          position: relative;
        }

        .dieta-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: var(--card-color, #EB92A3);
          border-radius: 20px 20px 0 0;
        }

        .dieta-header h3 {
          color: #333;
          font-size: 1.4rem;
          font-weight: bold;
          margin-bottom: 0.8rem;
        }

        .dieta-descripcion {
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .dieta-detalles {
          white-space: pre-line;
          line-height: 1.6;
          font-size: 0.95rem;
          background: #f8f8f8;
          padding: 1rem;
          border-radius: 10px;
          border-left: 4px solid var(--card-color, #EB92A3);
        }
      `}</style>

      <section className="page-header">
        <h1>Clasificación de Dietas</h1>
        <p>Clasificación de distintos tipos de dietas</p>
      </section>

      <section className="dietas-grid">
        {dietas.map(dieta => (
          <article 
            key={dieta.id} 
            className="dieta-card"
            style={{ '--card-color': dieta.color }}
          >
            <div className="dieta-header">
              <h3>{dieta.nombre}</h3>
            </div>
            
            <p className="dieta-descripcion">{dieta.descripcion}</p>
            
            <div className="dieta-detalles">
              {dieta.detalles}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Dietas;
