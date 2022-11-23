export enum QuestionType {
    'GENERAL',
    'ACCORDING_TO',
    'CONTEXT',
    'BOOK_AND_CHAPTER',
    'SITUATION',
    'VERSE',
    'REFERENCE',
    'QUOTE'
}

// Return a formatted, uppercase string of the question type
export function formatQuestionType(type: QuestionType) {
    return QuestionType[type].replace(/_/g, ' ')
}

export type Reference = {
    formatted: string
    book: string
    chapter: number
    verse: number
}

export type ReferenceMultiple = {
    formatted: string
    book: string
    chapter: number
    verse: number | number[]
}

export type Question = {
    tag: string
    type: QuestionType
    prefix: string
    contentPrefix: string // Something like a quotation mark that comes before first word but not in prefix area
    content: string
    contentSuffix: string
    answer: string
    reference: ReferenceMultiple
    syllables: Array<string> | Array<string[]>
}