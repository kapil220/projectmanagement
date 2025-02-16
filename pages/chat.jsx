/* eslint-disable i18next/no-literal-string */
import React, { useEffect } from 'react';




function Chat() {

  useEffect(() => {
    // Create a script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://embed.tawk.to/66913202becc2fed6923edb5/1i2jimn8d';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Append the script to the DOM
    document.body.appendChild(script);

    // Cleanup function to remove the script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div>User Chat Area</div>;
}

export default Chat;
