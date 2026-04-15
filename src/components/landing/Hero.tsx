import { type FC } from 'react';
import { Navbar } from './Navbar';
import heroBg from '../../assets/hero.jpg';

const Hero: FC = () => {
  return (
    <section
      className="relative w-full"
      style={{ height: 'clamp(500px, 100svh, 1000px)' }}
      id="about"
    >
      {/* Фон: cover гарантирует заполнение, center — фокус по центру */}
      <div
        className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat z-0"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <Navbar scrollAware />
    </section>
  );
};

export default Hero;
