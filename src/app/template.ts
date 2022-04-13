export default ({
  body,
  title,
  initialState,
}: {
  body: string
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialState: string
}): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <script>window.__APP_INITIAL_STATE__ = ${initialState}</script>
        <title>${title}</title>
        <link rel="stylesheet" href="/assets/index.css" />
      </head>
      
      <body>
        <div id="root">${body}</div>
      </body>
      
      <script type="text/javascript" src="/assets/bundle.min.js"></script>
    </html>
  `
}
