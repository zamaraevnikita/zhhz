import React, { useState, useEffect } from 'react';
import { Icons } from './IconComponents';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { login, requestOtp, verifyOtp } = useAuth();
    const [step, setStep] = useState<'login' | 'register' | 'otp'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setStep('login');
            setError(null);
            setOtp('');
            setPhone('');
            setPassword('');
            setName('');
            setEmail('');
            setResendTimer(0);
            setShowPassword(false);
        }
    }, [isOpen]);

    // Resend countdown
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 'otp' && resendTimer > 0) {
            interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, resendTimer]);

    if (!isOpen) return null;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.startsWith('7') || val.startsWith('8')) val = val.substring(1);
        let formatted = '+7';
        if (val.length > 0) formatted += ` (${val.substring(0, 3)}`;
        if (val.length >= 4) formatted += `) ${val.substring(3, 6)}`;
        if (val.length >= 7) formatted += `-${val.substring(6, 8)}`;
        if (val.length >= 9) formatted += `-${val.substring(8, 10)}`;
        setPhone(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (step === 'login') {
                // --- Password-based login (no SMS) ---
                await login(phone, password);
                if (onSuccess) onSuccess();
                onClose();

            } else if (step === 'register') {
                // --- Registration: validate then send OTP ---
                if (!name.trim()) throw new Error('Введите имя и фамилию');
                if (password.length < 6) throw new Error('Пароль должен содержать минимум 6 символов');

                // Pass profile data so backend can save it with OTP entry
                await requestOtp(phone, { name: name.trim(), email: email.trim(), password });
                setResendTimer(60);
                setStep('otp');

            } else if (step === 'otp') {
                // --- Verify SMS code → creates account ---
                await verifyOtp(phone, otp);
                if (onSuccess) onSuccess();
                onClose();
            }
        } catch (err: any) {
            console.error('Auth failed', err);
            setError(err.message || 'Произошла ошибка авторизации');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setIsLoading(true);
        setError(null);
        try {
            await requestOtp(phone, { name: name.trim(), email: email.trim(), password });
            setResendTimer(60);
            setOtp('');
        } catch (err: any) {
            setError(err.message || 'Ошибка при повторной отправке СМС');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <button
                        type="button"
                        onClick={() => {
                            if (step === 'otp') { setStep('register'); setError(null); setOtp(''); }
                            else onClose();
                        }}
                        className="text-gray-400 hover:text-gray-900 transition-colors w-8"
                    >
                        {step === 'otp' && <Icons.ChevronRight className="-rotate-90" size={20} />}
                    </button>
                    <h3 className="text-xl font-bold flex-1 text-center">
                        {step === 'login' ? 'Вход' : step === 'register' ? 'Регистрация' : 'Код из СМС'}
                    </h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors w-8">
                        <Icons.Close size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-3">
                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                            <Icons.TriangleAlert size={16} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* OTP STEP */}
                    {step === 'otp' ? (
                        <>
                            <p className="text-center text-sm text-gray-600 pb-1">
                                Отправили код на <b>{phone}</b><br />
                                <span className="text-xs text-gray-400">(В реальности — в СМС. Для теста: консоль сервера)</span>
                            </p>
                            <div className="space-y-1 relative">
                                <label className="text-sm font-medium text-gray-700">Код из СМС</label>
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    maxLength={4}
                                    autoFocus
                                    className="w-full text-center tracking-widest text-2xl px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="----"
                                />
                            </div>
                            <div className="text-center pt-2 border-t border-gray-100">
                                {resendTimer > 0
                                    ? <p className="text-sm text-gray-500">Повторный код через {resendTimer} сек.</p>
                                    : <button type="button" onClick={handleResend} disabled={isLoading}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50">
                                        Отправить код повторно
                                    </button>
                                }
                            </div>
                        </>
                    ) : step === 'register' ? (
                        /* REGISTER STEP */
                        <>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Имя и Фамилия <span className="text-red-500">*</span></label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                                    className={inputClass} placeholder="Иван Иванов" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">
                                    Email <span className="text-gray-400 text-xs font-normal">(для чеков)</span>
                                </label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    className={inputClass} placeholder="ivan@example.com" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Номер телефона <span className="text-red-500">*</span></label>
                                <input type="tel" required value={phone} onChange={handlePhoneChange}
                                    maxLength={18} className={inputClass} placeholder="+7 (999) 000-00-00" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Пароль <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} required value={password}
                                        onChange={e => setPassword(e.target.value)} minLength={6}
                                        className={inputClass + ' pr-10'} placeholder="Минимум 6 символов" />
                                    <button type="button" onClick={() => setShowPassword(p => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <Icons.Eye size={18} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 text-center">
                                Для подтверждения телефона отправим SMS-код (один раз)
                            </p>
                        </>
                    ) : (
                        /* LOGIN STEP */
                        <>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Номер телефона</label>
                                <input type="tel" required value={phone} onChange={handlePhoneChange}
                                    maxLength={18} className={inputClass} placeholder="+7 (999) 000-00-00" autoFocus />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Пароль</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} required value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className={inputClass + ' pr-10'} placeholder="Ваш пароль" />
                                    <button type="button" onClick={() => setShowPassword(p => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <Icons.Eye size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-lg font-bold mt-2 transition-all disabled:opacity-70 flex justify-center items-center h-12"
                    >
                        {isLoading
                            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : step === 'otp' ? 'Создать аккаунт'
                                : step === 'register' ? 'Получить SMS-код →'
                                    : 'Войти'
                        }
                    </button>

                    {step !== 'otp' && (
                        <div className="text-center pt-1">
                            <button type="button"
                                onClick={() => { setStep(step === 'login' ? 'register' : 'login'); setError(null); setPassword(''); setName(''); setEmail(''); }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {step === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
