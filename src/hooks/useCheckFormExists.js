import { useState } from 'react';

export const useCheckFormLink = () => {
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState(null);

    const checkFormLinkExists = async (form_id) => {
        // Проверка параметров
        if (!form_id) {
            setError('Не передан form_id');
            return { exists: false, error: 'Не передан form_id' };
        }

        setChecking(true);
        setError(null);

        try {
            const response = await fetch(`https://bot-crm-backend-756832582185.us-central1.run.app/api/form/checkIfLinked/${form_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.status === 404) {
                return { exists: false, error: data.error };
            }

            if (data.linked) {
                return {
                    exists: true,
                    orderId: data.order_id,
                    manager: data.manager,
                    message: data.message
                };
            }

            return { exists: false };

        } catch (error) {
            setError(error.message);
            return {
                exists: false,
                error: error.message
            };
        } finally {
            setChecking(false);
        }
    };

    return {
        checkFormLinkExists,
        checking, // для UI - показать загрузку
        error
    };
};