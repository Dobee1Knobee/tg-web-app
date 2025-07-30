import {useState} from "react";

export const useMyOrders = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [orders, setOrders] = useState(null);
    const [error, setError] = useState(null);

    const myOrders = async (at, page = 1, limit = 10) => {
        if (!at) {
            setError("Username is required");
            return;
        }

        setIsLoading(true);
        setError(null);
        setOrders(null);
        console.log('📄 Загружаем страницу:', page, 'лимит:', limit);

        try {
            const cleanAt = at.replace('@', '');

            // ✅ Добавляем query параметры для пагинации
            const url = `https://bot-crm-backend-756832582185.us-central1.run.app/api/user/myOrders/${cleanAt}?page=${page}&limit=${limit}`;

            console.log('🔗 Запрос к URL:', url);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                mode: 'cors',
                cache: 'no-cache'
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('User not found');
                }
                if (response.status === 500) {
                    throw new Error('Server error');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Received data:', {
                ordersCount: data.orders?.length,
                pagination: data.pagination
            });

            setOrders(data);
            return data;

        } catch (error) {
            console.error("❌ Full error:", error);

            let errorMessage = "Failed to fetch orders";
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                errorMessage = "Network error: Cannot connect to server";
            } else if (error.message.includes('JSON')) {
                errorMessage = "Server returned invalid data format";
            } else {
                errorMessage = error.message;
            }

            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Остальные функции без изменений...
    const testConnection = async () => {
        try {
            const response = await fetch('https://bot-crm-backend-756832582185.us-central1.run.app/api/health', {
                method: 'GET',
                mode: 'cors'
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Server connection test successful:', data);
                return { success: true, data };
            } else {
                console.log('❌ Server connection test failed:', response.status);
                return { success: false, status: response.status };
            }
        } catch (error) {
            console.log('❌ Network test failed:', error);
            return { success: false, error: error.message };
        }
    };

    const clearOrders = () => {
        setOrders(null);
        setError(null);
    };

    const refetchOrders = (at, page = 1, limit = 10) => {
        return myOrders(at, page, limit);
    };

    return {
        isLoading,
        orders,
        error,
        myOrders,
        clearOrders,
        refetchOrders,
        testConnection
    };
};