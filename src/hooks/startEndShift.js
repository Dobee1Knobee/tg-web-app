import { useState } from 'react';

const BASE_URL = 'https://bot-crm-backend-756832582185.us-central1.run.app';

// Хук для НАЧАЛА смены
export const useStartShift = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const startShift = async (at) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`${BASE_URL}/api/user/turn-on-shift`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ at })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при начале смены');
            }

            setSuccess(true);
            return data;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        startShift,  // функция для вызова
        loading,     // состояние загрузки
        error,       // ошибка, если есть
        success      // успешно ли выполнено
    };
};

// Хук для ЗАВЕРШЕНИЯ смены
export const useEndShift = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const endShift = async (at) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`${BASE_URL}/api/user/turn-off-shift`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ at })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при завершении смены');
            }

            setSuccess(true);
            return data;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        endShift,    // функция для вызова
        loading,     // состояние загрузки
        error,       // ошибка, если есть
        success      // успешно ли выполнено
    };
};

export default { useStartShift, useEndShift };