import React from 'react';
import { motion } from 'motion/react';
import { Network, Target, Award } from 'lucide-react';

export const LandingAbout: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col space-y-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Nuestra Visión: Digitalizar la Piedra</h2>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
              ObraService nació en el corazón de grandes proyectos de infraestructura en España. Vimos de primera mano cómo el papel y la falta de coordinación entre contratas generaban millones de euros en sobrecostes y retrasos.
            </p>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              No somos solo un software; somos una <strong>red de confianza</strong>. Nuestro objetivo es que cada trabajador, cada m3 de hormigón y cada hora de maquinaria quede registrada de forma inmutable y transparente para todos los actores de la obra.
            </p>

            <div className="flex flex-col space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#FF6600]/10 rounded-xl">
                  <Target className="w-6 h-6 text-[#FF6600]" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Misión</h4>
                  <p className="text-sm text-slate-400">Eliminar la burocracia en obra.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#FF6600]/10 rounded-xl">
                  <Network className="w-6 h-6 text-[#FF6600]" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Red</h4>
                  <p className="text-sm text-slate-400">Conectar empresas, no solo usuarios.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80" 
                alt="Digital Engineering" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            {/* Stats overlay */}
            <div className="absolute -bottom-10 -left-10 p-8 bg-[#FF6600] rounded-2xl shadow-xl hidden md:block">
              <div className="text-4xl font-bold mb-1 text-white">+500k</div>
              <div className="text-white/80 font-medium">Partes Digitalizados</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
