'use client';

import React, { useEffect, useState, useRef } from 'react';
import LayoutWrapper from '@components/LayoutWrapper';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Bell, Home, User, Wallet, Settings, LogOut, MessageCircle, Heart, Star } from 'lucide-react';

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

const POSTS_BATCH = 5;

export default function SocialFinancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const [filter, setFilter] = useState<'all' | 'trader' | 'educador' | 'IA'>('all');

  const user = session?.user as any;
  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuário';
  const userPhotoUrl = user?.image || '/img/avatar.png';

  const fetchPosts = async (pageNumber: number) => {
    const newPosts: Post[] = Array.from({ length: POSTS_BATCH }).map((_, idx) => ({
      id: pageNumber * POSTS_BATCH + idx + 1,
      usuario: `Trader ${pageNumber * POSTS_BATCH + idx + 1}`,
      avatar: '/img/avatar.png',
      conteudo: `Insight ou resultado da estratégia #${pageNumber * POSTS_BATCH + idx + 1}`,
      likes: Math.floor(Math.random() * 100),
      comentarios: Math.floor(Math.random() * 20),
      timestamp: new Date().toLocaleString(),
      tipo: Math.random() > 0.5 ? 'trader' : 'educador',
      destaqueIA: Math.random() < 0.2,
    }));
    return newPosts;
  };

  const fetchRanking = async () => {
    const topRanking: RankingItem[] = Array.from({ length: 5 }).map((_, idx) => ({
      nome: `Educador ${idx + 1}`,
      pontos: Math.floor(Math.random() * 1000),
      avatar: '/img/avatar.png',
      tipo: idx % 2 === 0 ? 'educador' : 'trader',
      badges: idx % 2 === 0 ? ['Top Educador'] : ['Top Trader'],
    }));
    return topRanking;
  };

  useEffect(() => {
    if (status === 'authenticated') {
      const init = async () => {
        const initialPosts = await fetchPosts(0);
        const rankingData = await fetchRanking();
        setPosts(initialPosts);
        setRanking(rankingData);
        setLoading(false);
      };
      init();
    }
  }, [status]);

  useEffect(() => {
    const handleScroll = async () => {
      if (!feedRef.current || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        const nextPage = page + 1;
        const newPosts = await fetchPosts(nextPage);
        if (newPosts.length === 0) {
          setHasMore(false);
          return;
        }
        setPosts(prev => [...prev, ...newPosts]);
        setPage(nextPage);
      }
    };
    const feedDiv = feedRef.current;
    feedDiv?.addEventListener('scroll', handleScroll);
    return () => feedDiv?.removeEventListener('scroll', handleScroll);
  }, [page, hasMore]);

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'IA') return post.destaqueIA;
    return post.tipo === filter;
  });

  if (status === 'loading' || loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </LayoutWrapper>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  return (
    <LayoutWrapper>
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        {/* HEADER */}
        <header className="flex items-center justify-between px-4 py-3 bg-gray-950 shadow-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <img src={userPhotoUrl} alt="avatar" className="w-10 h-10 rounded-full border-2 border-green-500" />
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://wa.me/5521991146984" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition" title="Suporte no WhatsApp">
              <MessageCircle className="w-6 h-6 cursor-pointer" />
            </a>
            <div className="relative cursor-pointer">
              <Bell className="w-6 h-6 hover:text-green-400 transition" />
            </div>
            <LogOut onClick={() => signOut({ callbackUrl: '/login' })} className="w-6 h-6 cursor-pointer hover:text-red-400 transition" />
          </div>
        </header>

        {/* MAIN */}
        <main ref={feedRef} className="flex-1 overflow-y-auto pb-24 flex gap-4 px-4 mt-4">
          {/* FEED */}
          <div className="flex-1 flex flex-col gap-4">
            {/* FILTERS */}
            <div className="flex gap-2 mb-2">
              {['all', 'trader', 'educador', 'IA'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1 rounded-xl text-sm ${filter === f ? 'bg-green-500 text-black' : 'bg-white/10'}`}
                >
                  {f === 'all' ? 'Todos' : f === 'IA' ? 'Destaque IA' : f === 'trader' ? 'Traders' : 'Educadores'}
                </button>
              ))}
            </div>

            {filteredPosts.map(post => (
              <div key={post.id} className={`p-4 rounded-2xl shadow-md ${post.destaqueIA ? 'bg-green-600' : 'bg-white/10'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <img src={post.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-semibold">{post.usuario} {post.destaqueIA && <Star className="inline w-4 h-4 text-yellow-400" />}</p>
                    <p className="text-xs text-gray-400">{post.timestamp}</p>
                  </div>
                </div>
                <p className="mb-2">{post.conteudo}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <Heart className="w-5 h-5 hover:text-red-400 transition" /> <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    💬 <span>{post.comentarios}</span>
                  </div>
                </div>
              </div>
            ))}
            {hasMore && <p className="text-center text-gray-400 mt-2">Carregando mais posts...</p>}
          </div>

          {/* RANKING */}
          <div className="w-64 flex-shrink-0">
            <h3 className="text-lg font-semibold mb-2">🏆 Ranking</h3>
            <div className="flex flex-col gap-2">
              {ranking.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white/10 rounded-xl shadow-md">
                  <img src={item.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="font-semibold">{item.nome}</p>
                    <p className="text-xs text-gray-400">{item.tipo}</p>
                    <div className="flex gap-1 mt-1">
                      {item.badges?.map((b, i) => (
                        <span key={i} className="text-[10px] bg-green-500 px-1 rounded">{b}</span>
                      ))}
                    </div>
                  </div>
                  <p className="font-bold">{item.pontos}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="sticky bottom-0 w-full bg-gray-950 text-white py-2 px-6 flex justify-between items-center shadow-lg">
          <button onClick={() => router.push('/dashboard')} className="flex flex-col items-center">
            <Home className="w-6 h-6" /> <span className="text-xs">Início</span>
          </button>
          <button onClick={() => router.push('/carteira')} className="flex flex-col items-center">
            <Wallet className="w-6 h-6" /> <span className="text-xs">Carteira</span>
          </button>
          <button onClick={() => router.push('/perfil')} className="flex flex-col items-center">
            <User className="w-6 h-6" /> <span className="text-xs">Perfil</span>
          </button>
          <button onClick={() => router.push('/config')} className="flex flex-col items-center">
            <Settings className="w-6 h-6" /> <span className="text-xs">Config</span>
          </button>
        </footer>
      </div>
    </LayoutWrapper>
  );
}
