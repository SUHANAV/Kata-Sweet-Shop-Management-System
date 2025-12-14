type CategoryPillsProps = {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
};

export default function CategoryPills({ categories, selected, onSelect }: CategoryPillsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => {
        const isActive = selected === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${isActive ? 'border-amber-300 bg-amber-300/20 text-amber-100' : 'border-white/10 text-slate-400 hover:border-amber-200/50 hover:text-white'}`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
