import { type FC } from 'react';
import heroBg from '../../assets/hero.jpg';

export const Designer: FC = () => {
  return (
    <section
      className="relative w-full overflow-clip z-10"
      id="designer-service"
      style={{
        /* 664 / 1440 = 46.11vw → at 1920: 885px */
        height: 'clamp(400px, 46.11vw, 885px)',
      }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat z-0"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 w-full h-full bg-[rgba(32,32,32,0.33)] z-[1]" />

      {/* Description text — absolute at 42% from top (279/664) */}
      <p
        className="absolute left-1/2 -translate-x-1/2 z-[2] font-inter font-normal text-center text-white"
        style={{
          top: '42.02%',
          fontSize: 'clamp(10px, 0.903vw, 17px)',
          lineHeight: 'clamp(12px, 1.111vw, 21px)',
        }}
      >
        У вас есть свои идеи для наполнения?<br />
        Вы хотите индивидуальный дизайн?<br />
        Закажите бесплатную консультацию с дизайнером!
      </p>

      {/* Button — absolute at 51.2% from top (340/664) */}
      <button
        type="button"
        className="absolute left-1/2 -translate-x-1/2 z-[2] flex flex-row justify-center items-center bg-transparent border border-white font-inter font-normal text-white cursor-pointer"
        style={{
          top: '51.2%',
          padding: 'clamp(5px, 0.486vw, 9px) clamp(14px, 1.25vw, 24px)',
          gap: '9px',
          fontSize: 'clamp(9px, 0.764vw, 15px)',
          lineHeight: '13px',
        }}
      >
        Перейти в конструктор
      </button>

      {/* Large title at bottom */}
      <h2
        className="absolute bottom-0 left-0 w-full font-astrum font-normal italic text-center text-white whitespace-nowrap pointer-events-none z-[2]"
        style={{
          fontSize: 'clamp(50px, 6.944vw, 133px)',
          lineHeight: '1',
          transform: 'translateY(0.2521em)',
        }}
      >
        <span className="font-astrum italic">Р</span>
        <span className="font-syncopate font-normal not-italic" style={{ fontSize: '0.75em' }}>АБОТА</span>
        <span className="font-syncopate font-normal not-italic" style={{ fontSize: '0.83em' }}> С </span>
        <span className="font-astrum italic">D</span>
        <span className="font-syncopate font-normal not-italic" style={{ fontSize: '0.75em' }}>ИЗАЙНЕРОМ</span>
      </h2>
    </section>
  );
};

export default Designer;
