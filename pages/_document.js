import Document, { Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <link rel="stylesheet" href="https://unpkg.com/react-md@1.5.0/dist/react-md.deep_purple-pink.min.css" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons|Roboto:400,500,700" />

          <link rel="stylesheet" href="/_next/static/style.css" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
