import type { SummaryCardData } from '../types';

type SummaryCardsProps = {
  cards: SummaryCardData[];
};

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <section className="mb-[18px] grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(160px,1fr))]" aria-label="Indicadores principales">
      {cards.map((card) => (
        <article className={`min-h-[126px] rounded-lg border border-[#dde5ee] border-t-4 bg-white p-3.5 shadow-[0_10px_24px_rgba(28,38,51,0.06)] md:p-[18px] ${card.borderClass}`} key={card.label}>
          <span className="block text-[14px] text-[#64748b]">{card.label}</span>
          <strong className="m-[10px_0_8px] block text-[30px] leading-none text-[#111827]">{card.value}</strong>
          <p className="m-[8px_0_0] text-[14px] text-[#64748b]">{card.helper}</p>
        </article>
      ))}
    </section>
  );
}
