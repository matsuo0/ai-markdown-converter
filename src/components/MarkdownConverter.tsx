'use client'

import { useState, useEffect } from 'react'
import { convertToMarkdown } from '@/lib/ai-service'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownConverter() {
  const [inputText, setInputText] = useState('')
  const [markdownOutput, setMarkdownOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)

  useEffect(() => {
    // APIキーの有無をチェック
    const checkApiKey = async () => {
      try {
        const response = await fetch('/api/check-api-key')
        const data = await response.json()
        setHasApiKey(data.hasApiKey)
      } catch (error) {
        setHasApiKey(false)
      }
    }
    checkApiKey()
  }, [])

  const handleConvert = async () => {
    if (!inputText.trim()) {
      setError('文章を入力してください')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await convertToMarkdown(inputText)
      setMarkdownOutput(result)
    } catch (err) {
      setError('要約中にエラーが発生しました。もう一度お試しください。')
      console.error('Conversion error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownOutput)
      alert('Markdownをクリップボードにコピーしました')
    } catch (err) {
      console.error('Copy error:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* APIキー状態の表示 */}
      {hasApiKey !== null && (
        <div className={`rounded-md p-4 ${
          hasApiKey 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <p className={`text-sm ${
            hasApiKey ? 'text-green-800' : 'text-yellow-800'
          }`}>
            {hasApiKey 
              ? '✅ OpenAI APIキーが設定されています（高度なAI要約を使用）'
              : '⚠️ OpenAI APIキーが設定されていません（基本的な変換を使用）。より高度な要約のためには、.env.localファイルにOPENAI_API_KEYを設定してください。'
            }
          </p>
        </div>
      )}

      {/* 入力エリア */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">
          要約したい文章を入力してください
        </label>
        <textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="ここに要約したい文章を入力してください..."
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isLoading}
        />
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handleConvert}
            disabled={isLoading || !inputText.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '要約中...' : '要約してMarkdownに変換'}
          </button>
          <span className="text-sm text-gray-500">
            {inputText.length} 文字
          </span>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* 出力エリア */}
      {markdownOutput && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">要約結果（Markdown）</h3>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              コピー
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-4 border">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {markdownOutput}
            </pre>
          </div>
        </div>
      )}

      {/* プレビューエリア */}
      {markdownOutput && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">要約プレビュー</h3>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              className="markdown-preview"
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-gray-900" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 text-gray-800" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 text-gray-700" {...props} />,
                p: ({node, ...props}) => <p className="mb-3 text-gray-700 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 text-gray-700" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 text-gray-700" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3" {...props} />,
                code: ({node, inline, ...props}: any) => inline ? 
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} /> :
                  <code className="block bg-gray-100 p-3 rounded text-sm font-mono mb-3" {...props} />,
                hr: ({node, ...props}) => <hr className="border-gray-300 my-4" {...props} />
              }}
            >
              {markdownOutput}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
} 