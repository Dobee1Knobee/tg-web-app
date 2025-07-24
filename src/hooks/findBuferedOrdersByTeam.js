import {useState, useEffect} from "react";

export const useFindBufferedOrders = (team) => {
    const [orders, setOrders] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        if (!team) return; // Если команда не передана

        setLoading(true);
        setError(null);

        try {
            // Ваша задача: написать fetch запрос
            const response = await fetch(`https://bot-crm-backend-756832582185.us-central1.run.app/api/buffer-orders/${team}`);
            ; // Какой URL?

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setOrders(data); // Что записать в orders?

        } catch (err) {
            setError(err.message);
            setOrders(null);
        } finally {
            setLoading(false);
        }
    };

    // Автоматически загружать при изменении team
    useEffect(() => {
        fetchOrders();
    }, [team]);

    return {
        orders,
        loading,
        error,
        refetch: fetchOrders // Для ручного обновления
    };
};

