"use client"

type Props = {
  selected: string
  categories: string[]
  onSelect: (value: string) => void
}

export default function CategoryFilter({ selected, categories, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 my-6">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-4 py-2 rounded-full border transition ${
            selected === category
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
