import React from 'react';
import { motion } from 'motion/react';
import { ClipboardList, FileSignature, FileOutput, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: ClipboardList,
    title: 'Registro de Jornada',
    description: 'El jefe de equipo o encargado registra personal, horas y maquinaria desde el móvil en el tajo.',
    color: 'bg-blue-500'
  },
  {
    icon: FileSignature,
    title: 'Validación Técnica',
    description: 'El encargado de la Contratista Principal recibe el parte, lo revisa y lo valida digitalmente.',
    color: 'bg-[#FF6600]'
  },
  {
    icon: FileOutput,
    title: 'Generación de Albarán',
    description: 'Al validar el parte, el sistema genera automáticamente el albarán digital listo para facturación.',
    color: 'bg-green-500'
  },
  {
    icon: CheckCircle2,
    title: 'Cierre de Ciclo',
    description: 'Ambas empresas tienen copia inmutable del dato, evitando errores de medición y retrasos en pagos.',
    color: 'bg-purple-500'
  }
];

export const LandingAppFlows: React.FC = () => {
  return (
    <section id="flows" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Flujo de Trabajo Digital</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Un ciclo cerrado que garantiza que el dato que nace en la obra sea el mismo que llega a contabilidad.
          </p>
        </div>

        <div className="relative">
          {/* Connector line (Desktop) */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform relative z-10`}>
                  <step.icon className="w-8 h-8 text-white" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#0F0F12] border border-white/10 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
