'use client';

import { useState, useEffect } from "react";
import LayoutWrapper from "../../../components/LayoutWrapper";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface MetodosCadastrados {
  pix: string;
  usdt: string;
}

interface Saque {
  id: number;
  valor: number;
  metodo: string;
  chave: string;
  status: string;
  criadoEm: string;
}

export default function SaquePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState<"pix" | "usdt">("pix");
  const [pix, setPix] = useState("");
  const [usdt, setUsdt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [metodosCadastrados, setMetodosCadastrados] = useState<MetodosCadastrados>({
    pix: "",
    usdt: ""
  });
  const [carregandoMetodos, setCarregandoMetodos] = useState(true);
  const [historicoSaques, setHistoricoSaques] = useState<Saque[]>([]);

  // Redirecionar se não estiver autenticado
  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  // Buscar métodos cadastrados e histórico
  useEffect(() => {
    const buscarDados = async () => {
      if (status !== "authenticated") return;
      
      try {
        setCarregandoMetodos(true);
        const [metodosResponse, saquesResponse] = await Promise.all([
          axios.get("/api/auth/usuario/metodos-saque"),
          axios.get("/api/auth/usuario/saque")
        ]);
        
        if (metodosResponse.data) {
          setMetodosCadastrados({
            pix: metodosResponse.data.pix || "",
            usdt: metodosResponse.data.usdt || ""
          });
          setPix(metodosResponse.data.pix || "");
          setUsdt(metodosResponse.data.usdt || "");
        }

        if (saquesResponse.data?.saques) {
          setHistoricoSaques(saquesResponse.data.saques);
        }
      } catch (err: any) {
        console.error("Erro ao buscar dados:", err);
        if (err.response?.status === 401) {
          router.push("/auth/login");
        }
      } finally {
        setCarregandoMetodos(false);
      }
    };

    if (status === "authenticated") {
      buscarDados();
    }
  }, [status, router]);

  // Se não estiver autenticado, mostra loading
  if (status === "loading") {
    return (
      <LayoutWrapper>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutWrapper>
    );
  }

  // Solicitar saque (abre WhatsApp)
  const handleSaque = () => {
    setError(null);

    const valorNumber = Number(valor);
    if (!valor || isNaN(valorNumber) || valorNumber <= 0) {
      setError("Digite um valor válido para sacar.");
      return;
    }

    const chaveAtual = metodo === "pix" ? metodosCadastrados.pix : metodosCadastrados.usdt;
    if (!chaveAtual) {
      setError(`Cadastre uma chave ${metodo.toUpperCase()} antes de solicitar o saque.`);
      return;
    }

    const userId = session?.user?.id || "N/A";
    const nome = session?.user?.name || "Usuário";
    const mensagem = `Olá, gostaria de solicitar um saque:%0A%0A🆔 ID: ${userId}%0A👤 Nome: ${nome}%0A💰 Valor: R$ ${valorNumber.toFixed(2)}%0A🏦 Método: ${metodo.toUpperCase()}%0A🔑 Chave: ${chaveAtual}`;

    const whatsappUrl = `https://wa.me/5521996528434?text=${mensagem}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto mt-6 space-y-6">
        {/* Formulário de Saque */}
        <div className="bg-white p-6 rounded-2xl shadow-md text-black">
          <h1 className="text-2xl font-bold mb-4">Solicitar Saque</h1>

          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-3 rounded mb-4 text-sm">
            Atenção: saques podem levar até{" "}
            <span className="font-semibold">60 minutos</span>.
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-4 mb-4">
            <button
              className={`flex-1 py-2 rounded-lg border transition-colors ${
                metodo === "pix" 
                  ? "bg-blue-100 border-blue-400 font-bold text-blue-800" 
                  : "bg-gray-100 border-gray-300"
              }`}
              onClick={() => setMetodo("pix")}
            >
              Usar Pix
            </button>
            <button
              className={`flex-1 py-2 rounded-lg border transition-colors ${
                metodo === "usdt" 
                  ? "bg-blue-100 border-blue-400 font-bold text-blue-800" 
                  : "bg-gray-100 border-gray-300"
              }`}
              onClick={() => setMetodo("usdt")}
            >
              Usar USDT
            </button>
          </div>

          {/* Métodos cadastrados */}
          {(metodosCadastrados.pix || metodosCadastrados.usdt) && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <h3 className="font-semibold text-sm mb-2">Métodos Cadastrados:</h3>
              {metodosCadastrados.pix && (
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">PIX:</span> {metodosCadastrados.pix}
                </p>
              )}
              {metodosCadastrados.usdt && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">USDT:</span> {metodosCadastrados.usdt}
                </p>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor do Saque
            </label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Digite o valor do saque"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>

          <button
            onClick={handleSaque}
            disabled={carregandoMetodos}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Solicitar via WhatsApp
          </button>
        </div>

        {/* Histórico de Saques */}
        {historicoSaques.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-md text-black">
            <h2 className="text-xl font-bold mb-4">Histórico de Saques</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-left">Data/Hora</th>
                    <th className="p-2 text-left">Valor</th>
                    <th className="p-2 text-left">Método</th>
                    <th className="p-2 text-left">Chave</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoSaques.map((saque) => (
                    <tr key={saque.id} className="border-b">
                      <td className="p-2">
                        {new Date(saque.criadoEm).toLocaleString('pt-BR')}
                      </td>
                      <td className="p-2">R$ {Number(saque.valor).toFixed(2)}</td>
                      <td className="p-2">{saque.metodo.toUpperCase()}</td>
                      <td className="p-2 text-xs font-mono">
                        {saque.chave.length > 20 
                          ? `${saque.chave.substring(0, 20)}...` 
                          : saque.chave
                        }
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          saque.status === 'concluido' 
                            ? 'bg-green-100 text-green-800'
                            : saque.status === 'pendente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : saque.status === 'rejeitado'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {saque.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
