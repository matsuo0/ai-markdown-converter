'use client'

import { useState } from 'react'
import MarkdownConverter from '@/components/MarkdownConverter'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI 文章要約・Markdown変換
          </h1>
          <p className="text-lg text-gray-600">
            文章を入力して、AIが要約してMarkdown形式にまとめます
          </p>
        </div>
        
        <MarkdownConverter />
      </div>
    </main>
  )
} 