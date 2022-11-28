import syllables from 'nlp-syllables/src/syllables.js'
import { Question, QuestionType } from './types.js'

const test = syllables('Through your offspring all peoples on earth will be blessed.')

const question: Question = {
    tag: "",
    type: QuestionType.SITUATION,
    prefix: 'Situation question: Who said it, to whom, and about whom?',
    content: 'I will show him how much he must suffer for my name.',
    contentPrefix: '"',
    contentSuffix: '"',
    // @ts-ignore
    syllables: syllables('I will show him how much he must suffer for my name.'),
    answer: "The Lord said it to Ananias about Saul.",
    reference: {
        formatted: 'Acts 9:16',
        book: 'Acts',
        chapter: 9,
        verse: 16
    }
}

console.log(renderSyllables(question, 3))


export function renderSyllables(question: Question, index: number): string {

    let words = [...question.syllables]
    let str = question.contentPrefix
    // Concatenate the contents of a flattened nested array up to the specified index
    if (words[0] instanceof Array) {
        words.forEach((syllables) => {
            // @ts-ignore
            if (!syllables[syllables.length - 1].endsWith(' ')) syllables[syllables.length - 1] += ' '
        })

        words = words.flat()
    }

    for (let i = 0; i < index && i < words.length; i++) {
        str += words[i]
    }

    if (index >= words.length) {
        str += question.contentSuffix
    }
    
    if (str.endsWith('" "')) {
        str = str.slice(0, -2)
    }
    if (str.endsWith(' "')) {
        str = str.slice(0, -2) + '"'
    }

    return str.trimEnd()
}

// nlp.plugin(syllables)
//
// // ;(nlp as any).termWithSyllables('simplicity').then(term => {
// //     console.log(term)
// // })
//
// let text = nlp('What time is it?')

// console.log((text as any).syllables())