import { useState } from "react";

export const useSubmitOrder = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [response, setResponse] = useState(null);

    const submitOrder = async (payload) => {
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const res = await fetch("https://backend-bot-756832582185.us-central1.run.app/api/addOrder", {
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

    return {
        submitOrder,
        isLoading,
        error,
        response,
    };
};
