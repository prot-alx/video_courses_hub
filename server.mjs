import { createServer } from 'https'
import { createServer as createHttpServer } from 'http'
import next from 'next'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { config } from 'dotenv'

config()

const dev = process.env.NODE_ENV === 'development'
const app = next({ dev })
const handle = app.getRequestHandler()

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

const findSSLCertificatePairs = (domain) => {
  const currentDir = process.cwd()
  const files = readdirSync(currentDir)
  
  const patterns = [
    {
      keyPattern: `${domain}-key.pem`,
      certPattern: `${domain}-chain.pem`,
      name: 'Let\'s Encrypt'
    },
    {
      keyPattern: `${domain}+2-key.pem`,
      certPattern: `${domain}+2.pem`,
      name: 'mkcert (+2)'
    },
    {
      keyPattern: `${domain}+1-key.pem`,
      certPattern: `${domain}+1.pem`,
      name: 'mkcert (+1)'
    },
    {
      keyPattern: `${domain}-key.pem`,
      certPattern: `${domain}.pem`,
      name: 'mkcert (basic)'
    }
  ]
  
  for (const pattern of patterns) {
    const keyFile = `./${pattern.keyPattern}`
    const certFile = `./${pattern.certPattern}`
    
    if (existsSync(keyFile) && existsSync(certFile)) {
      return {
        key: keyFile,
        cert: certFile,
        name: pattern.name
      }
    }
  }
  
  return null
}

const domain = getDomainsFromEnv()
console.log(`🌐 Настройка сервера для домена: ${domain}`)

const sslPair = findSSLCertificatePairs(domain)

let httpsOptions

if (sslPair) {
  console.log(`✅ Найдена пара SSL сертификатов (${sslPair.name}):`)
  console.log(`   🔑 Ключ: ${sslPair.key}`)
  console.log(`   📜 Сертификат: ${sslPair.cert}`)
  
  try {
    httpsOptions = {
      key: readFileSync(sslPair.key),
      cert: readFileSync(sslPair.cert)
    }
  } catch (error) {
    console.error('❌ Ошибка чтения SSL файлов:', error.message)
    process.exit(1)
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

  createServer(httpsOptions, (req, res) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
   
    handle(req, res)
  }).listen(443, (err) => {
    if (err) {
      console.error('❌ Ошибка запуска HTTPS сервера:', err.message)
      process.exit(1)
    }
    console.log(`🔒 HTTPS сервер запущен на https://${domain}`)
    console.log(`📁 SSL тип: ${sslPair.name}`)
  })
}).catch(err => {
  console.error('❌ Ошибка подготовки Next.js:', err)
  process.exit(1)
})
