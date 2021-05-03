import React, { useContext } from 'react';
import { ItemContext } from '../../contexts/item.provider';
import List from './List';

const Explorer = () => {

    const { item } = useContext(ItemContext);

    return (
      <div className="explorer-content">
        {item.length > 0 ? <List messages={item} /> : null}
      </div>
    );
  
}

export default Explorer;
