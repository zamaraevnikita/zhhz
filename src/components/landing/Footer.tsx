import { type FC } from 'react';
import { Link } from 'react-router-dom';

const linkClass =
  "font-['Helvetica'] font-normal text-black no-underline hover:underline";

const linkStyle = { fontSize: 'clamp(14px, 0.972vw, 19px)', lineHeight: '1.15' } as const;

const Footer: FC = () => {
  return (
    <footer className="w-full bg-white" id="contacts">
      {/* top border */}
      <div className="border-t border-[#0B0B0B]" />

      <div
        className="page-container flex items-start"
        style={{
          padding: `clamp(22px, 2.292vw, 44px) clamp(28px, 3.472vw, 67px)`,
        }}
      >
        {/* Link columns */}
        <div className="flex" style={{ gap: 'clamp(50px, 6.597vw, 127px)' }}>
          {/* Column 1 — 5 links */}
          <div className="flex flex-col" style={{ gap: 'clamp(10px, 0.972vw, 19px)' }}>
            <Link to="/about" className={linkClass} style={linkStyle}>О нас</Link>
            <Link to="/#delivery" className={linkClass} style={linkStyle}>Доставка</Link>
            <Link to="/#catalog" className={linkClass} style={linkStyle}>Печать</Link>
            <Link to="/#faq" className={linkClass} style={linkStyle}>Частые вопросы</Link>
            <Link to="/#contacts-info" className={linkClass} style={linkStyle}>Контакты</Link>
          </div>

          {/* Column 2 — 2 links */}
          <div className="flex flex-col" style={{ gap: 'clamp(10px, 0.972vw, 19px)' }}>
            <Link to="/#catalog" className={linkClass} style={linkStyle}>Конструктор</Link>
            <Link to="/designer-service" className={linkClass} style={linkStyle}>Соберем журнал за вас</Link>
          </div>

          {/* Column 3 — 2 links */}
          <div className="flex flex-col" style={{ gap: 'clamp(10px, 0.972vw, 19px)' }}>
            <Link to="/#offer" className={linkClass} style={linkStyle}>Договор оферты</Link>
            <Link to="/#privacy" className={linkClass} style={linkStyle}>Политика конфиденциальности</Link>
          </div>
        </div>

        {/* Social buttons — pushed to the right */}
        <div
          className="flex items-start"
          style={{
            marginLeft: 'auto',
            gap: 'clamp(8px, 0.764vw, 15px)',
          }}
        >
          <a
            href="#vk"
            className="flex items-center justify-center no-underline font-['Helvetica'] font-normal text-black border border-black hover:bg-black hover:text-white transition-colors"
            style={{
              width: 'clamp(32px, 2.917vw, 56px)',
              height: 'clamp(32px, 2.917vw, 56px)',
              fontSize: 'clamp(20px, 1.389vw, 27px)',
              lineHeight: '1.15',
            }}
          >
            ВК
          </a>
          <a
            href="#telegram"
            className="flex items-center justify-center no-underline font-['Helvetica'] font-normal text-black border border-black hover:bg-black hover:text-white transition-colors"
            style={{
              width: 'clamp(32px, 2.917vw, 56px)',
              height: 'clamp(32px, 2.917vw, 56px)',
              fontSize: 'clamp(20px, 1.389vw, 27px)',
              lineHeight: '1.15',
            }}
          >
            Тг
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
