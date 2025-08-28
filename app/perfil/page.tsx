'use client';

import { useState } from "react";
import { Carousel } from '@ui/carousel';
import CategoryFilter from '@ui/CategoryFilter';

type User = {
  id: number;
  name: string | null;
  email: string;
};

export default function PerfilPage() {
  const [selected, setSelected] = useState("Todos");
  const categories = ["Todos", "Esporte", "Cassino", "Slots"];

  const [users] = useState<User[]>([
    { id: 1, name: "João", email: "joao@example.com" },
    { id: 2, name: null, email: "ana@example.com" },
    { id: 3, name: "Carlos", email: "carlos@example.com" },
  ]);

  return (
    <main className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">👤 Lista de Usuários</h1>

      <Carousel />

      <CategoryFilter
        selected={selected}
        onSelect={setSelected}
        categories={categories}
      />

      {users.length === 0 ? (
        <p className="text-gray-400">Nenhum usuário encontrado.</p>
      ) : (
        <ul className="space-y-4 mt-6">
          {users.map((user) => (
            <li
              key={user.id}
              className="bg-zinc-800 p-4 rounded-lg shadow-md hover:bg-zinc-700 transition"
            >
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Nome:</strong> {user.name || "Não informado"}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
