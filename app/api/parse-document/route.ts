import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
// @ts-ignore
import PDFParser from 'pdf2json';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';

        const fileName = file.name.toLowerCase();

        if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
            text = await new Promise((resolve, reject) => {
                const pdfParser = new PDFParser(null, true);
                pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
                pdfParser.on("pdfParser_dataReady", () => {
                    resolve(pdfParser.getRawTextContent());
                });
                pdfParser.parseBuffer(buffer);
            });
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileName.endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if (fileName.endsWith('.csv') || file.type === 'text/csv') {
            // CSV is just text — no library needed
            text = buffer.toString('utf-8');
        } else if (
            fileName.endsWith('.xlsx') ||
            fileName.endsWith('.xls') ||
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel'
        ) {
            // xlsx/xls are binary formats — ask user to export as CSV
            return NextResponse.json({
                error: 'Excel binary formats (.xlsx/.xls) are not supported due to security concerns. Please export your spreadsheet as a CSV file and upload that instead.'
            }, { status: 415 });
        } else {
            // Treat everything else as text (code files, .txt, .md, .json, etc.)
            text = buffer.toString('utf-8');
        }

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error('Document parsing error:', error);
        return NextResponse.json({ error: error.message || 'Error parsing document' }, { status: 500 });
    }
}
