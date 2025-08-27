// components/RobotChat.tsx
import Image from 'next/image';

export default function RobotChat() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        width: 60,
        height: 60,
        zIndex: 1000,
        cursor: 'pointer',
      }}
      aria-label="Robô Chat"
      role="img"
    >
      <Image
        src="/img/demo34.png"
        alt="Robô Chat"
        width={60}
        height={60}
        priority
      />
    </div>
  );
}
