const CARDS = [
  {
    title: 'Prinsip Pembukaan',
    body: 'Kuasai pusat papan, kembangkan kuda sebelum gajah, dan lakukan rokade lebih awal agar raja tetap aman.'
  },
  {
    title: 'En Passant',
    body: 'Aturan makan pion yang hanya berlaku tepat satu langkah setelah pion lawan maju dua petak.'
  },
  {
    title: 'Nilai Tempo',
    body: 'Setiap langkah yang memaksa lawan merespons sambil memperbaiki posisimu lebih berharga dari yang terlihat.'
  }
];

export function ChessKnowledge() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="font-display text-2xl text-parchment-100 mb-4">Wawasan Catur</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="bg-espresso-900/50 bg-[url('/textures/wood-grain.svg')] bg-cover bg-blend-multiply border border-walnut-700 rounded-xl p-5"
          >
            <h3 className="font-display text-parchment-100 mb-2">{card.title}</h3>
            <p className="text-sm text-parchment-300/70">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
