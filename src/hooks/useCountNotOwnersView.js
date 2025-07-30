import { useState } from "react";

export const useCountNotOwnersView = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const countNotOwnersView = async (order_id, at) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await fetch(`https://bot-crm-backend-756832582185.us-central1.run.app/api/user/countNotOwn`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ order_id, at }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData);
                return;
            }

            const result = await response.json();
            setData(result);
            return result;
        } catch (err) {
            setError(err);
            console.error("Ошибка запроса:", err);
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, data, countNotOwnersView };
};
