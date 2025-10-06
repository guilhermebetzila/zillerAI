'use client';

import React, { useState, useRef } from 'react';
import LayoutWrapper from '@components/LayoutWrapper';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, ImageIcon, DollarSign, Check } from 'lucide-react';

/**
 * Página de publicação de produtos para Ziller Store
 * - Formulário para mentores, traders e empresas subirem cursos, bots, relatórios e e-books
 * - Faz upload de imagens/arquivos para /api/upload (implementar server-side)
 * - Envia dados do produto para /api/store/products (implementar server-side)
 * - Mostra preview, validação e split automático (85% autor / 15% Ziller)
 *
 * BACKEND Endpoints necessários:
 * - POST /api/upload                 -> recebe arquivos (multipart/form-data) e retorna { url }
 * - POST /api/store/products         -> recebe JSON { title, description, price, type, files, authorId, split } e cria o produto
 * - (opcional) GET /api/store/my-products -> listar produtos do autor
 *
 * Observações de segurança:
 * - Autenticação/autorizações devem ser verificadas server-side (somente autores autenticados podem publicar)
 * - Valide tamanho/formatos de arquivos no servidor.
 */

type FileMeta = { name: string; url: string; type: string };

export default function ZillerStoreCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [productType, setProductType] = useState<'Curso' | 'Bot' | 'Relatório' | 'E-book' | 'Sinal'>('Curso');
  const [tags, setTags] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [assetFiles, setAssetFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filesMeta, setFilesMeta] = useState<FileMeta[]>([]);
  const [publishAsDraft, setPublishAsDraft] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // valores de split (podem ser parametrizados mais pra frente)
  const CREATOR_SHARE = 0.85; // 85%
  const ZILLER_SHARE = 0.15; // 15%

  function validate() {
    setError(null);
    if (!title.trim()) return 'Título é obrigatório.';
    if (!description.trim() || description.length < 30) return 'Descrição muito curta (mínimo 30 caracteres).';
    if (price === '' || Number(price) < 0) return 'Preço inválido.';
    if (!thumbnailFile) return 'Thumbnail (imagem) é obrigatória.';
    return null;
  }

  async function handleUploadFile(file: File, onProgress?: (p: number) => void) {
    // Faz upload do arquivo para /api/upload (server deve aceitar multipart/form-data)
    const fd = new FormData();
    fd.append('file', file);

    // Usamos fetch simples (sem progress nativo) - para progress real, usar XHR no servidor ou soluções específicas
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: fd,
    });

    if (!res.ok) {
      throw new Error('Falha no upload');
    }

    const json = await res.json();
    return json.url as string;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setUploading(true);
    setProgress(5);

    try {
      const uploaded: FileMeta[] = [];

      // 1) upload thumbnail
      if (thumbnailFile) {
        setProgress(10);
        const url = await handleUploadFile(thumbnailFile);
        uploaded.push({ name: thumbnailFile.name, url, type: 'thumbnail' });
        setProgress(30);
      }

      // 2) upload outros arquivos (assets) sequencialmente
      for (let i = 0; i < assetFiles.length; i++) {
        const f = assetFiles[i];
        const pctStart = 30 + Math.round((i / Math.max(1, assetFiles.length)) * 60);
        setProgress(pctStart);
        const url = await handleUploadFile(f);
        uploaded.push({ name: f.name, url, type: 'asset' });
        setProgress(pctStart + Math.round(60 / assetFiles.length));
      }

      setFilesMeta(uploaded);

      // 3) criar produto no backend
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        type: productType,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        files: uploaded,
        draft: Boolean(publishAsDraft),
        split: { creator: CREATOR_SHARE, ziller: ZILLER_SHARE },
        // authorId: (deve ser determinado server-side a partir da sessão/autenticação)
      };

      setProgress(92);
      const res = await fetch('/api/store/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Erro ao criar produto: ${txt}`);
      }

      const json = await res.json();
      setProgress(100);
      setSuccessMsg('Produto criado com sucesso!');
      // redireciona para página do produto (ex: /games/ziller-store/:id) se api retornar id
      if (json?.id) {
        setTimeout(() => router.push(`/games/ziller-store/${json.id}`), 900);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Erro desconhecido');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 bg-gray-950 shadow-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/games/ziller-store')} className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <h1 className="text-lg font-semibold ml-2">Publicar produto • Ziller Store</h1>
          </div>
          <div className="text-xs text-gray-400">Split: <strong>{Math.round(CREATOR_SHARE * 100)}% / {Math.round(ZILLER_SHARE * 100)}%</strong></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 flex justify-center">
          <div className="w-full max-w-3xl space-y-6">
            <form onSubmit={handleSubmit} className="bg-white/6 rounded-2xl p-6 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="text-xs text-gray-300">Título</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-300">Tipo</label>
                  <select value={productType} onChange={(e) => setProductType(e.target.value as any)} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 outline-none">
                    <option>Curso</option>
                    <option>Bot</option>
                    <option>Relatório</option>
                    <option>E-book</option>
                    <option>Sinal</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-gray-300">Descrição (mínimo 30 caracteres)</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 outline-none"></textarea>
                </div>

                <div>
                  <label className="text-xs text-gray-300">Preço (USD)</label>
                  <input type="number" value={price as any} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 outline-none" />
                </div>

                <div>
                  <label className="text-xs text-gray-300">Tags (separadas por vírgula)</label>
                  <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 outline-none" />
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-gray-300">Thumbnail (imagem) — JPEG/PNG</label>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-2 rounded-xl">
                      <ImageIcon className="w-4 h-4" /> Selecionar imagem
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0] || null; setThumbnailFile(f); }} />
                    </label>

                    {thumbnailFile ? (
                      <div className="flex items-center gap-2">
                        <img src={URL.createObjectURL(thumbnailFile)} alt="thumb" className="w-20 h-12 object-cover rounded-md" />
                        <div className="text-xs text-gray-300">{thumbnailFile.name}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">Nenhuma imagem selecionada</div>
                    )}

                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-gray-300">Arquivos do produto (ex: video MP4, ZIP do bot, PDF)</label>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-2 rounded-xl">
                      <UploadCloud className="w-4 h-4" /> Selecionar arquivos
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => { const files = Array.from(e.target.files || []); setAssetFiles((prev) => [...prev, ...files]); }} />
                    </label>

                    <div className="flex flex-col">
                      {assetFiles.length === 0 ? (
                        <div className="text-xs text-gray-400">Nenhum arquivo adicionado</div>
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          {assetFiles.map((f, i) => (
                            <div key={i} className="bg-white/5 px-2 py-1 rounded-md text-xs flex items-center gap-2">
                              <span className="truncate max-w-[150px]">{f.name}</span>
                              <button type="button" onClick={() => setAssetFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-red-400 text-xs">Remover</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={publishAsDraft} onChange={(e) => setPublishAsDraft(e.target.checked)} className="accent-green-500" />
                      <span className="text-xs text-gray-300">Salvar como rascunho</span>
                    </label>

                    <div className="text-xs text-gray-400">Split automático: <strong>{Math.round(CREATOR_SHARE * 100)}% autor / {Math.round(ZILLER_SHARE * 100)}% Ziller</strong></div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { setTitle(''); setDescription(''); setPrice(''); setTags(''); setThumbnailFile(null); setAssetFiles([]); setError(null); setSuccessMsg(null); }} className="px-3 py-2 rounded-xl bg-white/5">Limpar</button>
                    <button disabled={uploading} type="submit" className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700">
                      {uploading ? 'Enviando...' : 'Publicar produto'}
                    </button>
                  </div>
                </div>
              </div>

              {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
              {successMsg && <div className="mt-3 text-green-400 text-sm flex items-center gap-2"><Check className="w-4 h-4" /> {successMsg}</div>}

              {uploading && (
                <div className="mt-4">
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="h-2 bg-green-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-2">Progresso: {progress}%</div>
                </div>
              )}

            </form>

            {/* preview rápido */}
            <div className="bg-white/5 rounded-2xl p-4">
              <h3 className="font-semibold">Pré-visualização do produto</h3>
              <div className="mt-3 flex gap-4 items-start">
                <div className="w-28 h-20 bg-black/20 rounded-md flex items-center justify-center">
                  {thumbnailFile ? <img src={URL.createObjectURL(thumbnailFile)} className="w-full h-full object-cover rounded-md" alt="thumb" /> : <div className="text-xs text-gray-400">Thumbnail</div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{title || 'Título do produto'}</div>
                      <div className="text-xs text-gray-400">{productType} • {tags || 'Sem tags'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-400 font-bold">${price === '' ? '0.00' : Number(price).toFixed(2)}</div>
                      <div className="text-xs text-gray-300">Você recebe <strong>${price === '' ? '0.00' : (Number(price) * CREATOR_SHARE).toFixed(2)}</strong></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 mt-2 line-clamp-3">{description || 'Descrição do produto (pré-visualização)'}</p>
                </div>
              </div>
            </div>

            {/* arquivos enviados (metadados) */}
            {filesMeta.length > 0 && (
              <div className="bg-white/6 rounded-2xl p-4">
                <h4 className="font-semibold text-sm">Arquivos enviados</h4>
                <ul className="text-xs text-gray-300 mt-2 space-y-1">
                  {filesMeta.map((f, i) => (
                    <li key={i} className="truncate"><a href={f.url} target="_blank" rel="noreferrer" className="underline">{f.name}</a> • {f.type}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </main>

        <footer className="bg-gray-950 text-gray-400 text-center py-3 text-xs border-t border-white/10">
          © {new Date().getFullYear()} Ziller Store — Publicar produtos com curadoria e split automático
        </footer>
      </div>
    </LayoutWrapper>
  );
}
