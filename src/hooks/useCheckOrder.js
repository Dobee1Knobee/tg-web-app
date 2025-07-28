import { useState } from "react";

export const useCheckOrder = () => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOwnerPhone, setIsOwnerPhone] = useState(false);

    const checkOrder = async (phone, at) => {
        if (!phone) {
            setResponse(null);
            setError(null);
            setLoading(false);
            setIsOwnerPhone(false);
            return;
        }

        setLoading(true);
        setError(null);
        setIsOwnerPhone(false);

        try {
            const res = await fetch(
                `https://bot-crm-backend-756832582185.us-central1.run.app/api/doubleOrder?phone=${encodeURIComponent(phone)}`
            );

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.error || "Ошибка при проверке заказа");
                setResponse(null);
                return;
            }

            const data = await res.json();

            // Больше не нужно устанавливать isOwnerPhone здесь,
            // так как теперь проверка идет для каждого заказа отдельно
            setResponse(data);
        } catch (err) {
            setError("Ошибка сети или сервера");
            setResponse(null);
        } finally {
            setLoading(false);
        }
    };

    return { response, error, loading, checkOrder, setResponse, setError, isOwnerPhone };
};