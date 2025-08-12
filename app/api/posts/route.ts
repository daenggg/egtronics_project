import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') ?? ''
    const base = process.env.BACKEND_API_BASE_URL
    if (!base) {
      return NextResponse.json(
        { message: 'BACKEND_API_BASE_URL is not set' },
        { status: 500 }
      )
    }

    const url = new URL('/posts', base)
    if (category) url.searchParams.set('category', category)

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


