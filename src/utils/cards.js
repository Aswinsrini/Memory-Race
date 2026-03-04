export const CARD_EMOJIS = [
  '🚀', '🎮', '🎧', '💎', '🔥', '⚡',
  '🌊', '🎯', '🦊', '🌸', '🎪', '🧊',
]

export function shuffleCards(emojis) {
  const cards = emojis.flatMap((emoji, i) => [
    { id: i * 2, emoji, pairId: i },
    { id: i * 2 + 1, emoji, pairId: i },
  ])

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]]
  }

  return cards
}
