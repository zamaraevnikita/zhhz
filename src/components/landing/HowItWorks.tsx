import { type FC } from 'react';

/*
  Figma @ 1440px (section 1441×718):
  ─ Title "КАК ЭТО РАБОТАЕТ?": top=61, left≈48, Syncopate 28px bold
  ─ Left column (~654px):
    Numbers 1-4: Syncopate 87-90px, #E8BDCC — стоят на разделительной линии
    Titles: Syncopate 15px bold
    Descriptions: Inter 14px/17px
    Dividers: линии под числами, числа буквально стоят на них
  ─ Right column: image 684×437 (ratio 1.565)

  Font metrics (Syncopate Bold, measured at 1000px via Canvas measureText):
    fontBoundingBoxAscent  = 932 → ratio = 0.932 em
    fontBoundingBoxDescent = 170 → ratio = 0.170 em
    Content area = 1.102 em

  Per-digit actualBoundingBoxDescent (at 1000px):
    "1" = 0px → 0.000000 em
    "2" = 0px → 0.000000 em
    "3" = 15.625px → 0.015625 em
    "4" = 0px → 0.000000 em

  At line-height: 0.804:
    halfLeading = (0.804 - 1.102) / 2 = -0.149 em
    baseline = divider - (fontDescent - |halfLeading|) = divider - 0.021 em

  Per-digit translateY to land glyph bottom on divider:
    translateY = (fontDescent - |halfLeading|) - actualDescent
              = 0.021 - actualDescent (in em)
    "1","2","4": 0.021em    |  "3": 0.005375em

  Scaling: max(min, vw) — no upper cap.
*/

const GLYPH_Y = {
  1: '0.021em',
  2: '0.0095em',
  3: '0.005375em',
  4: '0.021em',
} as const;

const steps = [
  {
    num: 1 as const,
    title: <>ВЫБОР<br />ОБЛОЖКИ</>,
    text: (
      <>
        Ознакомьтесь с предложенными обложками{' '}
        <a href="#catalog">здесь.</a> Если ничего не приглянулось –
        загрузите вашу обложку в пустом варианте.
      </>
    ),
  },
  {
    num: 2 as const,
    title: <>ОЗНАКОМЬТЕСЬ<br />С ТОВАРОМ</>,
    text: 'В карточке товара можно выбрать интересующее вас количество страниц, ознакомиться со сроками доставки и особенностями печати.',
  },
  {
    num: 3 as const,
    title: <>СОБЕРИТЕ<br />МАКЕТ</>,
    text: 'Выберите темы для наполнения и дизайн. Составьте свой персональный журнал заполнив шаблон фотографиями и текстом.',
  },
  {
    num: 4 as const,
    title: <>ОФОРМИТЕ<br />ЗАКАЗ</>,
    text: 'Заполните информацию для заказа и ожидайте письмо об изготовлении на почте.',
  },
];

const HowItWorks: FC = () => {
  return (
    <section
      className="relative w-full"
      id="delivery"
      style={{
        paddingTop: 'clamp(43px, 4.24vw, 81px)',
        paddingBottom: 'clamp(43px, 4.24vw, 81px)',
        paddingLeft: 'var(--spacing-page)',
        paddingRight: 'var(--spacing-page)',
      }}
    >
      <div className="page-container relative">
        {/* ─── Заголовок ─── */}
      <h2
        className="font-syncopate font-bold text-black text-left"
        style={{
          fontSize: 'clamp(20px, 1.94vw, 37px)',
          lineHeight: '0.9',
          marginBottom: 'clamp(30px, 3.47vw, 67px)',
        }}
      >
        КАК ЭТО РАБОТАЕТ?
      </h2>

      {/* ─── Контент: левая колонка + правая картинка ─── */}
      <div
        className="relative"
      >
        {/* ═══ Левая колонка: шаги ═══ */}
        <div
          className="flex flex-col"
          style={{
            width: '48.25%',
          }}
        >
          {steps.map((step) => (
            <div key={step.num} className="relative">
              {/* Разделительная линия — числа стоят НА ней */}
              <div
                className="absolute left-0 border-b border-black"
                style={{ bottom: 0, width: '98%' }}
              />

              <div className="flex items-end relative">
                {/* Номер — стоит на разделительной линии */}
                <span
                  className="font-syncopate font-bold shrink-0 block"
                  style={{
                    fontSize: 'clamp(62px, 6.11vw, 117px)',
                    lineHeight: '0.804',
                    color: '#E8BDCC',
                    width: 'clamp(55px, 5.56vw, 107px)',
                    paddingTop: 'clamp(8px, 1.04vw, 20px)',
                    transform: `translateY(${GLYPH_Y[step.num]})`,
                  }}
                >
                  {step.num}
                </span>

                {/* Заголовок шага */}
                <h3
                  className="font-syncopate font-bold uppercase shrink-0 leading-[1.3]"
                  style={{
                    fontSize: 'clamp(11px, 1.04vw, 20px)',
                    marginLeft: 'clamp(10px, 1.25vw, 24px)',
                    width: 'clamp(100px, 13.19vw, 253px)',
                    marginBottom: 'clamp(8px, 0.83vw, 16px)',
                  }}
                >
                  {step.title}
                </h3>

                {/* Описание */}
                <p
                  className="font-inter font-normal text-black flex-1 [&_a]:underline"
                  style={{
                    fontSize: 'clamp(10px, 0.97vw, 19px)',
                    lineHeight: 'clamp(12px, 1.18vw, 23px)',
                    marginLeft: 'clamp(16px, 2.08vw, 40px)',
                    marginBottom: 'clamp(8px, 0.83vw, 16px)',
                  }}
                >
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ Правая колонка: картинка ═══ */}
        <div
          className="absolute overflow-hidden"
          style={{
            bottom: 0,
            right: 0,
            top: 'clamp(-29px, -2.01vw, -6px)',
            width: '50.86%',
          }}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#D9D9D9]"
            style={{
              aspectRatio: '684 / 437',
            }}
          />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
