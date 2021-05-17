import React from 'react';
import { createContext, useState, useEffect } from 'react';

export const ItemContext = createContext({});

const ItemProvider = ({ children , debug}) => {
    const [item, setItem] = useState([]);

    useEffect(() => {
        if (debug) console.log('%c UPDATED EVENTS: ', 'background: #222; color: #f200ff', item)
    }, [item]); // eslint-disable-line react-hooks/exhaustive-deps

    const storeItem = data => {
        setItem(prevItem => {
            return ([...prevItem, data])             
        });
    };

    const resetStoredItem = () => {
        setItem([]);
    };

    return (
        <ItemContext.Provider value={{
            item,
            storeItem,
            resetStoredItem
        }}>
            {children}
        </ItemContext.Provider>
    )
}

export default ItemProvider;