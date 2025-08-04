import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const hasApiKey = !!process.env.OPENAI_API_KEY
    
    return NextResponse.json({ 
      hasApiKey,
      message: hasApiKey 
        ? 'OpenAI APIキーが設定されています'
        : 'OpenAI APIキーが設定されていません'
    })
  } catch (error) {
    console.error('API key check error:', error)
    return NextResponse.json(
      { hasApiKey: false, error: 'APIキーの確認中にエラーが発生しました' },
      { status: 500 }
    )
  }
} 