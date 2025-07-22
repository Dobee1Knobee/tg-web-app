import { useEffect, useState } from 'react';

export const useUserByAt = (at) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (!at) return;
        fetch(`https://bot-crm-backend-756832582185.us-central1.run.app/api/user?at=${at}`)
            .then((res) => res.ok ? res.json() : null)
            .then(setUser)
            .catch(() => setUser(null));
    }, [at]);

    return user;

};


