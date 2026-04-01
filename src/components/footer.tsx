export default function Footer() {
  return (
    <footer className="border-t border-outline-variant/15 bg-surface mt-20">
      <div className="max-w-screen-2xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-headline text-xl font-black text-primary uppercase tracking-tighter">
              Portal do Apostador
            </span>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
              © 2025 Portal do Apostador. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-8 h-8 rounded-full border-2 border-outline-variant bg-surface-container flex items-center justify-center">
                <span className="text-xs font-black text-on-surface">18+</span>
              </div>
              <span className="text-[10px] font-bold border border-outline px-1.5 py-0.5 rounded text-outline uppercase tracking-wider">
                Proibido para menores
              </span>
            </div>
          </div>
          <div className="flex gap-8 text-xs uppercase tracking-widest">
            <a
              href="https://gamblingtherapy.org/"
              target="_blank"
              rel="noreferrer"
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              Gambling Therapy
            </a>
            <a
              href="http://www.conar.org.br/"
              target="_blank"
              rel="noreferrer"
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              CONAR
            </a>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-outline-variant/10 text-center">
          <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest max-w-3xl mx-auto leading-relaxed">
            Apostas esportivas envolvem risco. Jogue com responsabilidade. O Portal do Apostador
            fornece apenas insights analíticos baseados em modelos probabilísticos e não garante
            resultados financeiros.
          </p>
        </div>
      </div>
    </footer>
  )
}
