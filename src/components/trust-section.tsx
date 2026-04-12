const pillars = [
  {
    icon: '📊',
    title: 'Baseado em Dados',
    description:
      'Decisões baseadas em histórico estatístico profundo e múltiplas ligas monitoradas.',
  },
  {
    icon: '⚙️',
    title: 'Metodologia Transparente',
    description:
      'Modelos matemáticos auditáveis com lógica probabilística pura e sem caixas-pretas.',
  },
  {
    icon: '📈',
    title: 'Foco em Value Betting',
    description:
      'Identificamos odds com edge positivo — a única abordagem matematicamente lucrativa no longo prazo.',
  },
]

export default function TrustSection() {
  return (
    <section className="py-24 border-t border-outline-variant/10">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-headline text-4xl font-bold tracking-tighter mb-4">
            Por que confiar no Portal?
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Não somos um site de apostas. Somos uma plataforma de inteligência.
            Transparência e dados são nossos únicos pilares.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {pillars.map((p) => (
            <div key={p.title} className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-6 border border-outline-variant/10 text-3xl">
                {p.icon}
              </div>
              <h3 className="font-headline text-xl font-bold mb-3">{p.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
