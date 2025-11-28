import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug') || '/'

  // Check if this is a request from the Presentation tool (no secret needed for iframe)
  const referer = request.headers.get('referer') || ''
  const isFromStudio = referer.includes('/studio')

  // Validate the secret (skip if from studio presentation tool)
  if (!isFromStudio && secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  // Enable Draft Mode
  const draft = await draftMode()
  draft.enable()

  // Redirect to the path from the fetched post
  redirect(slug)
}

// Handle POST requests from Presentation tool
export async function POST(request: NextRequest) {
  const draft = await draftMode()
  draft.enable()

  return new Response(null, { status: 200 })
}
