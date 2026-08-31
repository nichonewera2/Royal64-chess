import { Cpu, Users2, Wifi, Puzzle, MessageCircle, Smartphone } from 'lucide-react';

const FEATURES = [
  {
    icon: Cpu,
    title: 'Royal64 AI',
    body: 'Tiga tingkat kesulitan dengan pencarian minimax sungguhan — bukan gerakan acak.'
  },
  {
    icon: Wifi,
    title: 'Main Real-time',
    body: 'Bertanding lawan teman lewat ID, QR, atau tautan — gerakan tersinkron langsung.'
  },
  {
    icon: MessageCircle,
    title: 'Obrolan Dalam Game',
    body: 'Ngobrol dengan lawan langsung di meja pertandingan, tema kayu vintage.'
  },
  {
    icon: Puzzle,
    title: 'Mode Puzzle',
    body: 'Asah taktik dengan posisi-posisi pilihan yang sudah diverifikasi.'
  },
  {
    icon: Users2,
    title: 'Mode Penonton',
    body: 'Tonton pertandingan orang lain secara langsung cukup dengan Game ID.'
  },
  {
    icon: Smartphone,
    title: 'Bisa Dipasang',
    body: 'Progressive Web App — pasang di layar utama, main seperti aplikasi asli.'
  }
];

export function FeatureStrip() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="flex flex-col gap-2 chrome-bg-card bg-[url('/textures/wood-grain.svg')] bg-cover bg-blend-multiply border chrome-border rounded-xl p-5 shadow-sm"
          >
            <span className="w-10 h-10 rounded-lg bg-gold-500/15 text-gold-400 flex items-center justify-center">
              <Icon size={20} />
            </span>
            <h3 className="font-display chrome-text">{title}</h3>
            <p className="text-sm chrome-text-muted">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
