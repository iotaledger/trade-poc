import React, { useEffect } from 'react';
import { createContext, useState } from 'react';
import { getEvents } from '../utils/firebase';

export const UserContext = createContext({});

const UserProvider = ({ children, debug }) => {
    const [user, setUser] = useState({});

    const logout = () => setUser({});

    useEffect(() => {
        if (debug) console.log('%c UPDATED USER: ', 'background: #222; color: #bada55', user)
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    const storeEvents = async role => {
        try {
            const events = await getEvents(role);
            setUser(prevUser => {
                return {
                    ...prevUser,
                    ...events
                }
            });
        } catch (e) {
            console.error("Could not get events:", e)
        }
        
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