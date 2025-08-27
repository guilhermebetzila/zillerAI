"use client"

import { useState } from "react"

const banners = [
  { id: 1, title: "Promoção de Esportes", image: "/banners/esporte.jpg" },
  { id: 2, title: "Cassino ao Vivo", image: "/banners/cassino.jpg" },
  { id: 3, title: "Slots Incríveis", image: "/banners/slots.jpg" },
]

export default function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-8">
      <div className="overflow-hidden rounded-lg shadow-lg">
        <img
          src={banners[currentIndex].image}
          alt={banners[currentIndex].title}
          className="w-full h-64 object-cover"
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <button
          onClick={prevSlide}
          className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
        >
          ◀
        </button>
        <button
          onClick={nextSlide}
          className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
        >
          ▶
        </button>
      </div>
      <p className="text-center mt-2 text-lg font-semibold text-white">
        {banners[currentIndex].title}
      </p>
    </div>
  )
}
