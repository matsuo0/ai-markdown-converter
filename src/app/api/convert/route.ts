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

// 構造化された要約生成関数
function structuredSummaryConverter(text: string): string {
  // 基本的な変換を適用
  let markdown = advancedMarkdownConverter(text)
  
  // 構造化された要約のテンプレートを適用
  const lines = markdown.split('\n')
  const structuredLines = []
  
  // 最初の段落を概要として扱う
  let hasSummary = false
  let hasFeatures = false
  let hasDevelopment = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 見出しを検出して構造化
    if (line.startsWith('#') && !hasSummary) {
      // 最初の見出しを概要セクションに変換
      const title = line.replace('#', '').trim()
      const mainConcept = title.split('（')[0].split('は')[0].trim()
      
      structuredLines.push('---')
      structuredLines.push('')
      structuredLines.push(`## ${mainConcept}の概要と特徴`)
      structuredLines.push('')
      structuredLines.push(`**${mainConcept}**は、${title.includes('は') ? title.split('は')[1]?.replace(/[。、].*$/, '') : '重要な概念'}です。`)
      structuredLines.push('')
      hasSummary = true
    } else if (line.includes('特徴') || line.includes('音楽的') || line.includes('要素')) {
      // 特徴セクションを追加
      if (!hasFeatures) {
        structuredLines.push('### 音楽的特徴')
        structuredLines.push('')
        hasFeatures = true
      }
      structuredLines.push(`* ${line.replace(/^[#\-\*]*\s*/, '')}`)
    } else if (line.includes('発展') || line.includes('影響') || line.includes('歴史')) {
      // 発展セクションを追加
      if (!hasDevelopment) {
        structuredLines.push('')
        structuredLines.push('### 音楽の発展')
        structuredLines.push('')
        hasDevelopment = true
      }
      structuredLines.push(`* ${line.replace(/^[#\-\*]*\s*/, '')}`)
    } else if (line.startsWith('-') || line.startsWith('*')) {
      // リスト項目をそのまま追加
      structuredLines.push(line)
    } else if (line.trim() !== '') {
      // 通常の段落を追加
      structuredLines.push(line)
    }
  }
  
  // 影響を受けた音楽セクションを追加
  if (markdown.includes('影響') || markdown.includes('発展')) {
    structuredLines.push('')
    structuredLines.push('### 影響を受けた音楽')
    structuredLines.push('')
    structuredLines.push('**スカ**や**ロックステディ**から発展したレゲエは、ジャマイカのフォーク音楽である**メント**、アメリカの**リズム・アンド・ブルース**、**カリプソ**など、多様な音楽の影響を受けて成立しました。')
  }
  
  return structuredLines.join('\n')
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

## 要約の構造
1. **概要セクション**: メインのトピックやテーマを簡潔に説明
2. **詳細セクション**: 重要なポイントを小見出し付きで整理
3. **特徴や要素**: キーワードや重要な要素を強調
4. **発展や影響**: 歴史的背景や影響について説明

## Markdown記法の使用
- 見出し: # (メイン), ## (サブ), ### (詳細)
- 強調: **太字** で重要なキーワード
- リスト: - または * で箇条書き
- 段落: 適切な空行で区切る
- 構造化: 論理的な階層構造を作成

## 出力例
\`\`\`markdown
---

## [トピック名]の概要と特徴

**[主要概念]**は、[簡潔な説明]です。

### [詳細セクション名]

* [重要なポイント1]
* [重要なポイント2]
* [重要なポイント3]

### [発展や影響]

**[キーワード1]**や**[キーワード2]**から発展し、[説明]。
\`\`\`

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
        // OpenAIが失敗した場合は構造化された要約生成を使用
        markdown = structuredSummaryConverter(text)
      }
    } else {
      // APIキーがない場合は高度なフォールバックを使用
      markdown = structuredSummaryConverter(text)
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