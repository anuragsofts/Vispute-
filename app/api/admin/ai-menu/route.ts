import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const textPrompt = formData.get('text') as string | null

    let extractedItems: any[] = []

    const apiKey = process.env.GEMINI_API_KEY

    if (apiKey && file) {
      // Use Gemini 1.5 Flash to parse menu image
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are extracting a restaurant menu for an Indian restaurant in Maharashtra.
                    Return ONLY valid JSON matching this schema:
                    {
                      "items": [
                        {
                          "name_en": "Item Name in English",
                          "name_mr": "आयटमचे नाव मराठीत",
                          "category": "Category name",
                          "price": 120,
                          "is_veg": true
                        }
                      ]
                    }
                    Never include markdown formatting, backticks, or other text outside the JSON.`,
                  },
                  {
                    inline_data: {
                      mime_type: file.type || 'image/jpeg',
                      data: base64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              response_mime_type: 'application/json',
            },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          const parsed = JSON.parse(text)
          extractedItems = parsed.items || []
        }
      }
    }

    // Fallback parser if no API key or image parsing failed
    if (extractedItems.length === 0 && textPrompt) {
      // Try to parse text pasted by admin
      try {
        const parsed = JSON.parse(textPrompt)
        extractedItems = parsed.items || parsed
      } catch {
        // Line-by-line format: "Item Name - 150"
        const lines = textPrompt.split('\n')
        for (const line of lines) {
          const match = line.match(/^(.+?)[\s\-:₹]+(\d+)/)
          if (match) {
            extractedItems.push({
              name_en: match[1].trim(),
              name_mr: match[1].trim(),
              category: 'General',
              price: Number(match[2]),
              is_veg: true,
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      items: extractedItems,
    })
  } catch (error: any) {
    console.error('Error parsing AI menu:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
