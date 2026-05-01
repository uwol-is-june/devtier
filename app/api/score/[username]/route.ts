import { getScoreData } from '@/lib/getScoreData'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  try {
    const data = await getScoreData(username)
    return Response.json(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const status = msg.includes('not found') ? 404 : 500
    return Response.json({ error: msg }, { status })
  }
}
