import { type FC } from 'react';

const reviewsData = [
  {
    id: 1,
    name: 'Ольга',
    text: 'Решила собрать альбом про наш год. Удивилась, СКОЛЬКО всего было! Наше знакомство. Первые свидания. Как мы съездили в Африку, а после — сразу съехались. Внезапный отъезд и жизнь в Грузии.\nБали и первая в жизни Жени съемка, которая (шок, но это правда) ему супер понравилась.\nЗнакомство с моим папой и родными в Израиле. Когда дарила — расплакалась дважды.\nХочу сделать традицией и фиксировать каждый год.',
  },
  {
    id: 2,
    name: 'Ольга',
    text: 'Решила собрать альбом про наш год. Удивилась, СКОЛЬКО всего было! Наше знакомство. Первые свидания. Как мы съездили в Африку, а после — сразу съехались. Внезапный отъезд и жизнь в Грузии.\nБали и первая в жизни Жени съемка, которая (шок, но это правда) ему супер понравилась.\nЗнакомство с моим папой и родными в Израиле. Когда дарила — расплакалась дважды.\nХочу сделать традицией и фиксировать каждый год.',
  },
  {
    id: 3,
    name: 'Ольга',
    text: 'Решила собрать альбом про наш год. Удивилась, СКОЛЬКО всего было! Наше знакомство. Первые свидания. Как мы съездили в Африку, а после — сразу съехались. Внезапный отъезд и жизнь в Грузии.\nБали и первая в жизни Жени съемка, которая (шок, но это правда) ему супер понравилась.\nЗнакомство с моим папой и родными в Израиле. Когда дарила — расплакалась дважды.\nХочу сделать традицией и фиксировать каждый год.',
  },
];

/*
  Figma layout (1440px ref):
  - Section padding: ~107px sides, ~134px top/bottom
  - 3 cards 284px wide, gaps ~188px between them
  - Card: square photo (284×284), name 30px below, text 37px below name
  - Arrow vertically centered on photo slot

  Scaling: max(min, vw) — no upper cap, no maxWidth container.
*/

const Reviews: FC = () => {
  return (
    <section className="w-full" id="reviews">
      <div
        className="page-container"
        style={{ padding: 'clamp(60px, 9.3vw, 179px) clamp(32px, 3.33vw, 64px)' }}
      >
        {/* Заголовок */}
        <h2
          className="font-syncopate font-normal text-black uppercase"
          style={{
            fontSize: 'clamp(20px, 1.944vw, 37px)',
            lineHeight: 'clamp(18px, 1.736vw, 33px)',
            marginBottom: 'clamp(30px, 4.722vw, 91px)',
            paddingLeft: 'clamp(24px, 4.097vw, 79px)',
          }}
        >
          ВАШИ РЕВЬЮ
        </h2>

        {/* Контейнер: стрелки + карточки */}
        <div className="flex items-start w-full" style={{ gap: 'clamp(8px, 1.389vw, 27px)' }}>
          {/* Стрелка «назад» */}
          <button
            type="button"
            className="shrink-0 cursor-pointer p-0 border-none bg-transparent hover:opacity-70 transition-opacity"
            style={{ marginTop: 'clamp(90px, 9.444vw, 181px)' }}
            aria-label="Назад"
          >
            <svg width="29" height="29" viewBox="0 0 29 29" fill="none">
              <circle cx="14.5" cy="14.5" r="14.5" fill="white" />
              <path d="M12 10L7 14.5L12 19" stroke="black" strokeWidth="1" fill="none" />
              <line x1="7" y1="14.5" x2="22" y2="14.5" stroke="black" strokeWidth="1" />
            </svg>
          </button>

          {/* 3 карточки */}
          <div className="flex justify-between flex-1 min-w-0">
            {reviewsData.map((item) => (
              <div
                key={item.id}
                className="flex flex-col"
                style={{ width: 'clamp(150px, 19.722vw, 379px)' }}
              >
                {/* Квадратный слот для фото */}
                <div className="w-full bg-[#D9D9D9]" style={{ aspectRatio: '1 / 1' }} />

                {/* Имя */}
                <p
                  className="font-inter font-normal text-black text-center"
                  style={{
                    fontSize: 'clamp(13px, 1.25vw, 24px)',
                    lineHeight: 'clamp(16px, 1.528vw, 29px)',
                    marginTop: 'clamp(15px, 2.083vw, 40px)',
                  }}
                >
                  {item.name}
                </p>

                {/* Текст отзыва */}
                <p
                  className="font-inter font-normal text-black whitespace-pre-wrap"
                  style={{
                    fontSize: 'clamp(9px, 0.833vw, 16px)',
                    lineHeight: 'clamp(11px, 1.042vw, 20px)',
                    marginTop: 'clamp(10px, 1.389vw, 27px)',
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Стрелка «вперёд» */}
          <button
            type="button"
            className="shrink-0 cursor-pointer p-0 border-none bg-transparent hover:opacity-70 transition-opacity"
            style={{ marginTop: 'clamp(90px, 9.444vw, 181px)' }}
            aria-label="Вперёд"
          >
            <svg width="29" height="29" viewBox="0 0 29 29" fill="none" style={{ transform: 'scaleX(-1)' }}>
              <circle cx="14.5" cy="14.5" r="14.5" fill="white" />
              <path d="M12 10L7 14.5L12 19" stroke="black" strokeWidth="1" fill="none" />
              <line x1="7" y1="14.5" x2="22" y2="14.5" stroke="black" strokeWidth="1" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
