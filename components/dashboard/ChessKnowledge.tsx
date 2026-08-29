const CARDS = [
  {
    title: 'The Opening Principles',
    body: 'Control the center, develop knights before bishops, and castle early to keep your king safe.'
  },
  {
    title: 'En Passant',
    body: "A pawn capturing rule that only applies the move immediately after an opponent's two-square pawn advance."
  },
  {
    title: 'The Value of Tempo',
    body: 'Every move that forces a reply while improving your position is worth more than it looks on the board.'
  }
];

export function ChessKnowledge() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="font-display text-2xl text-parchment-100 mb-4">Chess Knowledge</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="bg-espresso-900/50 border border-walnut-700 rounded-xl p-5"
          >
            <h3 className="font-display text-parchment-100 mb-2">{card.title}</h3>
            <p className="text-sm text-parchment-300/70">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
