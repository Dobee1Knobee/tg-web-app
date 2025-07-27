import {useCallback, useState} from "react";

export const useToast = () => {
    const [toasts,setToasts] = useState([]);
    const addToast = useCallback((message, type = 'success', duration = 5000) => {
        const id = Date.now() + Math.random();

        const newToast = {
            id,
            message,
            type,
            duration
        };

        setToasts(prevToasts => [...prevToasts, newToast]);

        return id;
    }, []);
    const removeToast = useCallback((id) => {
        setToasts(prevToasts => prevToasts.filter((i) => i.id !== id));
    })
    const showSuccess = useCallback((message, duration) =>
        addToast(message, 'success', duration), [addToast]);
    const showError = useCallback((message, duration) =>
        addToast(message, 'error', duration), [addToast]);

    const showWarning = useCallback((message, duration) =>
        addToast(message, 'warning', duration), [addToast]);

    const showInfo = useCallback((message, duration) =>
        addToast(message, 'info', duration), [addToast]);
    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);
    return {
        toasts,           // массив активных уведомлений
        addToast,         // основной метод добавления
        removeToast,      // метод удаления
        showSuccess,      // удобные методы
        showError,
        showWarning,
        showInfo,
        clearAllToasts
    };
}
