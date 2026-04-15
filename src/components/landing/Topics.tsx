import { type FC, useRef } from 'react';

const topics = [
  'письмо редактора',
  'путешествия',
  'факты',
  'увлечения',
  'список желаний',
  'обзор образов',
];

/*
  Figma @ 1440px:
  - Section: 1441×635, top=1725
  - Title "НЕ ПРОСТО ФОТОКНИГИ": Syncopate 28px, centered
  - Subtitle: Helvetica 12px, centered, 394px wide
  - Carousel: 6 tabs + 6 cards, arrows at edges
  - Button: 176×33, Inter 11px

  Scaling: max(min, vw) — no upper cap.
*/

const Topics: FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <section
      className="relative w-full text-center"
      style={{
        paddingTop: 'clamp(60px, 6.46vw, 124px)',
        paddingBottom: 'clamp(45px, 5vw, 96px)',
      }}
    >
      <div className="page-container relative">
        {/* Заголовок */}
      <h2
        className="font-syncopate font-normal text-black tracking-[2px] text-center mx-auto"
        style={{
          fontSize: 'clamp(18px, 1.94vw, 37px)',
          lineHeight: '0.9',
        }}
      >
        НЕ ПРОСТО ФОТОКНИГИ
      </h2>

      {/* Подзаголовок */}
      <p
        className="font-sans font-normal text-black text-center"
        style={{
          fontSize: 'clamp(10px, 0.83vw, 16px)',
          lineHeight: '1.17',
          marginTop: 'clamp(8px, 0.9vw, 17px)',
          maxWidth: 'clamp(280px, 27.4vw, 526px)',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        создай персональный журнал с известной обложкой, используя
        готовые идеи наполнения и дизайна
      </p>

      {/* Карусель обёртка — центрируется через flex */}
      <div className="flex justify-center w-full"
        style={{ marginTop: 'clamp(40px, 5vw, 96px)' }}
      >
        <div
          className="relative"
          style={{
            /* Ширина = 6 колонок + 5 gaps */
            width: 'calc(6 * clamp(140px, 14.5vw, 278px) + 5 * clamp(8px, 0.9vw, 17px))',
            maxWidth: 'calc(100% - clamp(80px, 7vw, 134px))',
          }}
        >
          {/* Стрелка назад — позиционируется ЗА пределами контента */}
          <button
            type="button"
            className="absolute z-10 bg-white border-none cursor-pointer flex items-center justify-center p-0"
            style={{
              width: 'clamp(24px, 2.15vw, 41px)',
              height: 'clamp(24px, 2.15vw, 41px)',
              right: '100%',
              marginRight: 'clamp(4px, 0.42vw, 8px)',
              top: '57%',
              transform: 'translateY(-50%)',
            }}
            aria-label="Назад"
            onClick={scrollLeft}
          >
            <svg width="100%" height="100%" viewBox="0 0 29 29" fill="none">
              <circle cx="14.5" cy="14.5" r="14.5" fill="white" />
              <path d="M14.1765 19L8 14.5L14.1765 10" stroke="#737373" />
              <path d="M8 14.5H23" stroke="#737373" />
            </svg>
          </button>

          {/* Стрелка вперёд — позиционируется ЗА пределами контента */}
          <button
            type="button"
            className="absolute z-10 bg-white border-none cursor-pointer flex items-center justify-center p-0"
            style={{
              width: 'clamp(24px, 2.15vw, 41px)',
              height: 'clamp(24px, 2.15vw, 41px)',
              left: '100%',
              marginLeft: 'clamp(4px, 0.42vw, 8px)',
              top: '57%',
              transform: 'translateY(-50%)',
            }}
            aria-label="Вперёд"
            onClick={scrollRight}
          >
            <svg width="100%" height="100%" viewBox="0 0 29 29" fill="none" className="scale-x-[-1]">
              <circle cx="14.5" cy="14.5" r="14.5" fill="white" />
              <path d="M14.1765 19L8 14.5L14.1765 10" stroke="#737373" />
              <path d="M8 14.5H23" stroke="#737373" />
            </svg>
          </button>

          {/* Скроллящийся контейнер */}
          <div
            ref={carouselRef}
            className="flex overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{
              gap: 'clamp(8px, 0.9vw, 17px)',
            }}
          >
            {topics.map((topic) => (
              <div
                key={topic}
                className="flex flex-col items-stretch shrink-0"
                style={{ width: 'clamp(140px, 14.5vw, 278px)' }}
              >
                {/* Название темы */}
                <span
                  className="font-sans font-normal text-black text-left whitespace-nowrap"
                  style={{
                    fontSize: 'clamp(10px, 0.89vw, 17px)',
                    lineHeight: '1.17',
                    paddingTop: 'clamp(6px, 0.61vw, 12px)',
                    paddingBottom: 'clamp(6px, 0.61vw, 12px)',
                    marginBottom: 'clamp(6px, 0.87vw, 17px)',
                  }}
                >
                  {topic}
                </span>
                {/* Карточка */}
                <div
                  className="w-full bg-white border border-black"
                  style={{ aspectRatio: '1 / 1' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Кнопка */}
      <button
        type="button"
        className="inline-flex items-center justify-center bg-white border border-black font-inter font-normal text-black cursor-pointer"
        style={{
          fontSize: 'clamp(9px, 0.76vw, 15px)',
          lineHeight: '1.18',
          padding: 'clamp(5px, 0.49vw, 9px) clamp(14px, 1.25vw, 24px)',
          marginTop: 'clamp(30px, 3.68vw, 71px)',
        }}
      >
          Перейти в конструктор
        </button>
      </div>
    </section>
  );
};

export default Topics;
