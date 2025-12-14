import { Sweet } from './SweetCard';
import { formatINR } from '../utils/currency';

export type CartItem = { sweet: Sweet; quantity: number };

type Status = { type: 'success' | 'error'; message: string } | null;

type CartPanelProps = {
  items: CartItem[];
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
  status?: Status;
};

export default function CartPanel({ items, onQuantityChange, onRemove, onCheckout, isCheckingOut, status }: CartPanelProps) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.sweet.price) * item.quantity, 0);
  return (
    <aside className="glass-panel sticky top-28 h-max space-y-6 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Hamper</p>
        <h3 className="text-2xl font-semibold text-white">Your tasting curation</h3>
        <p className="text-sm text-slate-400">Complimentary ice packs + handwritten notes on every order.</p>
      </div>
      {status && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100' : 'border-rose-400/40 bg-rose-500/10 text-rose-100'}`}>
          {status.message}
        </div>
      )}
      <div className="space-y-4">
        {items.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">No sweets yet. Tap "Add to hamper" on any card to build your tasting flight.</p>}
        {items.map((item) => (
          <div key={item.sweet.id} className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-white">{item.sweet.name}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.sweet.category}</p>
              </div>
              <button onClick={() => onRemove(item.sweet.id)} className="text-xs uppercase tracking-[0.3em] text-slate-400 transition hover:text-rose-200">
                Remove
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Qty
                <input
                  type="number"
                  min={1}
                  max={item.sweet.quantity}
                  value={item.quantity}
                  onChange={(e) => {
                    const parsed = Number(e.target.value);
                    onQuantityChange(item.sweet.id, Number.isNaN(parsed) ? 1 : parsed);
                  }}
                  className="ml-3 w-16 rounded-full border border-white/10 bg-transparent px-3 py-1 text-right text-sm text-white outline-none"
                />
              </label>
              <p className="text-base font-semibold text-amber-200">{formatINR(Number(item.sweet.price) * item.quantity)}</p>
            </div>
            {item.sweet.quantity <= item.quantity && (
              <p className="mt-2 text-xs text-amber-200">Last {item.sweet.quantity} boxes available</p>
            )}
          </div>
        ))}
      </div>
      <div className="space-y-3 rounded-3xl border border-white/10 bg-black/40 p-5 text-sm text-slate-300">
        <div className="flex items-center justify-between text-base text-white">
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <p className="text-xs text-slate-500">Shipping calculated at dispatch. Free for Mumbai, Pune, Delhi, Bangalore.</p>
        <button
          disabled={!items.length || isCheckingOut}
          onClick={onCheckout}
          className={`w-full rounded-full px-5 py-3 text-sm font-semibold transition ${!items.length || isCheckingOut ? 'cursor-not-allowed bg-white/10 text-slate-500' : 'bg-amber-300 text-slate-900 hover:bg-amber-200'}`}
        >
          {isCheckingOut ? 'Confirming...' : 'Schedule courier pickup'}
        </button>
      </div>
    </aside>
  );
}
