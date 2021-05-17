import React, { useState, useEffect } from 'react';
import hljs from 'highlightjs';
import 'highlightjs/styles/github.css';

const MessageContent = ({ message }) => {
 
  const [code, setCode] = useState(null);

  useEffect(() => {
    if (code) highlight();
  }, [message]);

  const highlight = () => {
    
    try {
      hljs.highlightBlock(code);
    } catch (e) {
      console.error("Highlight error", hljs, e);
    }
  };


  return (
    <div className="highlightjs-component">
      <pre className="prettyprint lang-json">
        <code className="json prettyprint lang-json" ref={tempCode => setCode(tempCode)}>
          {JSON.stringify(message, null, 2)}
        </code>
      </pre>
    </div>
  );
}

export default MessageContent;
