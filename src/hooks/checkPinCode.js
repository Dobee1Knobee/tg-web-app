export const checkPinCode = async (pincode, at) => {
    console.log('=== CLIENT DEBUG ===');
    console.log('Sending pincode:', pincode, 'type:', typeof pincode);
    console.log('Sending at:', at, 'type:', typeof at);

    try {
        const payload = { at, pincode };
        console.log('Payload:', payload);

        const response = await fetch('https://bot-crm-backend-756832582185.us-central1.run.app/api/user/checkPin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.log('Fetch error:', error);
        return { success: false, error: 'Ошибка соединения' };
    }
};