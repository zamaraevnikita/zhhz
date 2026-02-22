import { useState, useCallback, useRef } from 'react';
import { deepClone } from '../utils';

export interface UseHistoryReturn<T> {
    /** Текущее значение */
    current: T;
    /** Обновить значение и записать в историю */
    set: (value: T) => void;
    /** Обновить значение БЕЗ записи в историю (для промежуточных обновлений, напр. drag) */
    replace: (value: T) => void;
    /** Записать текущее значение в историю (напр. по mouseUp после drag) */
    commit: () => void;
    /** Отменить */
    undo: () => void;
    /** Повторить */
    redo: () => void;
    /** Можно ли отменить */
    canUndo: boolean;
    /** Можно ли повторить */
    canRedo: boolean;
}

/**
 * Универсальный хук для undo/redo.
 * Используется в редакторе разворотов и в админ-панели.
 */
export function useHistory<T>(initial: T, maxLength = 20): UseHistoryReturn<T> {
    const [current, setCurrent] = useState<T>(initial);
    const [history, setHistory] = useState<T[]>([deepClone(initial)]);
    const [index, setIndex] = useState(0);
    const currentRef = useRef(current);
    currentRef.current = current;

    const set = useCallback((value: T) => {
        setCurrent(value);
        setHistory(prev => {
            const next = prev.slice(0, index + 1);
            next.push(deepClone(value));
            if (next.length > maxLength) next.shift();
            return next;
        });
        setIndex(prev => Math.min(prev + 1, maxLength - 1));
    }, [index, maxLength]);

    const replace = useCallback((value: T) => {
        setCurrent(value);
    }, []);

    const commit = useCallback(() => {
        const value = currentRef.current;
        setHistory(prev => {
            const next = prev.slice(0, index + 1);
            next.push(deepClone(value));
            if (next.length > maxLength) next.shift();
            return next;
        });
        setIndex(prev => Math.min(prev + 1, maxLength - 1));
    }, [index, maxLength]);

    const undo = useCallback(() => {
        setIndex(prev => {
            if (prev > 0) {
                const newIndex = prev - 1;
                setHistory(h => {
                    setCurrent(deepClone(h[newIndex]));
                    return h;
                });
                return newIndex;
            }
            return prev;
        });
    }, []);

    const redo = useCallback(() => {
        setIndex(prev => {
            setHistory(h => {
                if (prev < h.length - 1) {
                    const newIndex = prev + 1;
                    setCurrent(deepClone(h[newIndex]));
                    return h;
                }
                return h;
            });
            return prev < history.length - 1 ? prev + 1 : prev;
        });
    }, [history.length]);

    return {
        current,
        set,
        replace,
        commit,
        undo,
        redo,
        canUndo: index > 0,
        canRedo: index < history.length - 1,
    };
}
