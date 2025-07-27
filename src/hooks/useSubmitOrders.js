import { useState } from "react";

export const useSubmitOrder = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [response, setResponse] = useState(null);

    const submitOrder = async (payload) => {
        setIsLoading(true);
        setError(null);
        setResponse(null);
        if (payload.services && Array.isArray(payload.services)) {
            const invalidService = payload.services.find(s =>
                (s.count && !s.diagonal) || (s.diagonal && !s.count)
            );
            if (invalidService) {
                setIsLoading(false);
                return setError("Не была передана диагональ или количество");
            }
        }


        try {
            const res = await fetch("https://bot-crm-backend-756832582185.us-central1.run.app/api/addOrder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Ошибка при сохранении заказа");
            }

            setResponse(data);
            return data;
        } catch (err) {
            setError(err.message || "Неизвестная ошибка");
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // 🆕 Функция привязки формы
    const linkFormToOrder = async (at, formId, orderId) => {
        try {
            console.log(`🔗 Привязываем форму ${formId} к заказу ${orderId}`);

            const res = await fetch("https://bot-crm-backend-756832582185.us-central1.run.app/api/user/takeFormToOrder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    at: at,
                    form_id: formId,
                    order_id: orderId
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.warn('⚠️ Не удалось привязать форму:', data.error);
                return { success: false, error: data.error };
            }

            console.log('✅ Форма успешно привязана');
            return { success: true, data };
        } catch (err) {
            console.warn('⚠️ Ошибка привязки формы:', err.message);
            return { success: false, error: err.message };
        }
    };

    return {
        submitOrder,
        linkFormToOrder, // 🆕 Новая функция
        isLoading,
        error,
        response,
    };
};