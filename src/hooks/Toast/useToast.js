import {useCallback, useState} from "react";

export const useToast = () => {
    const [toasts, setToasts] = useState([]);
    const [scheduleToasts, setScheduleToasts] = useState([]); // Добавляем для Schedule Toast

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
    }, []);

    // Новые функции для Schedule Toast
    const addScheduleToast = useCallback((data, duration = 8000) => {
        const id = Date.now() + Math.random();

        const newToast = {
            id,
            data,
            duration
        };

        setScheduleToasts(prevToasts => [...prevToasts, newToast]);

        return id;
    }, []);

    const removeScheduleToast = useCallback((id) => {
        setScheduleToasts(prevToasts => prevToasts.filter((i) => i.id !== id));
    }, []);

    const showSuccess = useCallback((message, duration) =>
        addToast(message, 'success', duration), [addToast]);

    const showError = useCallback((message, duration) =>
        addToast(message, 'error', duration), [addToast]);

    const showWarning = useCallback((message, duration) =>
        addToast(message, 'warning', duration), [addToast]);

    const showInfo = useCallback((message, duration) =>
        addToast(message, 'info', duration), [addToast]);

    // Новый метод для Schedule Toast
    const showSchedule = useCallback((data, duration) =>
        addScheduleToast(data, duration), [addScheduleToast]);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    const clearAllScheduleToasts = useCallback(() => {
        setScheduleToasts([]);
    }, []);

    const clearAll = useCallback(() => {
        setToasts([]);
        setScheduleToasts([]);
    }, []);

    return {
        toasts,                    // массив активных уведомлений
        scheduleToasts,           // массив активных schedule уведомлений
        addToast,                 // основной метод добавления
        removeToast,              // метод удаления
        addScheduleToast,         // метод добавления schedule toast
        removeScheduleToast,      // метод удаления schedule toast
        showSuccess,              // удобные методы
        showError,
        showWarning,
        showInfo,
        showSchedule,             // новый удобный метод для schedule
        clearAllToasts,
        clearAllScheduleToasts,   // очистка только schedule toasts
        clearAll                  // очистка всех toasts
    };
}