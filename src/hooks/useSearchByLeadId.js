import { useState, useEffect } from "react";

export const useSearchByLeadId = (leadId, at) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        if (!leadId) return;

        setLoading(true);
        setError(null);

        const url = `https://bot-crm-backend-756832582185.us-central1.run.app/api/orderByLeadId/${leadId}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setData(data);

                // Простая проверка по owner (основная проверка будет в компоненте)
                if (at && data) {
                    setIsOwner(data.owner === at);
                }

                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });

    }, [leadId, at]);

    return { data, loading, error, isOwner };
};