import { useEffect, useMemo, useState } from 'react';
import { formatINR } from '../utils/currency';

export type Sweet = { id: number; name: string; category: string; price: string | number; quantity: number; imageUrl?: string | null };

const imageryByCategory: Record<string, string> = {
  traditional: 'https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=900&q=80',
  festive: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80',
  fusion: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80',
  modern: 'https://images.unsplash.com/photo-1452251889946-8ff5ea7b27ab?auto=format&fit=crop&w=900&q=80',
};

type SweetCardProps = {
  sweet: Sweet;
  onAddToCart: (sweet: Sweet, quantity: number) => void;
  onQuickBuy: (id: number) => void;
};

function getSweetImage(sweet: Sweet) {
  if (sweet.imageUrl) return sweet.imageUrl;
  const key = sweet.category?.toLowerCase();
  if (imageryByCategory[key]) return imageryByCategory[key];
  return `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80&sat=-15&blend-mode=overlay&sig=${sweet.id}`;
}

export default function SweetCard({ sweet, onAddToCart, onQuickBuy }: SweetCardProps) {
  const [quantity, setQuantity] = useState(sweet.quantity > 0 ? 1 : 0);
  const soldOut = sweet.quantity === 0;
  const price = Number(sweet.price) || 0;
  const displayRating = useMemo(() => 4 + ((sweet.id * 17) % 10) / 10, [sweet.id]);
  const image = useMemo(() => getSweetImage(sweet), [sweet.category, sweet.id, sweet.imageUrl]);

  useEffect(() => {
    setQuantity(sweet.quantity > 0 ? 1 : 0);
  }, [sweet.id, sweet.quantity]);

  const handleQuantityChange = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    const max = Math.max(0, sweet.quantity);
    const clamped = Math.min(Math.max(parsed, soldOut ? 0 : 1), max);
    setQuantity(clamped);
  };

  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="relative h-48 overflow-hidden">
        <img src={image} alt={sweet.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/70" />
        <div className="absolute left-4 top-4 accent-pill bg-black/40 text-xs text-white">{sweet.category}</div>
        <div className="absolute bottom-4 left-4">
          <p className="text-2xl font-semibold text-white">{formatINR(price)}</p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">per 12-piece box</p>
        </div>
        {soldOut && <span className="absolute right-4 top-4 rounded-full bg-red-500/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide">Sold out</span>}
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white">{sweet.name}</h3>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">In atelier - {sweet.quantity} boxes</p>
          </div>
          <div className="flex items-center gap-1 text-amber-300">
            <span className="text-lg">*</span>
            <p className="text-sm font-semibold">{displayRating.toFixed(1)}</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Slow roasted nuts, house-ground spices, and palm jaggery give this batch its caramel hue. Ships insulated with handwritten tasting notes.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 items-center justify-between rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300">
            <span className="uppercase tracking-[0.3em] text-xs text-slate-400">Qty</span>
            <input
              type="number"
              min={soldOut ? 0 : 1}
              max={sweet.quantity}
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-16 bg-transparent text-right text-white outline-none"
              disabled={soldOut}
            />
          </label>
          <button
            disabled={soldOut || quantity <= 0}
            onClick={() => onAddToCart(sweet, quantity)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${soldOut || quantity <= 0 ? 'cursor-not-allowed bg-white/10 text-slate-500' : 'bg-amber-300 text-slate-900 hover:bg-amber-200'}`}
          >
            Add to hamper
          </button>
        </div>
        <button
          disabled={soldOut}
          onClick={() => onQuickBuy(sweet.id)}
          className={`w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold transition ${soldOut ? 'cursor-not-allowed text-slate-500' : 'text-slate-100 hover:border-amber-300 hover:text-amber-200'}`}
        >
          Quick reserve (ships in 24h)
        </button>
      </div>
    </div>
  );
}
