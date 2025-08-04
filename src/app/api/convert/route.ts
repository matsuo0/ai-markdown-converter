import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAIクライアントの初期化（APIキーがある場合のみ）
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// フォールバック用のシンプルなMarkdown変換関数
function simpleMarkdownConverter(text: string): string {
  let markdown = text

  // 見出しの検出（行末に「。」がある場合）
  markdown = markdown.replace(/^(.+。)\.$/gm, '# $1')
  
  // 強調（「」で囲まれた部分）
  markdown = markdown.replace(/「([^」]+)」/g, '**$1**')
  
  // リスト（行頭に「・」や「-」がある場合）
  markdown = markdown.replace(/^[・\-]\s*(.+)$/gm, '- $1')
  
  // 段落の分離
  markdown = markdown.replace(/\n\n/g, '\n\n')
  
  return markdown
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'テキストが提供されていません' },
        { status: 400 }
      )
    }

    let markdown: string

    // OpenAI APIキーがある場合はOpenAIを使用
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `あなたは文章をMarkdown形式に変換する専門家です。
以下の指示に従って変換してください：

1. 入力された文章を適切なMarkdown形式に変換する
2. 見出し、リスト、強調、リンクなどのMarkdown記法を適切に使用する
3. 文章の構造を保ちながら、読みやすいMarkdownにする
4. 不要な装飾は避け、シンプルで実用的なMarkdownを生成する
5. 日本語の文章に適した変換を行う

変換結果のみを返してください。説明やコメントは含めないでください。`
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        })

        markdown = response.choices[0]?.message?.content || '変換に失敗しました'
      } catch (error) {
        console.error('OpenAI API error:', error)
        // OpenAIが失敗した場合はフォールバックを使用
        markdown = simpleMarkdownConverter(text)
      }
    } else {
      // APIキーがない場合はフォールバックを使用
      markdown = simpleMarkdownConverter(text)
    }
    
    return NextResponse.json({ markdown })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '変換中にエラーが発生しました' },
      { status: 500 }
    )
  }
} 