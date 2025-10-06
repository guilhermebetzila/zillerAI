'use client';

import React, { useEffect, useState } from 'react';
import LayoutWrapper from '@components/LayoutWrapper';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Bell,
  Home,
  User,
  Wallet,
  Settings,
  LogOut,
  MessageCircle,
  Heart,
  Star,
  Menu,
  Send,
  X,
} from 'lucide-react';

interface Post {
  id: number;
  usuario: string;
  avatar: string;
  conteudo: string;
  likes: number;
  comentarios: number;
  timestamp: string;
  tipo: 'trader' | 'educador';
  destaqueIA?: boolean;
}

interface RankingItem {
  nome: string;
  pontos: number;
  avatar: string;
  tipo: 'trader' | 'educador';
  badges?: string[];
}

const POSTS_BATCH = 6;

export default function SocialFinancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'trader' | 'educador' | 'IA'>('all');
  const [newPost, setNewPost] = useState('');
  const [isRankingOpen, setIsRankingOpen] = useState(false);

  const user = session?.user as any;
  const displayName = user?.name || user?.email?.split('@')[0] || 'Ziler Anônimo';
  const userPhotoUrl = user?.image || '/img/avatar.png';

  // Simula posts
  const fetchPosts = async (pageNumber: number) => {
    await new Promise((r) => setTimeout(r, 200));
    const newPosts: Post[] = Array.from({ length: POSTS_BATCH }).map((_, idx) => ({
      id: pageNumber * POSTS_BATCH + idx + 1,
      usuario: `Trader ${pageNumber * POSTS_BATCH + idx + 1}`,
      avatar: '/img/avatar.png',
      conteudo: `Insight ou resultado da estratégia #${pageNumber * POSTS_BATCH + idx + 1}`,
      likes: Math.floor(Math.random() * 100),
      comentarios: Math.floor(Math.random() * 20),
      timestamp: new Date().toLocaleString(),
      tipo: Math.random() > 0.5 ? 'trader' : 'educador',
      destaqueIA: Math.random() < 0.18,
    }));
    return newPosts;
  };

  const fetchRanking = async () => {
    await new Promise((r) => setTimeout(r, 120));
    const topRanking: RankingItem[] = Array.from({ length: 8 }).map((_, idx) => ({
      nome: `Educador ${idx + 1}`,
      pontos: Math.floor(Math.random() * 2000),
      avatar: '/img/avatar.png',
      tipo: idx % 2 === 0 ? 'educador' : 'trader',
      badges: idx % 3 === 0 ? ['Top'] : undefined,
    }));
    return topRanking;
  };

  // Inicializa feed e ranking
  useEffect(() => {
    const init = async () => {
      const initialPosts = await fetchPosts(0);
      const rankingData = await fetchRanking();
      setPosts(initialPosts);
      setRanking(rankingData);
      setLoading(false);
    };
    init();
  }, []);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = async () => {
      if (!hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        const nextPage = page + 1;
        const newPosts = await fetchPosts(nextPage);
        if (!newPosts || newPosts.length === 0) {
          setHasMore(false);
          return;
        }
        setPosts((prev) => [...prev, ...newPosts]);
        setPage(nextPage);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore]);

  // Fecha ranking no ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsRankingOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Filtra posts
  const filteredPosts = posts.filter((post) => {
    if (filter === 'all') return true;
    if (filter === 'IA') return post.destaqueIA;
    return post.tipo === filter;
  });

  // Publicar novo post
  const handlePostSubmit = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: Date.now(),
      usuario: displayName,
      avatar: userPhotoUrl,
      conteudo: newPost,
      likes: 0,
      comentarios: 0,
      timestamp: new Date().toLocaleString(),
      tipo: 'trader',
    };
    setPosts((prev) => [post, ...prev]);
    setNewPost('');
  };

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen flex flex-col bg-gray-900 text-white overflow-x-hidden">
        {/* HEADER */}
        <header className="flex items-center justify-between px-4 py-3 bg-gray-950 shadow-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <img src={userPhotoUrl} alt="avatar" className="w-10 h-10 rounded-full border-2 border-green-500" />
            <div className="hidden sm:block">
              <p className="font-semibold">{displayName}</p>
              {session ? (
                <p className="text-xs text-gray-400">{user?.email}</p>
              ) : (
                <p className="text-xs text-gray-400 italic">Visitante - visualize o mural público</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/5521991146984"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-400 transition"
              aria-label="Suporte WhatsApp"
            >
              <MessageCircle className="w-6 h-6" />
            </a>
            <Bell className="w-6 h-6 hover:text-green-400 transition cursor-pointer" />
            <button
              onClick={() => setIsRankingOpen(true)}
              className="sm:hidden p-2 rounded hover:bg-white/5 transition"
              aria-label="Abrir ranking"
            >
              <Menu className="w-6 h-6" />
            </button>
            {session && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="hidden sm:inline-flex p-1 rounded hover:bg-white/5 transition"
                title="Sair"
              >
                <LogOut className="w-6 h-6 text-red-400" />
              </button>
            )}
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 w-full mt-4">
          <div className="w-full max-w-md mx-auto px-3">
            {/* Caixa de publicação */}
            {session && (
              <div className="bg-white/10 p-4 rounded-2xl mb-4 shadow-md">
                <textarea
                  className="w-full bg-transparent border border-white/20 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Compartilhe seu insight, resultado ou conquista..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={3}
                />
                <button
                  onClick={handlePostSubmit}
                  className="mt-2 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 transition text-black font-semibold py-2 rounded-xl w-full"
                >
                  <Send className="w-4 h-4" /> Publicar
                </button>
              </div>
            )}

            {/* Filtros */}
            <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-2">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'trader', label: 'Traders' },
                { key: 'educador', label: 'Educadores' },
                { key: 'IA', label: 'Destaque IA' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as any)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium ${
                    filter === (f.key as any) ? 'bg-green-500 text-black' : 'bg-white/10 text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* FEED */}
            <div className="flex flex-col gap-4 pb-24">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className={`p-4 rounded-2xl shadow-md ${
                    post.destaqueIA ? 'bg-green-600' : 'bg-white/10'
                  }`}
                >
                  <header className="flex items-center gap-3 mb-2">
                    <img src={post.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{post.usuario}</h4>
                        {post.destaqueIA && <Star className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <time className="text-xs text-gray-300">{post.timestamp}</time>
                    </div>
                  </header>
                  <p className="text-sm mb-3">{post.conteudo}</p>
                  <footer className="flex items-center gap-4 text-sm text-gray-200">
                    <button className="flex items-center gap-2 hover:text-red-400 transition">
                      <Heart className="w-5 h-5" /> <span>{post.likes}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span>💬</span> <span>{post.comentarios}</span>
                    </div>
                  </footer>
                </article>
              ))}
              {hasMore && <div className="text-center text-gray-400 mt-2">Carregando mais posts...</div>}
            </div>
          </div>
        </main>

        {/* Sidebar desktop */}
        <aside className="hidden sm:block fixed right-6 top-20 w-64 max-w-[22rem] z-30">
          <div className="bg-white/6 rounded-2xl p-3 shadow-lg backdrop-blur-sm">
            <h3 className="font-semibold text-lg mb-3">🏆 Ranking</h3>
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-2">
              {ranking.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-white/10 rounded-lg">
                  <img src={item.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.nome}</p>
                    <p className="text-xs text-gray-300 capitalize">{item.tipo}</p>
                    <div className="flex gap-1 mt-1">
                      {item.badges?.map((b, i) => (
                        <span key={i} className="text-[10px] bg-green-500 px-2 rounded">{b}</span>
                      ))}
                    </div>
                  </div>
                  <div className="font-bold text-sm">{item.pontos}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Drawer mobile */}
        <div
          className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
            isRankingOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsRankingOpen(false)}
        />
        <aside
          className={`fixed top-0 right-0 h-full w-[86%] max-w-xs bg-gray-950 z-50 transform transition-transform duration-300 shadow-2xl ${
            isRankingOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4 flex items-center justify-between border-b border-white/6">
            <h3 className="font-semibold text-lg">🏆 Ranking</h3>
            <button onClick={() => setIsRankingOpen(false)} className="p-1 rounded hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-3 overflow-y-auto h-full">
            {ranking.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white/6 rounded-lg">
                <img src={item.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.nome}</p>
                  <p className="text-xs text-gray-300 capitalize">{item.tipo}</p>
                </div>
                <div className="font-bold text-sm">{item.pontos}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* Footer mobile */}
        <footer className="fixed bottom-0 left-0 right-0 bg-gray-950 text-white py-2 px-4 flex justify-between items-center gap-2 z-40 shadow-inner sm:hidden">
          <button onClick={() => router.push('/dashboard')} className="flex flex-col items-center text-xs">
            <Home className="w-6 h-6" />
            <span>Painel</span>
          </button>
          <button onClick={() => router.push('/games/ia')} className="flex flex-col items-center text-xs">
            <Star className="w-6 h-6" />
            <span>IA</span>
          </button>
          <button onClick={() => router.push('/investir')} className="flex flex-col items-center -mt-3 bg-green-600 p-3 rounded-full shadow-lg">
            <Wallet className="w-6 h-6" />
          </button>
          <button onClick={() => router.push('/perfil')} className="flex flex-col items-center text-xs">
            <User className="w-6 h-6" />
            <span>Perfil</span>
          </button>
          <button onClick={() => router.push('/economia')} className="flex flex-col items-center text-xs">
            <Settings className="w-6 h-6" />
            <span>Eco</span>
          </button>
        </footer>
      </div>
    </LayoutWrapper>
  );
}
