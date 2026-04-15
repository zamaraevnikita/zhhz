import { type FC } from 'react';
import { Link } from 'react-router-dom';

const products = [
  { id: 1, name: 'Название', pages: '20/24/28/32 страниц', price: 'от 2000р.' },
  { id: 2, name: 'Название', pages: '20/24/28/32 страниц', price: 'от 2000р.' },
  { id: 3, name: 'Название', pages: '20/24/28/32 страниц', price: 'от 2000р.' },
  { id: 4, name: 'Название', pages: '20/24/28/32 страниц', price: 'от 2000р.' },
  { id: 5, name: 'Название', pages: '20/24/28/32 страниц', price: 'от 2000р.' },
  { id: 6, name: 'Название', pages: '20/24/28/32 страниц', price: 'от 2000р.' },
];

/*
  Figma @ 1440px:
  - Секция: 1440×944, bg white
  - Заголовки: top 41px
  - Карточки 269×358, 3 колонки
    - grid width: 3×269 + 2×67 = 941px → 65.3% от 1440
    - Gap-x: 67px → 4.65vw
    - Gap-y: 63px → 4.375vw
  - Кнопки: 94×23 с gap 32px

  Scaling: max(min, vw) — no upper cap, scales linearly on any resolution.
*/

const Catalog: FC = () => {
  return (
    <section
      className="relative w-full bg-white"
      id="catalog"
      style={{ paddingTop: 'clamp(28px, 2.85vw, 55px)', paddingBottom: 'clamp(50px, 5.56vw, 107px)' }}
    >
      <div className="page-container relative">
        {/* Шапка: три элемента в линию */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '0 clamp(24px, 3.47vw, 67px)',
          marginBottom: 'clamp(32px, 3.89vw, 75px)',
        }}
      >
        <span className="font-sans font-normal leading-[1.17] text-[#737373] text-left whitespace-nowrap" style={{ fontSize: 'clamp(10px, 0.83vw, 16px)' }}>
          КОНСТРУКТОР&nbsp;&nbsp;ГЛЯНЦА
        </span>
        <h2 className="font-syncopate font-normal leading-[0.9] text-black tracking-[2px] text-center" style={{ fontSize: 'clamp(18px, 1.94vw, 37px)' }}>
          ВЫБЕРИ ОСНОВУ
        </h2>
        <span className="font-sans font-normal leading-[1.17] text-[#737373] text-right whitespace-nowrap" style={{ fontSize: 'clamp(10px, 0.83vw, 16px)' }}>
          СОБЕРИ СВОЙ ЖУРНАЛ
        </span>
      </div>

      {/* Сетка карточек: 3 колонки, центрированная */}
      <div
        className="grid grid-cols-3"
        style={{
          gap: 'clamp(40px, 4.375vw, 84px) clamp(40px, 4.65vw, 89px)',
          width: '65.3%',
          maxWidth: 'calc(100% - 48px)',
          margin: '0 auto',
        }}
      >
        {products.map((product) => (
          <div key={product.id} className="relative w-full" style={{ aspectRatio: '269 / 358' }}>
            {/* Верхняя часть — изображение (73.03% высоты) */}
            <div className="absolute inset-x-0 top-0 bottom-[26.97%] bg-white border border-black" />

            {/* Нижняя часть — инфо (27.27% высоты) */}
            <div
              className="absolute inset-x-0 top-[72.73%] bottom-0 bg-white border border-black flex flex-col justify-between"
              style={{ padding: 'clamp(6px, 0.7vw, 13px) clamp(8px, 0.6vw, 12px) clamp(6px, 0.55vw, 11px)' }}
            >
              {/* Название + страницы + цена */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col" style={{ gap: 'clamp(2px, 0.3vw, 6px)' }}>
                  <span className="font-sans font-bold leading-[1.17] text-black" style={{ fontSize: 'clamp(12px, 1.13vw, 22px)' }}>
                    {product.name}
                  </span>
                  <span className="font-sans font-light leading-[1.17] text-[#747474]" style={{ fontSize: 'clamp(9px, 0.83vw, 16px)' }}>
                    {product.pages}
                  </span>
                </div>
                <span className="font-sans font-bold leading-[1.17] text-black text-right" style={{ fontSize: 'clamp(12px, 1.13vw, 22px)' }}>
                  {product.price}
                </span>
              </div>

              {/* Кнопки */}
              <div className="flex justify-center" style={{ gap: 'clamp(16px, 2.22vw, 43px)' }}>
                <Link
                  to={`/product/${product.id}`}
                  className="border border-black bg-white text-black cursor-pointer font-sans font-normal leading-[1.1] text-center flex items-center justify-center transition-opacity hover:bg-gray-100"
                  style={{ padding: 'clamp(4px, 0.42vw, 8px) clamp(16px, 1.6vw, 31px)', fontSize: 'clamp(8px, 0.69vw, 13px)' }}
                >
                  Подробнее
                </Link>
                <button
                  type="button"
                  className="border-none bg-black text-white cursor-pointer font-sans font-normal leading-[1.1] text-center"
                  style={{ padding: 'clamp(4px, 0.42vw, 8px) clamp(16px, 1.6vw, 31px)', fontSize: 'clamp(8px, 0.69vw, 13px)' }}
                >
                  Собрать
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
};

export default Catalog;
