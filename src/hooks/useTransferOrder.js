import {useState} from "react";

export const useTransferOrder = () => {
    const [giveOrder, setGiveOrder] = useState(null);
    const [transferError, setTransferError] = useState(null);

    const transferOrder = async (order_id, toTeam, fromUser, note = '') => {
        if (!order_id || !toTeam || !fromUser) {
            setTransferError('Не переданы обязательные параметры');
            return { success: false, error: 'Не переданы обязательные параметры' };
        }

        setGiveOrder(order_id);
        setTransferError(null);

        try {
            const response = await fetch(
                `https://bot-crm-backend-756832582185.us-central1.run.app/api/transfer-order/${order_id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        toTeam,
                        note,
                        fromUser
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при передаче заказа');
            }

            const result = await response.json();
            return {
                success: true,
                data: result,
                message: result.message || 'Заказ успешно передан'
            };

        } catch (err) {
            setTransferError(err.message);
            return {
                success: false,
                error: err.message
            };
        } finally {
            setGiveOrder(null);
        }
    };

    return {
        transferOrder,
        giveOrder, // или переименуйте в transferringOrder для ясности
        transferError
    };
};