import { useEffect, useState } from 'react';

export const useUserByAt = (at) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (!at) return;
        fetch(`http://localhost:3000/api/user?at=${at}`)
            .then((res) => res.ok ? res.json() : null)
            .then(setUser)
            .catch(() => setUser(null));
    }, [at]);

    return user;
};
