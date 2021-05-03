import React from 'react';
import { createContext, useState, useEffect } from 'react';

export const ItemContext = createContext({});

const ItemProvider = ({ children }) => {
    const [item, setItem] = useState([]);

    useEffect(() => {
        console.log('%c UPDATED ITEM: ', 'background: #222; color: #f200ff', item)
    }, [item]);

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