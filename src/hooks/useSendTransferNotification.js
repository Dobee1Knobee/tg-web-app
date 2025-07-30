export const useSendTransferNotification = async (req, res) => {

    try {
        const payload = req.body; // Получаем данные из запроса

        const response = await fetch("https://tvmountmaster.ngrok.app/orderTransfer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload) // Передаем payload в body
        });

        const data = await response.json(); // Получаем ответ

        // Отправляем ответ клиенту
        res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
