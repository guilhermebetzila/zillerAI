// components/PixFixed.tsx
import Image from 'next/image';

export default function PixFixed() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 20,     // posição no topo
        left: 20,    // canto esquerdo
        width: 50,
        height: 50,
        zIndex: 1000,
      }}
    >
      <Image
        src="/img/pix.png"
        alt="Pix"
        width={50}
        height={50}
      />
    </div>
  );
}
