import type {
  ImportPreview,
  ImportRow,
} from './types'

function parseLine(
  line: string,
): string[] {
  const values: string[] = []

  let current = ''
  let quoted = false

  for (let i = 0; i < line.length; i += 1) {
    const character = line[i]

    if (character === '"') {
      if (
        quoted &&
        line[i + 1] === '"'
      ) {
        current += '"'
        i += 1
      } else {
        quoted = !quoted
      }

      continue
    }

    if (character === ',' && !quoted) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += character
  }

  values.push(current.trim())

  return values
}

function splitCsv(
  content: string,
): string[] {
  const lines: string[] = []

  let current = ''
  let quoted = false

  for (let i = 0; i < content.length; i += 1) {
    const character = content[i]

    if (character === '"') {
      if (
        quoted &&
        content[i + 1] === '"'
      ) {
        current += '""'
        i += 1
      } else {
        quoted = !quoted
        current += character
      }

      continue
    }

    if (
      (character === '\n' || character === '\r') &&
      !quoted
    ) {
      if (character === '\r' && content[i + 1] === '\n') {
        i += 1
      }

      if (current.trim()) {
        lines.push(current)
      }

      current = ''
      continue
    }

    current += character
  }

  if (current.trim()) {
    lines.push(current)
  }

  return lines
}

export function parseCsv(
  content: string,
): ImportPreview {
  const lines = splitCsv(
    content.replace(/^\uFEFF/, ''),
  )

  if (lines.length === 0) {
    throw new Error('The CSV file is empty.')
  }

  const headers = parseLine(lines[0] ?? '').map(
    (header) => header.trim(),
  )

  if (
    headers.length === 0 ||
    headers.every((header) => !header)
  ) {
    throw new Error(
      'The CSV file does not contain headers.',
    )
  }

  const duplicateHeaders = headers.filter(
    (header, index) =>
      headers.indexOf(header) !== index,
  )

  if (duplicateHeaders.length > 0) {
    throw new Error(
      `Duplicate CSV headers: ${[
        ...new Set(duplicateHeaders),
      ].join(', ')}`,
    )
  }

  const rows: ImportRow[] = lines
    .slice(1)
    .map((line, index) => {
      const values = parseLine(line)

      const row: Record<string, string> = {}

      headers.forEach((header, columnIndex) => {
        row[header] = values[columnIndex] ?? ''
      })

      return {
        rowNumber: index + 2,
        values: row,
      }
    })

  return {
    headers,
    rows,
    totalRows: rows.length,
  }
}