const testimonials = [
  {
    quote: 'Each bite tastes like my grandmother\'s kitchen but plated for a design magazine. The handwritten reheating card is such a thoughtful touch.',
    name: 'Aanya Kapoor',
    title: 'Creative Director, Delhi',
  },
  {
    quote: 'We send KATA hampers to every new parent on our team. Packaging is plastic-free, elegant, and always arrives chilled.',
    name: 'Karthik Raman',
    title: 'People Ops, Bangalore',
  },
  {
    quote: 'The concierge helped curate vegan boxes for our wedding favors. Guests still ask for refills two months later.',
    name: 'Mira & Soham',
    title: 'Hyderabad',
  },
];

export default function Testimonials() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Voices from the atelier</p>
          <h2 className="text-3xl font-semibold text-white">Loved across homes & studios</h2>
        </div>
        <span className="hidden text-sm text-slate-400 md:block">5k+ love notes archived since 2018</span>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <article key={testimonial.name} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
            <p className="text-lg text-white/90">"{testimonial.quote}"</p>
            <div className="mt-4 text-xs uppercase tracking-[0.3em] text-amber-100">{testimonial.name}</div>
            <p className="text-xs text-slate-400">{testimonial.title}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
