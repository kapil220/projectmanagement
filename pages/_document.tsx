import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="h-full" data-theme="boxyhq">
      <Head />
      <body className="h-dvh">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
