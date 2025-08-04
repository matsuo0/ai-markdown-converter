export async function convertToMarkdown(text: string): Promise<string> {
  try {
    const response = await fetch('/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error('APIリクエストが失敗しました')
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }

    return data.markdown || '変換に失敗しました'
  } catch (error) {
    console.error('AI conversion error:', error)
    throw new Error('AI変換サービスでエラーが発生しました')
  }
}

// フォールバック用のシンプルなMarkdown変換関数
export function simpleMarkdownConverter(text: string): string {
  // 基本的なMarkdown変換ルール
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