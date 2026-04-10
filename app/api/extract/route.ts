import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const name = file.name.toLowerCase()
    let text = ''

    // ── PDF ──────────────────────────────────────────────────────────────────
    if (name.endsWith('.pdf')) {
      // pdf-parse v2 uses a class API — pass buffer as a data URL
      const { PDFParse } = await import('pdf-parse')
      const dataUrl = `data:application/pdf;base64,${buffer.toString('base64')}`
      const parser = new PDFParse({ url: dataUrl })
      const result = await parser.getText()
      text = result.text

    // ── Word ─────────────────────────────────────────────────────────────────
    } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value

    // ── Excel ─────────────────────────────────────────────────────────────────
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.xlsm')) {
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheets: string[] = []
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(sheet).trim()
        if (csv) sheets.push(`## Sheet: ${sheetName}\n${csv}`)
      })
      text = sheets.join('\n\n')

    // ── PowerPoint ────────────────────────────────────────────────────────────
    } else if (name.endsWith('.pptx') || name.endsWith('.ppt')) {
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(buffer)
      const slideTexts: string[] = []

      const slideFiles = Object.keys(zip.files)
        .filter(f => /^ppt\/slides\/slide\d+\.xml$/i.test(f))
        .sort((a, b) => {
          const na = parseInt(a.match(/slide(\d+)/)?.[1] ?? '0')
          const nb = parseInt(b.match(/slide(\d+)/)?.[1] ?? '0')
          return na - nb
        })

      for (const slideFile of slideFiles) {
        const xml = await zip.files[slideFile].async('text')
        // Extract all <a:t> text nodes
        const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) ?? []
        const slideText = matches.map(m => m.replace(/<[^>]*>/g, '')).filter(Boolean).join(' ')
        if (slideText.trim()) slideTexts.push(`[Slide ${slideFiles.indexOf(slideFile) + 1}] ${slideText}`)
      }
      text = slideTexts.join('\n\n')

    } else {
      return NextResponse.json({ error: 'Unsupported format for text extraction.' }, { status: 400 })
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'No readable text found in this file.' }, { status: 422 })
    }

    return NextResponse.json({ text: text.trim() })

  } catch (e) {
    console.error('[extract]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to extract text from file.' },
      { status: 500 }
    )
  }
}
