import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAIクライアントの初期化（APIキーがある場合のみ）
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// 汎用的なMarkdown変換関数
function simpleMarkdownConverter(text: string): string {
  let markdown = text

  // 段落を分離（空行で区切る）
  markdown = markdown.replace(/\n\n+/g, '\n\n')

  // 見出しの検出（文末に「である」「です」「だ」「でした」がある場合）
  markdown = markdown.replace(/^(.+?(?:である|です|だ|でした))。$/gm, '# $1')

  // 強調（「」で囲まれた部分）
  markdown = markdown.replace(/「([^」]+)」/g, '**$1**')

  // リスト（行頭に「・」「-」「*」がある場合）
  markdown = markdown.replace(/^[・\-*]\s*(.+)$/gm, '- $1')

  // 番号付きリスト（数字.で始まる行）
  markdown = markdown.replace(/^(\d+)\.\s*(.+)$/gm, '$1. $2')

  // 引用（行頭に「>」がある場合）
  markdown = markdown.replace(/^>\s*(.+)$/gm, '> $1')

  // コード（`で囲まれた部分）
  markdown = markdown.replace(/`([^`]+)`/g, '`$1`')

  // リンク（URLの検出）
  markdown = markdown.replace(/(https?:\/\/[^\s]+)/g, '[$1]($1)')

  // 斜体（*で囲まれた部分）
  markdown = markdown.replace(/\*([^*]+)\*/g, '*$1*')

  // 太字（**で囲まれた部分）
  markdown = markdown.replace(/\*\*([^*]+)\*\*/g, '**$1**')

  // 水平線（---で始まる行）
  markdown = markdown.replace(/^---$/gm, '---')

  // 改行の処理（段落間の改行を適切に処理）
  markdown = markdown.replace(/\n/g, '\n\n')

  return markdown
}

// より高度な汎用Markdown変換関数
function advancedMarkdownConverter(text: string): string {
  let markdown = text

  // 段落を分離
  markdown = markdown.replace(/\n\n+/g, '\n\n')

  // 見出しの検出（より柔軟なパターン）
  markdown = markdown.replace(/^(.+?(?:である|です|だ|でした|とは|について|についての|に関する))。$/gm, '# $1')

  // 強調（「」で囲まれた部分）
  markdown = markdown.replace(/「([^」]+)」/g, '**$1**')

  // リスト（行頭に「・」「-」「*」がある場合）
  markdown = markdown.replace(/^[・\-*]\s*(.+)$/gm, '- $1')

  // 番号付きリスト（数字.で始まる行）
  markdown = markdown.replace(/^(\d+)\.\s*(.+)$/gm, '$1. $2')

  // 引用（行頭に「>」がある場合）
  markdown = markdown.replace(/^>\s*(.+)$/gm, '> $1')

  // コード（`で囲まれた部分）
  markdown = markdown.replace(/`([^`]+)`/g, '`$1`')

  // リンク（URLの検出）
  markdown = markdown.replace(/(https?:\/\/[^\s]+)/g, '[$1]($1)')

  // 斜体（*で囲まれた部分）
  markdown = markdown.replace(/\*([^*]+)\*/g, '*$1*')

  // 太字（**で囲まれた部分）
  markdown = markdown.replace(/\*\*([^*]+)\*\*/g, '**$1**')

  // 水平線（---で始まる行）
  markdown = markdown.replace(/^---$/gm, '---')

  // 改行の処理（段落間の改行を適切に処理）
  markdown = markdown.replace(/\n/g, '\n\n')

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
              content: `あなたは文章を要約してMarkdown形式にまとめる専門家です。
以下の指示に従って要約とMarkdown変換を行ってください：

1. 入力された文章の内容を理解し、重要なポイントを抽出する
2. 要約した内容を適切なMarkdown形式で整理する
3. 以下の要素を含めて要約する：
   - メインのトピックやテーマ
   - 重要なポイントやキーワード
   - 結論や要点
4. 見出し、リスト、強調、引用などのMarkdown記法を適切に使用する
5. 読みやすく、構造化された要約を作成する
6. 日本語の文章に適した要約を行う

要約結果のみを返してください。説明やコメントは含めないでください。`
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        })

        markdown = response.choices[0]?.message?.content || '要約に失敗しました'
      } catch (error) {
        console.error('OpenAI API error:', error)
        // OpenAIが失敗した場合は高度なフォールバックを使用
        markdown = advancedMarkdownConverter(text)
      }
    } else {
      // APIキーがない場合は高度なフォールバックを使用
      markdown = advancedMarkdownConverter(text)
    }
    
    return NextResponse.json({ markdown })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '要約中にエラーが発生しました' },
      { status: 500 }
    )
  }
} 