import { type FC } from 'react';
import { Navbar } from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';


const AboutPage: FC = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center">
      <Navbar variant="light" />

      {/* spacer for fixed navbar */}
      <div style={{ height: 'clamp(50px, 4.65vw, 89px)', width: '100%' }} />

      <main 
        className="page-container flex-1 flex flex-col w-full"
        style={{
          padding: '0 clamp(28px, 3.472vw, 67px)', // matched global standard padding
        }}
      >
        {/* ── HERO IMAGE ── */}
        <div 
          className="w-full bg-[#D9D9D9]"
          style={{
            marginTop: 'clamp(20px, 2.4vw, 35px)',
            // 350px / 1440px = 24.306vw. Max at 1920px = 466px
            height: 'clamp(200px, 24.306vw, 466px)',
          }}
        />

        {/* ── О РЕВЬЮ ── */}
        <section 
          className="flex justify-between items-start"
          style={{ marginTop: 'clamp(20px, 2.083vw, 40px)' }}
        >
          {/* Left: Text */}
          <div className="flex flex-col shrink-0" style={{ width: 'clamp(300px, 37.917vw, 728px)' }}>
            <h2 
              className="font-['Syncopate'] uppercase text-black"
              style={{
                fontWeight: 400,
                fontSize: 'clamp(20px, 1.944vw, 37px)',
                lineHeight: 'clamp(18px, 1.736vw, 33px)',
                marginBottom: 'clamp(15px, 2.778vw, 53px)',
              }}
            >
              О РЕВЬЮ
            </h2>
            <p 
              className="font-['Helvetica'] text-black"
              style={{
                fontSize: 'clamp(11px, 0.972vw, 19px)',
                lineHeight: '1.4',
              }}
            >
              Мы пересмотрели подход к подаркам и создали конструктор с готовыми идеями, чтобы вы могли напомнить близким людям как сильно их любите!
              <br /><br />
              Мы хотим делать упор на креатив и дизайн. В Ревью ежедневно создаются персональные журналы для совершенно разных людей, профессий и возрастов. Растем вместе с вами с 2022 года.
            </p>
          </div>

          {/* Right: Images row */}
          <div className="flex flex-col items-start">
            <div className="flex" style={{ gap: 'clamp(6px, 0.764vw, 15px)' }}>
              {[1, 2, 3, 4].map(idx => (
                <div 
                  key={idx}
                  className="bg-[#D9D9D9]"
                  style={{
                    width: 'clamp(90px, 12.292vw, 236px)',
                    aspectRatio: '177 / 239',
                  }}
                />
              ))}
            </div>
            <p 
              className="font-['Inter'] text-[#737373]"
              style={{
                fontSize: 'clamp(9px, 0.778vw, 15px)',
                marginTop: 'clamp(10px, 1.111vw, 21px)'
              }}
            >
              Работа с блогерами и отметки в социальных сетях
            </p>
          </div>
        </section>

        {/* ── ПЕЧАТЬ ── */}
        <section 
          className="flex justify-between items-start"
          style={{ marginTop: 'clamp(80px, 10.417vw, 200px)' }}
        >
          {/* Left: Images */}
          <div className="flex flex-col shrink-0" style={{ width: 'clamp(400px, 51.6vw, 991px)' }}>
            <h2 
              className="font-['Syncopate'] uppercase text-black"
              style={{
                fontWeight: 400,
                fontSize: 'clamp(20px, 1.944vw, 37px)',
                lineHeight: 'clamp(18px, 1.736vw, 33px)',
                marginBottom: 'clamp(15px, 2.778vw, 53px)',
              }}
            >
              ПЕЧАТЬ
            </h2>
            <div className="flex" style={{ gap: 'clamp(6px, 0.764vw, 15px)' }}>
              <div 
                className="bg-[#D9D9D9]"
                style={{ width: 'clamp(200px, 25.764vw, 495px)', aspectRatio: '371 / 239' }}
              />
              <div 
                className="bg-[#D9D9D9]"
                style={{ width: 'clamp(200px, 25.833vw, 496px)', aspectRatio: '372 / 239' }}
              />
            </div>
          </div>

          {/* Right: Text */}
          <div 
            className="flex flex-1 justify-end pl-8"
            style={{ marginTop: 'clamp(33px, 4.514vw, 86px)' }}
          >
            <p 
              className="font-['Inter'] text-black"
              style={{
                maxWidth: 'clamp(350px, 39.236vw, 753px)',
                fontSize: 'clamp(11px, 0.972vw, 19px)',
                lineHeight: '1.4',
              }}
            >
              Фотографии будут напечатаны на гладкой бумаге глянцевыми красками: такой выбор позволяет максимально точно передать насыщенность и все оттенки исходных снимков. Дополнительно каждая обложка ламинируется глянцевой пленкой для придания блеска. Плотность бумаги: обложка 160 г/м2, внутренние блоки 120 г/м2
              <br /><br />
              Все журналы скрепляются на скобу. Если хотите оформить заказ на клеевой переплет - обратитесь к менеджеру.
            </p>
          </div>
        </section>

        {/* ── ДОСТАВКА & КОНТАКТЫ ── */}
        <section 
          className="flex justify-between items-start"
          style={{ 
            marginTop: 'clamp(80px, 12.5vw, 240px)',
            marginBottom: 'clamp(50px, 6.25vw, 120px)'
          }}
        >
          {/* Доставка */}
          <div className="flex flex-col" style={{ width: 'calc(50% - clamp(20px, 3vw, 50px))' }}>
            <h2 
              className="font-['Syncopate'] uppercase text-black"
              style={{
                fontWeight: 400,
                fontSize: 'clamp(20px, 1.944vw, 37px)',
                lineHeight: 'clamp(18px, 1.736vw, 33px)',
                marginBottom: 'clamp(15px, 2.778vw, 53px)',
              }}
            >
              ДОСТАВКА
            </h2>
            <div 
              className="font-['Helvetica'] text-black"
              style={{
                fontSize: 'clamp(11px, 0.972vw, 19px)',
                lineHeight: 'clamp(15px, 1.111vw, 21px)',
              }}
            >
              <p>Доставка осуществляется транспортной компанией СДЕК.</p>
              <br />
              <p>
                Сроки доставки:<br />
                По Москве и Московской области – 1-2 рабочих дня, не включая время на производство.<br />
                По России – от 3-х рабочих дней, не включая время на производство.
              </p>
              <br />
              <p>
                Курьер<br />
                Доставка осуществляется с 09:00 до 22:00 по будням и с 10:00 до 18:00 по выходным.<br />
                В день доставки вам придет СМС и позвонят за 30-60 минут.
              </p>
              <br />
              <p>
                Самовывоз из пункта выдачи<br />
                При поступлении заказа в пункт, вы получите СМС-уведомление.<br />
                Заказ будет ждать вас в пункте выдачи 14 дней, в постамате - 3 дня.
              </p>
            </div>
          </div>

          {/* Контакты */}
          <div className="flex flex-col" style={{ width: 'calc(50% - clamp(20px, 3vw, 50px))' }}>
            <h2 
              className="font-['Syncopate'] uppercase text-black"
              style={{
                fontWeight: 400,
                fontSize: 'clamp(20px, 1.944vw, 37px)',
                lineHeight: 'clamp(18px, 1.736vw, 33px)',
                marginBottom: 'clamp(15px, 2.778vw, 53px)',
              }}
            >
              КОНТАКТЫ
            </h2>
            <div 
              className="font-['Helvetica'] text-black"
              style={{
                fontSize: 'clamp(11px, 0.972vw, 19px)',
                lineHeight: 'clamp(15px, 1.111vw, 21px)',
              }}
            >
              <p>Служба поддержки и сотрудничество:</p>
              <br />
              <p>
                Почта: <a href="mailto:reviewmagazine@mail.ru" className="underline hover:opacity-70 transition-opacity">reviewmagazine@mail.ru</a><br />
                Написать в <a href="#telegram" className="underline hover:opacity-70 transition-opacity">Telegram-bot</a><br />
                Написать во <a href="#vk" className="underline hover:opacity-70 transition-opacity">Вконтакте</a>
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
