import { useState } from "react";

export const useCheckOrder = () => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkOrder = async (phone) => {
        if (!phone) {
            setResponse(null);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `https://backend-bot-756832582185.us-central1.run.app/api/doubleOrder?phone=${encodeURIComponent(phone)}`
            );

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.error || "Ошибка при проверке заказа");
                setResponse(null);
                return;
            }

            const data = await res.json();
            setResponse(data);
        } catch (err) {
            setError("Ошибка сети или сервера");
            setResponse(null);
        } finally {
            setLoading(false);
        }
    };

    return { response, error, loading, checkOrder, setResponse, setError };
};
