'use client'

export default function BackgroundDots() {
  return (
    <div className="background-dots fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
      {[...Array(30)].map((_, i) => {
        const size = 4 + Math.random() * 6
        const top = Math.random() * 100
        const left = Math.random() * 100
        const delay = Math.random() * 3
        return (
          <span
            key={i}
            style={{
              width: size + 'px',
              height: size + 'px',
              top: top + 'vh',
              left: left + 'vw',
              animationDelay: delay + 's',
            }}
            className="absolute rounded-full bg-[rgba(0,200,83,0.3)] filter drop-shadow-[0_0_4px_rgba(0,200,83,0.7)] animate-pulseDot"
          />
        )
      })}
    </div>
  )
}
