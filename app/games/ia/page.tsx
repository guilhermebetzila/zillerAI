'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UsuarioComIndicados {
  id: number;
  nome: string | null;
  email: string;
  quantidadeDiretos: number;
  indicados: UsuarioComIndicados[];
}

interface UsuarioRede {
  id: number;
  nome: string;
  nivel: number;
  indicados: UsuarioRede[];
  aberto: boolean;
  quantidadeDiretos: number;
}

export default function RedePage() {
  const [rede, setRede] = useState<UsuarioRede | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    async function carregarRede() {
      try {
        const res = await fetch('/api/rede', {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Erro ao buscar rede');
        const data = await res.json();

        const usuario: UsuarioComIndicados = data.arvore;

        function converter(usuario: UsuarioComIndicados, nivel: number): UsuarioRede {
          return {
            id: usuario.id,
            nome: usuario.nome || "Sem Nome",
            quantidadeDiretos: usuario.quantidadeDiretos,
            nivel,
            aberto: nivel <= 1,
            indicados: usuario.indicados.map((ind) => converter(ind, nivel + 1)),
          };
        }

        if (usuario) {
          setRede(converter(usuario, 1));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    carregarRede();
  }, []);

  function toggleNode(node: UsuarioRede) {
    node.aberto = !node.aberto;
    setRede({ ...rede! });
  }

  const nivelColors = [
    'from-blue-700 to-blue-500',
    'from-purple-700 to-purple-500',
    'from-indigo-600 to-indigo-400',
    'from-teal-600 to-teal-400',
    'from-pink-600 to-pink-400',
    'from-yellow-500 to-yellow-300',
    'from-green-600 to-green-400',
    'from-orange-500 to-orange-300',
  ];

  function getGradient(nivel: number) {
    return nivelColors[nivel - 1] || 'from-gray-500 to-gray-300';
  }

  function renderNode(node: UsuarioRede) {
    const filhos = node.indicados.length;
    const spacing = Math.max(80, filhos * 20);

    return (
      <div key={node.id} className="relative flex flex-col items-center mt-4">
        <div
          className="flex items-center gap-2 cursor-pointer select-none z-10"
          onClick={() => toggleNode(node)}
        >
          {filhos > 0 && (
            <span className="text-white font-bold">{node.aberto ? '▼' : '▶'}</span>
          )}
          <div
            className={`bg-gradient-to-r ${getGradient(
              node.nivel
            )} text-white px-3 py-1 rounded-md shadow-lg hover:scale-105 transition transform text-sm md:text-base`}
          >
            {node.nome} ({node.quantidadeDiretos})
          </div>
        </div>

        <AnimatePresence>
          {node.aberto && filhos > 0 && (
            <motion.div
              key="children"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative flex mt-6 justify-center space-x-2 md:space-x-6"
              style={{ minHeight: "100px" }}
            >
              <svg
                className="absolute top-0 left-0 w-full h-8 md:h-10"
                style={{ pointerEvents: 'none' }}
              >
                {node.indicados.map((_, i) => {
                  const total = node.indicados.length;
                  const x = (i - (total - 1) / 2) * spacing;
                  return (
                    <path
                      key={i}
                      d={`M 0 0 C 0 15, ${x} 0, ${x} 30`}
                      stroke="white"
                      strokeWidth={2}
                      fill="transparent"
                    />
                  );
                })}

                {filhos > 1 && (
                  <path
                    d={(() => {
                      const startX = -(filhos - 1) / 2 * spacing;
                      const endX = (filhos - 1) / 2 * spacing;
                      return `M ${startX} 30 H ${endX}`;
                    })()}
                    stroke="white"
                    strokeWidth={2}
                    fill="transparent"
                  />
                )}
              </svg>

              {node.indicados.map((ind) => (
                <div key={ind.id} className="relative flex flex-col items-center">
                  {renderNode(ind)}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Mouse Pan
  function handleMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseUp() {
    isDragging.current = false;
  }

  // Touch Pan (mobile)
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 1) {
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isDragging.current = true;
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!isDragging.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function handleTouchEnd() {
    isDragging.current = false;
  }

  return (
    <div
      className="min-h-screen bg-transparent text-white p-4 md:p-6 overflow-hidden"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center text-purple-400">
        Minha Rede - Árvore Responsiva
      </h1>

      {/* Controle de Zoom */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <label htmlFor="zoom" className="text-purple-300 font-semibold">
          Zoom:
        </label>
        <input
          id="zoom"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="w-64 accent-purple-500"
        />
        <span className="text-purple-300">{(zoom * 100).toFixed(0)}%</span>
      </div>

      {carregando && (
        <p className="text-center text-blue-400">Carregando rede...</p>
      )}

      {!carregando && rede && (
        <div
          className="p-2 md:p-4 min-w-max flex justify-center"
          style={{
            minHeight: "150vh",
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center top",
            cursor: isDragging.current ? "grabbing" : "grab",
            touchAction: "none", // impede conflito com scroll do navegador
          }}
        >
          {renderNode(rede)}
        </div>
      )}

      {!carregando && !rede && (
        <p className="text-center text-purple-300">Nenhum membro encontrado.</p>
      )}
    </div>
  );
}
