import {useState} from "react";

export const useTakeOrder = () => {
    const [takingOrder, setTakingOrder] = useState(null); // лучше название
    const [error, setError] = useState(null);

    const takeOrder = async (order_id, at) => {
        // 1. Проверка параметров
        if (!order_id || !at) {
            setError('Не переданы обязательные параметры');
            return { success: false, error: 'Не переданы обязательные параметры' };
        }

        // 2. Устанавливаем загрузку
        setTakingOrder(order_id);
        setError(null);

        try {
            const response = await fetch(
                `https://bot-crm-backend-756832582185.us-central1.run.app/api/takeOrder/${order_id}/${at}`,
                {
                    method: 'POST', // ← не забудьте метод!
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            // 3. Проверяем ответ
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при взятии заказа');
            }

            // 4. Получаем данные
            const updatedOrder = await response.json();

            return {
                success: true,
                order: updatedOrder
            };

        } catch (error) {
            setError(error.message);
            return {
                success: false,
                error: error.message
            };
        } finally {
            // 5. Убираем индикатор загрузки
            setTakingOrder(null);
        }
    };

    // 6. Возвращаем все нужное
    return {
        takeOrder,
        takingOrder, // для UI - показать какой заказ берем
        error
    };
};