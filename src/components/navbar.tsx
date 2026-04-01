// src/components/navbar.tsx
export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-outline-variant/10">
      <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center">
        <span className="font-headline font-bold text-xl text-primary uppercase tracking-tighter">
          Portal do Apostador
        </span>
      </div>
    </nav>
  )
}
