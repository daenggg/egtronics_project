import { NextResponse, type NextRequest } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const base = process.env.BACKEND_API_BASE_URL
    if (!base) {
      return NextResponse.json(
        { message: 'BACKEND_API_BASE_URL is not set' },
        { status: 500 }
      )
    }

    const url = new URL(`/posts/${params.id}`, base)
    const res = await fetch(url.toString(), { cache: 'no-store' })
    const data = await res.json().catch(async () => {
      const text = await res.text()
      return { message: text }
    })
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json({ message: 'Proxy error' }, { status: 502 })
  }
}


