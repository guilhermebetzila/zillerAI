type GameCardProps = {
  title: string;
  image?: string;
};

const GameCard = ({ title, image }: GameCardProps) => {
  const kebabTitle = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")     // troca espaços e símbolos por "-"
    .replace(/(^-|-$)/g, "");        // remove hífens do começo/fim

  const imagePath = image || `/games/${kebabTitle}.png`; // <- extensões corrigidas para .png
  const fallbackImage = "/games/placeholder.png"; // certifique-se que esse arquivo existe

  return (
    <div className="bg-[#1f1f1f] p-2 rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer shadow-md">
      <img
        src={imagePath}
        alt={title}
        className="rounded-md w-full h-28 object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== window.location.origin + fallbackImage) {
            target.onerror = null;
            target.src = fallbackImage;
          }
        }}
      />
      <p className="text-sm text-center mt-2 text-white">{title}</p>
    </div>
  );
};

export default GameCard;
