import { useState } from "react";

export const useGetClient = () => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getClient = async (clientId) => {
        if (!clientId) {
            setResponse(null);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `https://bot-crm-backend-756832582185.us-central1.run.app/api/client/${encodeURIComponent(clientId)}`
            );

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.error || "Ошибка при получении клиента");
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

    return { response, error, loading, getClient, setResponse, setError };
};