import React, { useEffect } from 'react';
import { createContext, useState } from 'react';
import { getEvents } from '../utils/firebase';

export const UserContext = createContext({});

const UserProvider = ({ children }) => {
    const [user, setUser] = useState({});

    const logout = () => setUser({});

    useEffect(() => {
        console.log('%c UPDATED USER: ', 'background: #222; color: #bada55', user)
    }, [user]);

    const storeEvents = async role => {
        const events = await getEvents(role);
        setUser(prevUser => {
            return {
                ...prevUser,
                ...events
            }
        });
    }
    const storeCredentials = credentials => {
        setUser(prevUser => {
            return {
                ...prevUser,
                ...credentials
            }
        });
    }

    return (
        <UserContext.Provider value={{
            user,
            storeCredentials,
            storeEvents,
            logout
        }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider;