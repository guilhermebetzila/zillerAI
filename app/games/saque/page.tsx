'use client';

import { useState, useEffect } from "react";
import LayoutWrapper from "../../../components/LayoutWrapper";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SaquePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState<"pix" | "usdt">("pix");
  const [sucesso, setSucesso] = useState(false);
  const [pix, setPix] = useState("");
  const [usdt, setUsdt] = useState("");
  const [saldo, setSaldo] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Buscar saldo apenas se autenticado
  const fetchSaldo = async () => {
    if (status !== "authenticated") return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/api/auth/usuario/saldo");
      
      if (res.data && typeof res.data.saldo === 'number') {
        setSaldo(res.data.saldo);
      } else {
        throw new Error("Resposta da API inválida");
      }
    } catch (err: any) {
      console.error("Erro ao buscar saldo:", err);
      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
        router.push("/auth/login");
      } else {
        setError("Erro ao carregar saldo. Tente novamente.");
      }
      setSaldo(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchSaldo();
    }
  }, [status]);

  // Salvar chave Pix ou carteira USDT
  const handleSalvarMetodo = async () => {
    try {
      if (metodo === "pix" && !pix.trim()) {
        alert("Digite sua chave Pix.");
        return;
      }
      if (metodo === "usdt" && !usdt.trim()) {
        alert("Digite sua carteira USDT (BEP-20).");
        return;
      }

      await axios.post("/api/auth/usuario/cadastrar-metodo", {
        metodo,
        valor: metodo === "pix" ? pix : usdt,
      });

      setInfo(`${metodo.toUpperCase()} cadastrado com sucesso!`);
      setTimeout(() => setInfo(null), 3000);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
        router.push("/auth/login");
      } else {
        setError("Erro ao cadastrar método de saque.");
      }
    }
  };

  // Solicitar saque
  const handleSaque = async () => {
    setError(null);

    const valorNumber = Number(valor);
    if (!valor || isNaN(valorNumber) || valorNumber <= 0) {
      setError("Digite um valor válido para sacar.");
      return;
    }

    if (valorNumber > saldo) {
      setError("Você não possui saldo suficiente para esse saque.");
      return;
    }

    try {
      await axios.post("/api/auth/usuario/saque", {
        valor: valorNumber,
        metodo,
      });
      setSucesso(true);
      await fetchSaldo(); // Atualiza saldo após saque
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
        router.push("/auth/login");
      } else {
        setError(err.response?.data?.message || "Erro ao solicitar saque.");
      }
    }
  };

  // Se não estiver autenticado, mostra loading
  if (status === "loading" || status === "unauthenticated") {
    return (
      <LayoutWrapper>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="bg-white p-6 rounded-2xl shadow-md text-black max-w-md mx-auto mt-6">
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

        {info && (
          <div className="bg-green-100 border border-green-300 text-green-800 p-3 rounded mb-4 text-sm">
            ✅ {info}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Carregando saldo...</p>
          </div>
        ) : sucesso ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-lg font-semibold text-green-600 mb-2">
              Parabéns! Saque concluído.
            </p>
            <p className="text-sm text-gray-700">
              Em até <span className="font-bold">60 minutos</span> será
              creditado em sua conta.
            </p>
            <button
              onClick={() => {
                setSucesso(false);
                setValor("");
              }}
              className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition"
            >
              Novo Saque
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-4">
              <button
                className={`flex-1 py-2 rounded-lg border transition-colors ${
                  metodo === "pix" 
                    ? "bg-blue-100 border-blue-400 font-bold text-blue-800" 
                    : "bg-gray-100 border-gray-300"
                }`}
                onClick={() => setMetodo("pix")}
              >
                Cadastrar Pix
              </button>
              <button
                className={`flex-1 py-2 rounded-lg border transition-colors ${
                  metodo === "usdt" 
                    ? "bg-blue-100 border-blue-400 font-bold text-blue-800" 
                    : "bg-gray-100 border-gray-300"
                }`}
                onClick={() => setMetodo("usdt")}
              >
                Cadastrar USDT
              </button>
            </div>

            {metodo === "pix" ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chave Pix
                </label>
                <input
                  type="text"
                  value={pix}
                  onChange={(e) => setPix(e.target.value)}
                  placeholder="Digite sua chave Pix"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSalvarMetodo}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition mt-2"
                >
                  Salvar Pix
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carteira USDT (BEP-20)
                </label>
                <input
                  type="text"
                  value={usdt}
                  onChange={(e) => setUsdt(e.target.value)}
                  placeholder="Digite sua carteira USDT"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSalvarMetodo}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition mt-2"
                >
                  Salvar USDT
                </button>
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
                placeholder={`Saldo disponível: R$ ${saldo.toFixed(2)}`}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
              <div className="text-xs text-gray-500 mt-1">
                Saldo disponível: R$ {saldo.toFixed(2)}
              </div>
            </div>

            <button
              onClick={handleSaque}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processando..." : "Sacar"}
            </button>
          </>
        )}
      </div>
    </LayoutWrapper>
  );
}