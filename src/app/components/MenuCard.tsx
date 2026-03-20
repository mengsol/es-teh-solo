"use client";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  emoji?: string;
  image?: string;
  category: "original" | "rasa" | "topping";
}

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export default function MenuCard({ item, onAdd }: MenuCardProps) {
  return (
    <button
      onClick={() => onAdd(item)}
      className="bg-white rounded-2xl p-4 shadow-md active:scale-95 transition-transform
                 flex flex-col items-center gap-2 border-2 border-transparent
                 hover:border-primary focus:border-primary focus:outline-none"
      aria-label={`Tambah ${item.name} - Rp ${item.price.toLocaleString("id-ID")}`}
    >
      {item.image ? (
        <img src={item.image} alt={item.name} className="w-20 h-20 object-contain" />
      ) : (
        <span className="text-4xl">{item.emoji}</span>
      )}
      <span className="text-navy font-semibold text-sm text-center leading-tight">{item.name}</span>
      <span className="text-primary font-bold text-base">
        Rp {item.price.toLocaleString("id-ID")}
      </span>
    </button>
  );
}
