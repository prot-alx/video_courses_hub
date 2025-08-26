import { createServer } from 'https'
import { createServer as createHttpServer } from 'http'
import next from 'next'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { config } from 'dotenv'

// Загружаем переменные окружения
config()

const dev = process.env.NODE_ENV === 'development'
const app = next({ dev })
const handle = app.getRequestHandler()

// Извлекаем домен из AUTH_URL
const getDomainsFromEnv = () => {
  const authUrl = process.env.AUTH_URL
  if (!authUrl) {
    console.error('❌ AUTH_URL не найден в .env файле')
    process.exit(1)
  }
  
  try {
    const url = new URL(authUrl)
    return url.hostname
  } catch (error) {
    console.error('❌ Некорректный AUTH_URL в .env:', authUrl, error)
    process.exit(1)
  }
}

// Автоматически ищем SSL сертификаты для домена
const findSSLCertificates = (domain) => {
  const currentDir = process.cwd()
  const files = readdirSync(currentDir)
  
  // Ищем файлы сертификатов по шаблону
  const keyFiles = files.filter(f => f.includes(domain) && f.includes('key') && f.endsWith('.pem'))
  const certFiles = files.filter(f => f.includes(domain) && (f.includes('cert') || f.includes('chain') || f.includes('crt')) && f.endsWith('.pem'))
  
  if (keyFiles.length === 0 || certFiles.length === 0) {
    return null
  }
  
  // Приоритет: chain > crt > cert
  let certFile = certFiles.find(f => f.includes('chain')) || 
                 certFiles.find(f => f.includes('crt')) || 
                 certFiles[0]
  
  return {
    key: `./${keyFiles[0]}`,
    cert: `./${certFile}`
  }
}

const domain = getDomainsFromEnv()
console.log(`🌐 Настройка сервера для домена: ${domain}`)

const sslFiles = findSSLCertificates(domain)
let httpsOptions

if (sslFiles && existsSync(sslFiles.key) && existsSync(sslFiles.cert)) {
  console.log(`✅ Найдены SSL сертификаты:`)
  console.log(`   🔑 Ключ: ${sslFiles.key}`)
  console.log(`   📜 Сертификат: ${sslFiles.cert}`)
  
  httpsOptions = {
    key: readFileSync(sslFiles.key),
    cert: readFileSync(sslFiles.cert)
  }
} else {
  console.log('⚠️ SSL сертификаты не найдены!')
  console.log('💡 Создайте сертификаты с помощью:')
  console.log(`   ./mkcert ${domain}`)
  console.log('   или для localhost:')
  console.log('   ./mkcert localhost')
  process.exit(1)
}

app.prepare().then(() => {
  // HTTP сервер (редирект на HTTPS)
  createHttpServer((req, res) => {
    const host = req.headers.host?.replace(':80', '')
    const redirectUrl = `https://${host}${req.url}`
    
    res.writeHead(301, { 
      Location: redirectUrl,
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    })
    res.end()
  }).listen(80, () => {
    console.log('🌐 HTTP сервер на порту 80 (редирект на HTTPS)')
  })

  // HTTPS сервер
  createServer(httpsOptions, (req, res) => {
    // Безопасность заголовки
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    
    handle(req, res)
  }).listen(443, (err) => {
    if (err) throw err
    console.log(`🔒 HTTPS сервер запущен на https://${domain}`)
    console.log(`📁 SSL сертификаты: ${sslFiles.key} + ${sslFiles.cert}`)
  })
})