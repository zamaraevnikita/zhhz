import { type FC, useState } from 'react';
import { Navbar } from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { useCart } from '../hooks/useCart';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { AuthModal } from '../components/AuthModal';

/* Карточка товара в корзине */
interface CartItemProps {
  title: string;
  pages: number;
  price: string;
  image?: string;
  onCheckout: () => void;
  status: 'idle' | 'processing' | 'success';
}

const CartItem: FC<CartItemProps> = ({ title, pages, price, image, onCheckout, status }) => (
  <div
    className="flex bg-white relative"
    style={{
      width: 'clamp(444px, 30.833vw, 592px)',
      height: 'clamp(227px, 15.764vw, 303px)',
    }}
  >
    {/* Картинка-превью */}
    <div
      className="shrink-0 border-t border-l border-b border-black"
      style={{
        width: 'clamp(212px, 14.722vw, 283px)',
        height: '100%',
        background: image ? `url(${image}) center/cover no-repeat` : '#CCCCCC',
      }}
    />

    {/* Инфо */}
    <div
      className="flex flex-col justify-between border border-black"
      style={{
        padding: 'clamp(18px, 1.736vw, 33px) clamp(14px, 1.042vw, 20px)',
        flex: 1,
      }}
    >
      <div className="flex flex-col">
        {/* Название */}
        <span
          className="font-['Syncopate'] font-normal uppercase line-clamp-2"
          style={{
            fontSize: 'clamp(15px, 1.042vw, 20px)',
            lineHeight: '1.2',
            letterSpacing: '-0.03em',
            color: '#000000',
            marginBottom: 'clamp(18px, 1.25vw, 24px)',
          }}
        >
          {title}
        </span>

        {/* Страницы */}
        <span
          className="font-['Inter'] font-normal"
          style={{
            fontSize: 'clamp(13px, 0.903vw, 17px)',
            lineHeight: '1.23',
            color: '#000000',
            marginBottom: 'clamp(3px, 0.208vw, 4px)',
          }}
        >
          {pages} стр.
        </span>

        {/* Цена */}
        <span
          className="font-['Syncopate'] font-bold"
          style={{
            fontSize: 'clamp(15px, 1.042vw, 20px)',
            lineHeight: '1',
            letterSpacing: '0',
            color: '#111111',
          }}
        >
          {price}
        </span>
      </div>

      {/* Кнопка */}
      <div>
        <button
          onClick={onCheckout}
          disabled={status === 'processing'}
          className="flex items-center justify-center font-['Helvetica'] font-normal text-white bg-black border border-black cursor-pointer hover:opacity-80 disabled:opacity-50 transition-opacity text-center"
          style={{
            width: 'clamp(197px, 13.681vw, 263px)',
            height: 'clamp(30px, 2.5vw, 45px)',
            fontSize: 'clamp(10px, 0.694vw, 13px)',
            lineHeight: '1',
            letterSpacing: '0',
          }}
        >
          {status === 'processing' ? 'Оформление...' : 'Оформить заказ'}
        </button>
      </div>
    </div>
  </div>
);

export interface CartPageProps {
  projects: Project[];
  onBack: () => void;
}

const CartPage: FC<CartPageProps> = ({ projects, onBack }) => {
  const {
      items,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
  } = useCart();

  const { createOrder } = useOrders();
  const { role, currentUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleCheckout = async (itemId: string) => {
      if (role === 'GUEST') {
          setIsAuthModalOpen(true);
          return;
      }

      setCheckoutStatus('processing');
      try {
          const cartItem = items.find(i => i.id === itemId);
          if (!cartItem) throw new Error('Item not found');
          
          const proj = projects.find(p => p.id === cartItem.projectId);
          const orderItems = [{
              projectId: cartItem.projectId,
              name: proj?.name ?? 'Фотокнига',
              themeId: proj?.themeId ?? '',
              quantity: cartItem.quantity,
              pricePerUnit: cartItem.pricePerUnit,
          }];

          await createOrder({
              customerName: currentUser?.name || 'Гость',
              customerPhone: currentUser?.phone || '+7 (000) 000-00-00',
              customerEmail: currentUser?.email,
              items: orderItems,
              totalAmount: cartItem.pricePerUnit * cartItem.quantity
          });

          setCheckoutStatus('success');
          removeFromCart(itemId);
          
          // Using timeout so the user sees "Success" before navigating away if cart empty
          setTimeout(() => {
              alert('Заказ успешно оформлен! Спасибо за покупку.');
              setCheckoutStatus('idle');
              if (items.length <= 1) {
                  onBack();
              }
          }, 300);

      } catch (error: any) {
          console.error("Checkout failed:", error?.message || error);
          setCheckoutStatus('idle');
          alert(`Ошибка при оформлении заказа: ${error?.message || 'Попробуйте снова.'}`);
      }
  };

  const formatPrice = (price: number) => {
      return `${price.toLocaleString('ru-RU')} ₽`;
  };

  return (
    <div className="landing-page flex flex-col min-h-screen bg-white">
      <Navbar variant="light" />

      {/* spacer for fixed navbar */}
      <div style={{ height: 'clamp(50px, 4.65vw, 89px)' }} />

      {/* Контент */}
      <main
        className="page-container flex-1"
        style={{
          padding: `clamp(50px, 5.139vw, 99px) clamp(24px, 5.347vw, 103px)`,
        }}
      >
        {/* Заголовок */}
        <h1
          className="font-['Syncopate'] font-normal m-0 uppercase"
          style={{
            fontSize: 'clamp(31px, 2.153vw, 41px)',
            lineHeight: '0.9',
            color: '#000000',
            marginBottom: 'clamp(30px, 4.653vw, 89px)',
          }}
        >
          КОРЗИНА
        </h1>

        {/* Товары */}
        <div
          className="flex flex-wrap items-start relative"
          style={{ gap: 'clamp(30px, 5.556vw, 107px)', marginBottom: 'clamp(100px, 15vw, 200px)' }}
        >
          {items.length > 0 ? (
              items.map((item) => {
                const proj = projects.find(p => p.id === item.projectId);
                return (
                    <CartItem 
                        key={item.id} 
                        title={proj?.name || proj?.themeId || 'Проект'}
                        pages={proj?.pages?.length || 0}
                        price={formatPrice(item.pricePerUnit * item.quantity)}
                        image={proj?.theme?.previewImage}
                        onCheckout={() => handleCheckout(item.id)}
                        status={checkoutStatus}
                    />
                );
              })
          ) : (
              <div className="w-full py-10 flex flex-col items-center justify-center opacity-50">
                  <p className="font-['Helvetica'] text-center">Корзина пуста.</p>
              </div>
          )}
        </div>
      </main>

      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default CartPage;
