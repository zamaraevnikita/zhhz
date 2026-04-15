import { type FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import logoBlack from '../../assets/logo_black.png';

interface NavbarProps {
  variant?: 'dark' | 'light';
  scrollAware?: boolean;
}

export const Navbar: FC<NavbarProps> = ({ variant = 'dark', scrollAware = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!scrollAware) return;

    const handleScroll = () => {
      // Порог — 80% высоты viewport (примерно конец Hero)
      const threshold = window.innerHeight * 0.8;
      setIsScrolled(window.scrollY > threshold);
    };

    // Проверяем начальное положение (на случай reload в середине страницы)
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollAware]);

  // Определяем активный режим: если scrollAware, то переключаем dark↔light по скроллу
  const activeVariant = scrollAware ? (isScrolled ? 'light' : 'dark') : variant;

  const iconColor = activeVariant === 'light' ? '#000000' : '#FFFFFF';
  const iconStroke = activeVariant === 'light' ? 'black' : 'white';

  const menuLinkStyle = (topVw: string) => ({
    position: 'absolute' as const,
    top: topVw,
    fontSize: 'clamp(14px, 0.972vw, 19px)',
    lineHeight: '1.15',
  });

  return (
    <>
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full z-20"
        style={{
          maxWidth: '1920px',
          backgroundColor: activeVariant === 'light' ? '#FFFFFF' : 'transparent',
          boxShadow: activeVariant === 'light' ? '0 1px 8px rgba(0,0,0,0.08)' : 'none',
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <nav
          className="relative w-full flex items-center justify-between"
          style={{
            height: 'clamp(50px, 4.65vw, 89px)',
            padding: '0 clamp(24px, 3.472vw, 67px)',
          }}
        >
          {/* Бургер */}
          <button
            aria-label="Меню"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col justify-center cursor-pointer shrink-0 hover:opacity-70 transition-all duration-300 bg-transparent border-none p-0"
            style={{
              gap: 'clamp(3px, 0.35vw, 7px)',
              width: 'clamp(18px, 1.67vw, 32px)',
              transform: menuOpen ? 'rotate(-90deg)' : 'rotate(0deg)',
              transformOrigin: 'center center',
            }}
          >
            <span className="block w-full h-[1px]" style={{ background: menuOpen ? '#737373' : iconColor, transition: 'background 0.3s ease' }} />
            <span className="block w-full h-[1px]" style={{ background: menuOpen ? '#737373' : iconColor, transition: 'background 0.3s ease' }} />
            <span className="block w-full h-[1px]" style={{ background: menuOpen ? '#737373' : iconColor, transition: 'background 0.3s ease' }} />
          </button>

          {/* Логотип по центру */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 top-0 h-full flex items-center">
            <img
              src={activeVariant === 'light' ? logoBlack : logo}
              alt="РЕВЬЮ"
              className="h-auto block"
              style={{ width: 'clamp(90px, 9.5vw, 182px)', transition: 'opacity 0.3s ease' }}
            />
          </Link>

          {/* Иконки справа */}
          <div className="flex items-center shrink-0" style={{ gap: 'clamp(24px, 2.5vw, 48px)' }}>
            <Link to="/projects" aria-label="Мои проекты" className="cursor-pointer flex items-center justify-center bg-transparent border-none p-0 hover:opacity-70 transition-opacity" style={{ width: 'clamp(16px, 1.39vw, 27px)', height: 'clamp(16px, 1.39vw, 27px)' }}>
              <svg className="block w-full h-full" viewBox="0 0 20 20" fill="none">
                <rect x="0.5" y="0.5" width="8.5" height="8.5" stroke={iconStroke} strokeWidth="1" style={{ transition: 'stroke 0.3s ease' }}/>
                <rect x="10.5" y="10.5" width="8.5" height="8.5" stroke={iconStroke} strokeWidth="1" style={{ transition: 'stroke 0.3s ease' }}/>
                <rect x="0.5" y="10.5" width="8.5" height="8.5" stroke={iconStroke} strokeWidth="1" style={{ transition: 'stroke 0.3s ease' }}/>
                <rect x="10.5" y="0.5" width="8.5" height="8.5" stroke={iconStroke} strokeWidth="1" style={{ transition: 'stroke 0.3s ease' }}/>
              </svg>
            </Link>
            <Link to="/cart" aria-label="Корзина" className="cursor-pointer flex items-center justify-center bg-transparent border-none p-0 hover:opacity-70 transition-opacity" style={{ width: 'clamp(16px, 1.39vw, 27px)', height: 'clamp(16px, 1.39vw, 27px)' }}>
              <svg className="block w-full h-full" viewBox="0 0 20 20" fill="none">
                <path d="M0 0.5H2.5L4 6M4 6L5.5 12H17.5L19 6H4Z" stroke={iconStroke} strokeWidth="1" style={{ transition: 'stroke 0.3s ease' }}/>
                <circle cx="8" cy="16.5" r="2.5" stroke={iconStroke} strokeWidth="1" style={{ transition: 'stroke 0.3s ease' }}/>
                <circle cx="15" cy="16.5" r="2.5" stroke={iconStroke} strokeWidth="1" style={{ transition: 'stroke 0.3s ease' }}/>
              </svg>
            </Link>
            <button aria-label="Профиль" className="cursor-pointer flex items-center justify-center bg-transparent border-none p-0 hover:opacity-70 transition-opacity" style={{ width: 'clamp(16px, 1.39vw, 27px)', height: 'clamp(16px, 1.39vw, 27px)' }}>
              <svg className="block w-full h-full" viewBox="0 0 20 20" fill="none">
                <path d="M19.5 19H0.5C0.5 16.8333 2.4 10.5 10 10.5C17.6 10.5 19.5 16.8333 19.5 19Z" stroke={iconStroke} strokeWidth="1" style={{ transition: 'stroke 0.3s ease' }}/>
                <circle cx="10" cy="4.5" r="4" stroke={iconStroke} strokeWidth="1" style={{ transition: 'stroke 0.3s ease' }}/>
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay */}
      <div
        className="fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.3)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Slide-in menu panel */}
      <div
        className="fixed top-0 left-0 z-40 h-full bg-white overflow-y-auto transition-transform duration-300"
        style={{
          width: 'clamp(264px, 18.333vw, 352px)',
          transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Back arrow button */}
        <button
          aria-label="Закрыть меню"
          onClick={() => setMenuOpen(false)}
          className="absolute bg-transparent border-none cursor-pointer p-0 hover:opacity-60 transition-opacity"
          style={{ left: 'clamp(24px, 1.667vw, 32px)', top: 'clamp(25px, 1.736vw, 33px)' }}
        >
          <svg
            width="15"
            height="9"
            viewBox="0 0 15 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="0" y1="4.5" x2="15" y2="4.5" stroke={iconStroke} strokeWidth="1" />
            <line x1="0" y1="4.5" x2="6.3" y2="0.5" stroke={iconStroke} strokeWidth="1" />
            <line x1="0" y1="4.5" x2="6.3" y2="8.5" stroke={iconStroke} strokeWidth="1" />
          </svg>
        </button>

        {/* Menu links */}
        <nav className="flex flex-col" style={{ paddingLeft: 'clamp(24px, 1.667vw, 32px)' }}>
          <Link 
            to="/about" 
            onClick={() => setMenuOpen(false)} 
            className="font-['Helvetica'] font-normal text-black no-underline hover:underline" 
            style={menuLinkStyle('clamp(64px, 4.444vw, 85px)')}
          >
            О нас
          </Link>
          <Link to="/#delivery" onClick={() => setMenuOpen(false)} className="font-['Helvetica'] font-normal text-black no-underline hover:underline" style={menuLinkStyle('clamp(94px, 6.528vw, 125px)')}>Доставка</Link>
          <Link to="/#catalog" onClick={() => setMenuOpen(false)} className="font-['Helvetica'] font-normal text-black no-underline hover:underline" style={menuLinkStyle('clamp(154px, 10.694vw, 205px)')}>Печать</Link>
          <Link to="/#faq" onClick={() => setMenuOpen(false)} className="font-['Helvetica'] font-normal text-black no-underline hover:underline" style={menuLinkStyle('clamp(184px, 12.778vw, 245px)')}>Частые вопросы</Link>
          <Link to="/#contacts" onClick={() => setMenuOpen(false)} className="font-['Helvetica'] font-normal text-black no-underline hover:underline" style={menuLinkStyle('clamp(214px, 14.861vw, 285px)')}>Контакты</Link>
          <Link to="/#constructor" onClick={() => setMenuOpen(false)} className="font-['Helvetica'] font-normal text-black no-underline hover:underline" style={menuLinkStyle('clamp(244px, 16.944vw, 325px)')}>Конструктор</Link>
          <Link
            to="/designer-service"
            onClick={() => setMenuOpen(false)}
            className="font-['Helvetica'] font-normal text-black no-underline hover:underline"
            style={menuLinkStyle('clamp(274px, 19.028vw, 365px)')}
          >
            Соберем журнал за вас
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
