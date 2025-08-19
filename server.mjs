// server.mjs
import { createServer } from 'https'
import { createServer as createHttpServer } from 'http'
import next from 'next'
import { readFileSync } from 'fs'

const dev = process.env.NODE_ENV === 'development'
const app = next({ dev })
const handle = app.getRequestHandler()

// Используем правильные имена файлов сертификатов
const httpsOptions = {
  key: readFileSync('./editor.ddns.net+2-key.pem'),
  cert: readFileSync('./editor.ddns.net+2.pem')
}

app.prepare().then(() => {
  // HTTP редирект
  createHttpServer((req, res) => {
    const host = req.headers.host?.replace(':80', '')
    res.writeHead(301, { Location: `https://${host}${req.url}` })
    res.end()
  }).listen(80, () => {
    console.log('> HTTP сервер на порту 80 (редирект)')
  })

  // HTTPS сервер
  createServer(httpsOptions, (req, res) => {
    handle(req, res)
  }).listen(443, (err) => {
    if (err) throw err
    console.log('> HTTPS сервер на https://editor.ddns.net')
  })
})