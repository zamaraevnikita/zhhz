import { type FC, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import yandexLogo from '../assets/yandex.png';
import sdekLogo from '../assets/sdek.png';
import { THEMES } from '../themes';
import { ThemeConfig } from '../types';

interface ProductPageProps {
  onSelectTheme?: (theme: ThemeConfig) => void;
}

const ProductPage: FC<ProductPageProps> = ({ onSelectTheme }) => {
  const { id } = useParams();
  
  // States for interactive logic
  const [prodTime, setProdTime] = useState<'4days' | '1day'>('4days');
  const [pagesCount, setPagesCount] = useState<number>(16);
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'courier'>('pickup');
  const [deliveryType, setDeliveryType] = useState<'yandex' | 'sdek'>('yandex');

  // Ensure window is at top when routing to this component
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const pageOptions = [16, 20, 24, 28, 32];

  return (
    <div className="min-h-screen relative bg-white overflow-x-hidden">
      <Navbar variant="light" />

      <main className="flex flex-col w-full mx-auto page-container font-['Inter'] relative text-black items-center self-center">
        
        {/* TOP SECTION: Left (Details) + Right (Image) */}
        <section 
          className="grid w-full"
          style={{ 
            gridTemplateColumns: 'clamp(120px, 35.694vw, 685px) clamp(150px, 48.75vw, 936px)',
            justifyContent: 'center',
            paddingTop: 'clamp(80px, 9.375vw, 180px)',
            gap: 'clamp(30px, 4.93vw, 95px)'
          }}
        >
          
          {/* ── LEFT COLUMN (Details & Options) ── */}
          <div 
            className="flex flex-col justify-between h-full w-full" 
          >
            {/* Title block */}
            <h1 
              className="font-['Syncopate'] uppercase"
              style={{
                fontWeight: 400,
                fontSize: 'clamp(14px, 1.389vw, 27px)',
                lineHeight: '1.2',
                letterSpacing: '-0.03em'
              }}
            >
              Журнал а4 с ламинацией
              <br />
              Обложки "Ревью"
            </h1>

            {/* Количество страниц */}
              <div>
                <p style={{ fontSize: 'clamp(10px, 0.903vw, 17px)', color: '#000', marginBottom: 'clamp(8px, 0.556vw, 11px)' }}>
                  Количество страниц
                </p>
                {/* Number selector row */}
                <div className="flex w-full" style={{ gap: 'clamp(10px, 0.694vw, 13px)' }}>
                  {pageOptions.map(num => (
                    <button
                      key={num}
                      onClick={() => setPagesCount(num)}
                      className="flex justify-center items-center flex-1 transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: pagesCount === num ? '#F4D9E2' : '#FFFFFF',
                        border: pagesCount === num ? '1px solid transparent' : '1px solid #000',
                        height: 'clamp(30px, 2.5vw, 48px)',
                        fontSize: 'clamp(12px, 1.1vw, 21px)'
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
                
              {/* Идеальное кол-во фото */}
              <div>
                <p style={{ fontSize: 'clamp(10px, 0.903vw, 17px)', color: '#000', marginBottom: 'clamp(4px, 0.278vw, 5px)' }}>
                  Идеальное кол-во фото
                </p>
                <p style={{ fontSize: 'clamp(12px, 1.25vw, 24px)' }}>От 16 до 26</p>
              </div>

              {/* Размер */}
              <div>
                <p style={{ fontSize: 'clamp(10px, 0.903vw, 17px)', color: '#000', marginBottom: 'clamp(4px, 0.278vw, 5px)' }}>
                  Размер
                </p>
                <p style={{ fontSize: 'clamp(14px, 1.25vw, 24px)' }}>210*297 мм</p>
              </div>

              {/* Срок производства */}
              <div>
                <p style={{ fontSize: 'clamp(10px, 0.903vw, 17px)', color: '#000', marginBottom: 'clamp(8px, 0.556vw, 11px)' }}>
                  Срок производства без доставки
                </p>
                <div className="flex w-full" style={{ gap: 'clamp(10px, 0.694vw, 13px)' }}>
                  <button
                    onClick={() => setProdTime('4days')}
                    className="flex justify-center items-center transition-opacity hover:opacity-80 flex-1"
                    style={{
                      maxWidth: 'clamp(100px, 10vw, 192px)',
                      backgroundColor: prodTime === '4days' ? '#F4D9E2' : '#FFFFFF',
                      border: prodTime === '4days' ? '1px solid transparent' : '1px solid #000',
                      height: 'clamp(25px, 2.5vw, 48px)',
                      fontSize: 'clamp(11px, 1.1vw, 21px)'
                    }}
                  >
                    4 дня
                  </button>
                  <button
                    onClick={() => setProdTime('1day')}
                    className="flex justify-center items-center transition-opacity hover:opacity-80 flex-1"
                    style={{
                      maxWidth: 'clamp(150px, 15vw, 288px)',
                      backgroundColor: prodTime === '1day' ? '#F4D9E2' : '#FFFFFF',
                      border: prodTime === '1day' ? '1px solid transparent' : '1px solid #000',
                      height: 'clamp(25px, 2.5vw, 48px)',
                      fontSize: 'clamp(11px, 1.1vw, 21px)'
                    }}
                  >
                    1 день (+600р.)
                  </button>
                </div>
              </div>

              {/* Бумага */}
              <div>
                <p style={{ fontSize: 'clamp(10px, 0.903vw, 17px)', color: '#000', marginBottom: 'clamp(4px, 0.278vw, 5px)' }}>
                  Бумага
                </p>
                <p style={{ fontSize: 'clamp(12px, 1.25vw, 24px)', lineHeight: '1.2' }}>
                  Обложка 160г/м2, внутренние блоки глянцевые 120г/м2
                </p>
              </div>

            {/* Action Buttons */}
            <div 
              className="flex w-full mt-2" 
              style={{ gap: 'clamp(10px, 0.694vw, 13px)' }}
            >
              <button
                onClick={() => {
                   if (onSelectTheme) {
                       // Find base theme or default to the first one available
                       const theme = THEMES.find(t => t.id === 'lookbook') || THEMES.find(t => t.id === 'valentine') || THEMES[0];
                       onSelectTheme(theme);
                   }
                }}
                className="flex flex-col flex-1 justify-center items-center transition-opacity hover:opacity-80 text-center"
                style={{
                  backgroundColor: '#383838',
                  color: '#FFF',
                  height: 'clamp(55px, 4.5vw, 86px)',
                  padding: 'clamp(8px, 0.556vw, 11px) 0',
                  gap: 'clamp(4px, 0.278vw, 5px)'
                }}
              >
                <span style={{ fontSize: 'clamp(11px, 1vw, 19px)' }}>Собрать в конструкторе</span>
                <span style={{ fontSize: 'clamp(13px, 1.2vw, 23px)', fontWeight: 'bold' }}>3000 ₽</span>
              </button>
              <Link
                to="/designer-service"
                className="flex flex-col flex-1 justify-center items-center transition-opacity hover:opacity-80 text-center"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #000',
                  color: '#111',
                  height: 'clamp(55px, 4.5vw, 86px)',
                  padding: 'clamp(4px, 0.278vw, 5px) 0',
                  gap: 'clamp(1px, 0.069vw, 1px)'
                }}
              >
                <span style={{ fontSize: 'clamp(11px, 1vw, 19px)' }}>Сделать заказ дизайнеру</span>
                <span style={{ fontSize: 'clamp(8px, 0.7vw, 13px)', color: '#737373' }}>(персональная сборка)</span>
                <span style={{ fontSize: 'clamp(13px, 1.2vw, 23px)', fontWeight: 'bold' }}>6500 ₽</span>
              </Link>
            </div>

          </div>

          {/* ── RIGHT COLUMN (Product Gallery) ── */}
          <div 
            className="flex flex-col relative w-full"
          >
            {/* Gallery Image Box (702x588 in Figma) */}
            <div 
              className="w-full bg-[#D9D9D9] relative"
              style={{ aspectRatio: '702 / 588' }}
            >
              <div 
                className="absolute inset-y-0 w-full flex items-center justify-between"
                style={{ padding: '0 clamp(10px, 1.32vw, 25px)' }}
              >
                <button className="w-[clamp(25px,3vw,40px)] h-[clamp(25px,3vw,40px)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform rotate-180 shadow-md rounded-full bg-white">
                  <svg width="100%" height="100%" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14.5" cy="14.5" r="14.5" transform="matrix(-1 0 0 1 29 0)" fill="white"/>
                    <path d="M14.7 19L21 14.5L14.7 10" stroke="black"/>
                    <path d="M21 14.5H5.7" stroke="black"/>
                  </svg>
                </button>
                
                <button className="w-[clamp(25px,3vw,40px)] h-[clamp(25px,3vw,40px)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-md rounded-full bg-white">
                  <svg width="100%" height="100%" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14.5" cy="14.5" r="14.5" transform="matrix(-1 0 0 1 29 0)" fill="white"/>
                    <path d="M14.7 19L21 14.5L14.7 10" stroke="black"/>
                    <path d="M21 14.5H5.7" stroke="black"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: Delivery & Print Info */}
        <section 
          className="grid w-full"
          style={{ 
            gridTemplateColumns: 'clamp(120px, 22.222vw, 427px) clamp(250px, 62.152vw, 1193px)',
            justifyContent: 'center',
            marginTop: 'clamp(30px, 5vw, 96px)',
            gap: 'clamp(30px, 4.93vw, 95px)'
          }}
        >
          {/* ── LEFT COLUMN (Delivery Calculator) ── */}
          <div className="flex flex-col w-full">
            <h3 
              className="font-['Syncopate'] uppercase w-full"
              style={{
                fontSize: 'clamp(11px, 0.972vw, 19px)',
                marginBottom: 'clamp(15px, 2vw, 38px)'
              }}
            >
              РАССЧИТАТЬ СРОКИ ДОСТАВКИ
            </h3>
            
            <div 
              className="flex flex-col justify-between border border-[#989797] h-full"
              style={{ padding: 'clamp(15px, 2vw, 38px)' }}
            >
               {/* Самовывоз / Курьер tabs */}
               <div className="flex w-full" style={{ gap: 'clamp(10px, 0.694vw, 13px)' }}>
                 <button 
                   onClick={() => setDeliveryOption('pickup')}
                   className={`flex-1 flex justify-center items-center font-['Inter'] border transition-all ${deliveryOption === 'pickup' ? 'bg-[#F4D9E2] border-transparent text-[#111]' : 'bg-white border-[#111] text-[#111]'}`} 
                   style={{ height: 'clamp(30px, 3vw, 58px)', fontSize: 'clamp(11px, 0.9vw, 17px)' }}
                 >
                   Самовывоз
                 </button>
                 <button 
                   onClick={() => {
                     setDeliveryOption('courier');
                     setDeliveryType('sdek');
                   }}
                   className={`flex-1 flex justify-center items-center font-['Inter'] border transition-all ${deliveryOption === 'courier' ? 'bg-[#F4D9E2] border-transparent text-[#111]' : 'bg-white border-[#111] text-[#111]'}`} 
                   style={{ height: 'clamp(30px, 3vw, 58px)', fontSize: 'clamp(11px, 0.9vw, 17px)' }}
                 >
                   Курьер
                 </button>
               </div>
               
               {/* Город */}
               <div className="flex w-full justify-center">
                 <div className="flex justify-center items-center border-b border-black w-full" style={{ paddingBottom: 'clamp(6px, 0.417vw, 8px)' }}>
                    <span style={{ fontSize: 'clamp(11px, 0.9vw, 17px)' }} className="flex items-center gap-2 cursor-pointer">
                      Москва 
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 6L0 0H10L5 6Z" fill="black"/>
                      </svg>
                    </span>
                 </div>
               </div>

               {/* Яндекс / Sdek logos row */}
               <div className={`flex w-full ${deliveryOption === 'courier' ? 'justify-center' : 'justify-between'}`} style={{ gap: 'clamp(10px, 2vw, 38px)' }}>
                 {deliveryOption === 'pickup' && (
                   <button 
                     onClick={() => setDeliveryType('yandex')}
                     className={`flex-1 flex justify-center items-center bg-[#FBFBFB] transition-all hover:scale-[1.02] border-[0.5px] ${deliveryType === 'yandex' ? 'border-[#969696]' : 'border-transparent'}`} 
                     style={{ height: 'clamp(35px, 3vw, 58px)' }}
                   >
                     <img src={yandexLogo} alt="Яндекс" className="h-[60%] object-contain" />
                   </button>
                 )}
                 <button 
                   onClick={() => setDeliveryType('sdek')}
                   className={`${deliveryOption === 'courier' ? 'w-[47.24%]' : 'flex-1'} flex justify-center items-center bg-[#FBFBFB] transition-all hover:scale-[1.02] border-[0.5px] ${deliveryType === 'sdek' ? 'border-[#969696]' : 'border-transparent'}`} 
                   style={{ height: 'clamp(35px, 3vw, 58px)' }}
                 >
                   <img src={sdekLogo} alt="СДЭК" className="h-[40%] object-contain" />
                 </button>
               </div>

               {/* Delivery Text */}
               <div className="flex flex-col">
                 <p style={{ fontSize: 'clamp(11px, 0.95vw, 18px)', color: '#000', marginBottom: 'clamp(2px, 0.139vw, 3px)' }}>
                   Доставка до 3х дней
                 </p>
                 <p style={{ fontSize: 'clamp(9px, 0.77vw, 15px)', color: '#989797', lineHeight: '1.2', marginBottom: 'clamp(10px, 1.5vw, 29px)' }}>
                   Отправляем заказы день в день, либо на следующий
                   <br />
                   день после готовности в печати.
                 </p>
                 <p style={{ fontSize: 'clamp(11px, 0.95vw, 18px)', color: '#000' }}>
                   Стоимость: 230₽
                 </p>
               </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (Print & Delivery Info Box) ── */}
          <div className="flex flex-col w-full h-full">
            <h3 
              className="font-['Syncopate'] uppercase w-full"
              style={{
                fontSize: 'clamp(11px, 0.972vw, 19px)',
                marginBottom: 'clamp(15px, 2vw, 38px)',
                visibility: 'hidden'
              }}
            >
              SPACER
            </h3>
            
            <div 
              className="bg-white border flex justify-between items-start h-full w-full relative"
              style={{ 
                borderColor: '#989797',
                padding: 'clamp(20px, 2.5vw, 48px)',
                gap: 'clamp(15px, 3vw, 58px)'
              }}
            >
              {/* ПЕЧАТЬ */}
              <div className="flex flex-col flex-1 w-1/2" style={{ paddingRight: 'clamp(5px, 1vw, 19px)' }}>
                <h2 
                  className="font-['Syncopate'] uppercase"
                  style={{ fontSize: 'clamp(11px, 0.972vw, 19px)', marginBottom: 'clamp(15px, 1.5vw, 29px)' }}
                >
                  ПЕЧАТЬ
                </h2>
                <p style={{ fontSize: 'clamp(10px, 0.9vw, 17px)', lineHeight: '1.4' }}>
                  Страницы будут напечатаны на гладкой глянцевой бумаге. Печатаем на профессиональном типографском оборудовании цифровым офсетом. Это позволяет добиться журнального качества. Дополнительно каждая обложка ламинируется глянцевой пленкой для придания блеска. Все журналы скрепляются на скобу. Если хотите оформить заказ на клеевой переплет - обратитесь к менеджеру (заполните заявку на индивидуальный заказ).
                  <br />
                  ВАЖНО! Цвета в напечатанном варианте могут отличаться от того, что вы видите на экране. Это зависит от калибровки монитора, яркости, насыщенности экрана вашего устройства.
                </p>
              </div>
              
              {/* Vertical Divider */}
              <div 
                className="absolute left-1/2 w-[1px] bg-[#989797] transform -translate-x-1/2" 
                style={{ top: '28%', height: '44%' }}
              ></div>

              {/* ДОСТАВКА */}
              <div className="flex flex-col flex-1 w-1/2" style={{ paddingLeft: 'clamp(5px, 1vw, 19px)' }}>
                <h2 
                  className="font-['Syncopate'] uppercase"
                  style={{ fontSize: 'clamp(11px, 0.972vw, 19px)', marginBottom: 'clamp(15px, 1.5vw, 29px)' }}
                >
                  ДОСТАВКА
                </h2>
                <div style={{ fontSize: 'clamp(10px, 0.9vw, 17px)', lineHeight: '1.4' }}>
                  <ul style={{ listStyleType: 'disc', paddingLeft: 'clamp(18px, 1.25vw, 24px)', marginBottom: 'clamp(15px, 1.5vw, 29px)' }}>
                    <li>До Москвы 2-3 дня, до Московской области 3-4 дня.</li>
                    <li>По России от 3-х рабочих дней, не включая время на производство.</li>
                  </ul>
                  
                  <div style={{ marginBottom: 'clamp(15px, 1.5vw, 29px)' }}>
                    <strong>Курьер</strong><br />
                    Доставка осуществляется с 09:00 до 22:00 по будням и с 10:00 до 18:00 по выходным. В день доставки вам придет СМС и позвонят за 30-60 минут.
                  </div>
                  
                  <div>
                    <strong>Самовывоз из пункта выдачи</strong><br />
                    При поступлении заказа в пункт, вы получите СМС-уведомление. Заказ будет ждать вас в пункте выдачи 14 дней, в постамате - 3 дня.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: FAQ */}
        <section 
          className="flex flex-col items-center w-full"
          style={{ 
            marginTop: 'clamp(40px, 5vw, 96px)',
            paddingBottom: 'clamp(120px, 8.333vw, 160px)'
          }}
        >
          <h2 
            className="font-['Syncopate'] uppercase text-center"
            style={{ 
              fontSize: 'clamp(16px, 1.944vw, 37px)',
              marginBottom: 'clamp(20px, 2.5vw, 48px)' 
            }}
          >
            ОСТАЛИСЬ ВОПРОСЫ?
          </h2>
          
          <div className="flex flex-col" style={{ gap: 'clamp(12px, 1.5vw, 29px)' }}>
            <Link 
              to="#" 
              className="bg-white border border-black flex justify-center items-center transition-all hover:bg-black hover:text-white"
              style={{ 
                width: 'clamp(200px, 20vw, 384px)', 
                height: 'clamp(35px, 3.5vw, 67px)' 
              }}
            >
              <span className="font-['Inter']" style={{ fontSize: 'clamp(11px, 0.9vw, 17px)' }}>Написать в Telegram</span>
            </Link>
            <Link 
              to="#" 
              className="bg-white border border-black flex justify-center items-center transition-all hover:bg-black hover:text-white"
              style={{ 
                width: 'clamp(200px, 20vw, 384px)', 
                height: 'clamp(35px, 3.5vw, 67px)' 
              }}
            >
              <span className="font-['Inter']" style={{ fontSize: 'clamp(11px, 0.9vw, 17px)' }}>Написать во ВКонтакте</span>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default ProductPage;
