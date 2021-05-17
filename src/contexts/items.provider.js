import { isEmpty } from 'lodash';
import React from 'react';
import { createContext, useState, useEffect } from 'react';
import { getItem, getItems } from '../utils/firebase';

export const ItemsContext = createContext({});

const ItemsProvider = ({ children, debug }) => {
  const [items, setItems] = useState({});

  useEffect(() => {
    if (debug) console.log('%c UPDATED CONTAINER: ', 'background: #222; color: #37ff00', items)
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  const addItem = async containerId => {
    try {
      const item = await getItem(containerId);
      if (isEmpty(item)) return;
      setItems(prevItems => {
        return {
          ...prevItems,
          [containerId]: item,
          error: null
        }
      });
    } catch (error) {
      setItems(prevItems => {
        return {
          ...prevItems,
          error: 'Loading items failed'
        }
      });
    }

  };

  const storeItems = async (user, containerId = null) => {
    try {
      const results = {};
      const itemsToStore = [];

      if (user.role === 'shipper') {
        // Add containers of the shipper
        itemsToStore.push(await getItems());
      } else {
        for await (const status of user.previousEvent) {
          itemsToStore.push(await getItems(status));
        }
      }

      if (containerId) {
        // Add a container under review, which status was already changed
        const item = await getItem(containerId)
        itemsToStore.push({[containerId]: item });
      }
      
      itemsToStore.forEach(item => {
        // Sort by most recently changed first
        Object.values(item).sort((a, b) => b.timestamp - a.timestamp).forEach(result => {
          if (!results[result.containerId]) {
            results[result.containerId] = result;
          }
        });
      });

      if (!isEmpty(results)) {
        setItems(results);
      } else {
        setItems({ error: 'No items found' });
      }
    } catch (error) {
      setItems({ error: null });
    }
  };

  return (
    <ItemsContext.Provider value={{
      items,
      addItem,
      storeItems
    }}>
      {children}
    </ItemsContext.Provider>
  )
}

export default ItemsProvider;