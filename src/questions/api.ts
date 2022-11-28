import { QuestionFilter, Question } from './types.js'

export async function fetchQuestions(filter: QuestionFilter, sample?: number, not?: Array<string>): Promise<{
    success: boolean
    data: Question[]
}> {
    const url = new URL('https://server.byreference.xyz/questions')
    if (filter.chapter != null) url.searchParams.append('chapter', filter.chapter)
    if (filter.type != null) url.searchParams.append('type', filter.type.join(''))
    if (sample != null) url.searchParams.append('size', sample.toString())
    if (not != null && not.length > 0) url.searchParams.append('not', not.join(''))
    console.log(url.toString())
    return (await fetch(url)).json()
}

export async function fetchQuestionPoolSize(filter: QuestionFilter, not?: Array<string>, sample?: number): Promise<{
    success: boolean
    data: number
}> {
    const url = new URL('https://server.byreference.xyz/questions')
    url.searchParams.append('count', 'true')
    if (filter.chapter != null) url.searchParams.append('chapter', filter.chapter)
    if (filter.type != null) url.searchParams.append('type', filter.type.join(''))
    if (sample != null) url.searchParams.append('size', sample.toString())
    if (not != null && not.length > 0) url.searchParams.append('not', not.join(''))
    console.log(url.toString())
    return (await fetch(url)).json()
}