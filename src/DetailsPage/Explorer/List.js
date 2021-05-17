import React, { useEffect, useState } from 'react';
import { withCookies } from 'react-cookie';
import { ExpansionList, ExpansionPanel, Switch } from 'react-md';
import MessageContent from './MessageContent';
import updateStep from '../../utils/cookie';

const List = ({ messages, cookies }) => {

  const [expanded, setExpanded] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState([]);

  useEffect(() => {
    setSwitchState();
  }, [expandedPanels]); // eslint-disable-line react-hooks/exhaustive-deps

  const onExpandToggle = (toggleOpen, key) => {
    if (toggleOpen) {
      setExpandedPanels(prevExpandedPanels => {
        return ([...prevExpandedPanels, key])
      });
    } else {
      const index = expandedPanels.indexOf(key);
      if (index > -1) {
        expandedPanels.splice(index, 1);
        setExpandedPanels([...expandedPanels]);
      }
    }
  };

  const setSwitchState = () => {
    if (expandedPanels.length === messages.length) {
      setExpanded(true);
    } else if (expandedPanels.length === 0) {
      setExpanded(false);
    }
  };

  const toggleExpandedState = isExpanded => {
    updateStep(cookies, 6);
    setExpanded(isExpanded);
    if (!isExpanded) {
      setExpandedPanels([]);
    } else {
      setExpandedPanels(Array.from(new Array(messages.length), (x, i) => i));
    }
  };

  return (
    <div className="panel">
      <Switch
        id="expand-all"
        type="switch"
        label="Expand all"
        name="expand-all"
        className="expand-all"
        checked={expanded}
        onChange={toggleExpandedState}
      />
      <ExpansionList className="md-cell md-cell--12">
        {messages.map((message, index) => (
          <ExpansionPanel
            key={index}
            label={`Event ${index}`}
            footer={null}
            expanded={expandedPanels.includes(index)}
            onExpandToggle={toggleOpen => onExpandToggle(toggleOpen, index)}
          >
            <MessageContent message={message} />
          </ExpansionPanel>
        ))}
      </ExpansionList>
    </div>
  );
}


export default withCookies(List);
