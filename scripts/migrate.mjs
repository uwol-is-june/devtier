// Run with: DB_PASSWORD=<비밀번호> node scripts/migrate.mjs
//       or: node scripts/migrate.mjs <비밀번호>
import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const password = process.env.DB_PASSWORD || process.argv[2]

if (!password) {
  console.error('사용법: DB_PASSWORD=<비밀번호> node scripts/migrate.mjs')
  console.error('     또는: node scripts/migrate.mjs <비밀번호>')
  process.exit(1)
}

const encodedPw = encodeURIComponent(password)
const poolerUrl = `postgresql://postgres.tvtjslcplbiwcnwtmlwp:${encodedPw}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`

const sql = readFileSync(resolve(__dirname, '../supabase/migrations/20260429000000_init.sql'), 'utf8')

const client = new pg.Client({
  connectionString: poolerUrl,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  console.log('DB 연결 성공')

  // Drop existing table if schema is wrong
  await client.query('DROP TABLE IF EXISTS public.users CASCADE')
  console.log('기존 users 테이블 삭제')

  await client.query(sql)
  console.log('마이그레이션 적용 완료')

  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public' ORDER BY ordinal_position")
  console.log('users 테이블 컬럼:', res.rows.map(r => r.column_name).join(', '))
} catch (err) {
  console.error('오류:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
