import { useState } from "react";

export const useTakeBackTransferred = () => {
    const [takingBackOrder, setTakingBackOrder] = useState(null); // ID заказа, который забираем обратно
    const [error, setError] = useState(null);

    const takeBackOrder = async (order_id, at) => {
        // 1. Проверка параметров
        if (!order_id || !at) {
            setError('Не переданы обязательные параметры');
            return { success: false, error: 'Не переданы обязательные параметры' };
        }

        console.log(`🔄 Забираем обратно заказ ${order_id} для пользователя ${at}`);

        // 2. Устанавливаем загрузку
        setTakingBackOrder(order_id);
        setError(null);

        try {
            const response = await fetch(
                `https://bot-crm-backend-756832582185.us-central1.run.app/api/user/takeBackTransfered`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        order_id: order_id,
                        at: at
                    })
                }
            );

            // 3. Проверяем ответ
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при забирании заказа обратно');
            }

            // 4. Получаем данные
            const result = await response.json();

            console.log(`✅ Заказ ${order_id} успешно забран обратно`);

            return {
                success: true,
                message: result.message,
                order: result.order,
                details: result.details
            };

        } catch (error) {
            console.error(`❌ Ошибка при забирании заказа обратно:`, error);
            setError(error.message);
            return {
                success: false,
                error: error.message
            };
        } finally {
            // 5. Убираем индикатор загрузки
            setTakingBackOrder(null);
        }
    };

    // 6. Возвращаем все нужное
    return {
        takeBackOrder,
        takingBackOrder, // для UI - показать какой заказ забираем
        error,
        // Дополнительные утилиты
        clearError: () => setError(null)
    };
};