import syllables from 'nlp-syllables/src/syllables.js'
import * as csv from '@fast-csv/parse'
import * as fs from 'node:fs'
import { Question, QuestionType } from './src/questions/types.js'
import nlp from 'compromise'
import { MongoClient } from 'mongodb'

const uri = ''
const client = new MongoClient(uri)


const rows: Question[] = []

type Row = {
    Id: string
    Type: string
    Question: string
    Answer: string
    Reference: string
    Book: string
    Chapter: string
    Verse: string
    StartVerse: string
}

function syllablesButWeird(str: string): string[][] | string[] {
    const s = syllables(str)
    if (!Array.isArray(s[0])) return s
    return s.map(word => {
        let comma = false
        let test = word.join('')
        if (test.endsWith(',')) {
            comma = true
            test = test.substring(0, test.length - 1)
        }
        switch(test) {
            case 'one':
                return ['o', `ne${comma ? ',' : ''}`]
            case 'two':
                return ['tw', `o`]
            case 'three':
                return ['th', `ree${comma ? ',' : ''}`]
            case 'four':
                return ['fo', `ur${comma ? ',' : ''}`]
            case 'five':
                return ['fi', `ve${comma ? ',' : ''}`]
            case 'six':
                return ['si', `x${comma ? ',' : ''}`]
            case 'seven':
                return ['se', `ven${comma ? ',' : ''}`]
            case 'eight':
                return ['ei', `ght${comma ? ',' : ''}`]
            case 'nine':
                return ['ni', `ne${comma ? ',' : ''}`]
            case 'ten':
                return ['te', `n${comma ? ',' : ''}`]
            case 'eleven':
                return ['el', 'e', `ven${comma ? ',' : ''}`]
            case 'twelve':
                return ['tw', 'e', `lve${comma ? ',' : ''}`]
            case 'thirteen':
                return ['th', 'ir', `teen${comma ? ',' : ''}`]
            case 'fourteen':
                return ['fo', 'ur', `teen${comma ? ',' : ''}`]
            case 'fifteen':
                return ['fi', 'f', `teen${comma ? ',' : ''}`]
            case 'sixteen':
                return ['si', 'x', `teen${comma ? ',' : ''}`]
            case 'seventeen':
                return ['se', 'ven', `teen${comma ? ',' : ''}`]
            case 'eighteen':
                return ['ei', 'ght', `een${comma ? ',' : ''}`]
            case 'nineteen':
                return ['ni', 'ne', `teen${comma ? ',' : ''}`]
            case 'twenty':
                return ['twen', `ty${comma ? ',' : ''}`]
            case 'thirty':
                return ['th', 'ir', `ty${comma ? ',' : ''}`]
            case 'forty':
                return ['fo', `rty${comma ? ',' : ''}`]
            case 'fifty':
                return ['fi', `fty${comma ? ',' : ''}`]
            case 'sixty':
                return ['si', `xty${comma ? ',' : ''}`]
            case 'seventy':
                return ['sev', 'en', `ty${comma ? ',' : ''}`]
            case 'eighty':
                return ['ei', `ghty${comma ? ',' : ''}`]
            case 'ninety':
                return ['nine', `ty${comma ? ',' : ''}`]
            default:
                return word
        }
    })
}

// Return the given Question type for the single character abbreviation
const parseType = (input: string): QuestionType => {
    switch (input) {
        case 'G':
            return QuestionType.GENERAL
        case 'A':
            return QuestionType.ACCORDING_TO
        case 'X':
            return QuestionType.CONTEXT
        case 'B':
            return QuestionType.BOOK_AND_CHAPTER
        case 'S':
            return QuestionType.SITUATION
        case 'V':
            return QuestionType.VERSE
        case 'R':
            return QuestionType.REFERENCE
        case 'Q':
            return QuestionType.QUOTE
        default:
            return QuestionType.GENERAL
    }
}

const parseVerse = (verse: string): number | number[] => {
    if (verse.includes('-')) {
        const [start, end] = verse.split('-')
        try {
            let arr = new Array(parseInt(end) - parseInt(start) + 1)
            for (let i = parseInt(start); i <= parseInt(end); i++) {
                arr[i - parseInt(start)] = i
            }
            return arr
        } catch (e) {
            console.log(e)
            console.log(verse)
            client.close().then(() => process.exit(1))
        }

    } else if (verse.includes(',')) {
        return verse.split(',').map((v) => parseInt(v))
    } else {
        return parseInt(verse)
    }
}

function nthIndexOf(str, pattern, n) {
    var i = -1

    while (n-- && i++ < str.length) {
        i = str.indexOf(pattern, i)
        if (i < 0) break
    }

    return i
}

const parsePrefixes = (question: string): {
    prefix: string
    contentPrefix: string
    content: string
    contentSuffix: string
} => {
    if (question.startsWith('Situation question:')) { // SITUATION
        const prefix = question.substring(0, question.substring(19).indexOf(':') + 21)
        const content = question.substring(prefix.length + 1, question.length - 1)
        return {
            prefix,
            content,
            contentPrefix: '"',
            contentSuffix: '"'

        }
    } else if (question.startsWith('Quote ') || question.startsWith('According to')) { // QUOTE
        const prefix = question.substring(0, question.indexOf(','))
        let content = question.substring(prefix.length + 2, question.length - 1)
        const doc = nlp(content)
        doc.numbers().toText()
        content = doc.text()
        return {
            prefix,
            content,
            contentPrefix: '',
            contentSuffix: ''
        }
    } else if (question.startsWith('Finish this verse and give the reference') || question.startsWith('Finish these verses and give the reference')) { // REFERENCE
        const prefix = question.substring(0, question.indexOf(':') + 1)
        const content = question.substring(prefix.length + 2, question.length - 1)
        return {
            prefix,
            content,
            contentPrefix: '"',
            contentSuffix: ''
        }
    } else if (question.startsWith('Finish this verse') || question.startsWith('Finish these verses')) { // VERSE
        const prefix = question.substring(0, question.indexOf(':') + 1)
        const content = question.substring(prefix.length + 2, question.length - 1)
        return {
            prefix,
            content,
            contentPrefix: '"',
            contentSuffix: ''
        }
    } else if (question.startsWith('Two-part answer:') || question.startsWith('Three-part answer:') || question.startsWith('Two-part question:') || question.startsWith('Three-part question:')) { // CONTEXT
        let prefix = question.substring(0, question.indexOf(':') + 1)
        if (question.substring(prefix.length + 1, prefix.length + 18) === 'in Acts, chapter ') {
            prefix = question.substring(0, nthIndexOf(question, ',', 2))
        }

        let content = question.substring(prefix.length + 1, question.length - 1).trimStart()
        if (!question.endsWith('"')) {
            content = question.substring(prefix.length + 1, question.length).trimStart()
        }
        return {
            prefix,
            content,
            contentPrefix: '',
            contentSuffix: ''
        }
    } else if (question.startsWith('In Acts, chapter ')) {
        const prefix = question.substring(0, nthIndexOf(question, ',', 2) + 1)
        let content = question.substring(prefix.length, question.length - 1).trimStart()
        if (!question.endsWith('"')) {
            content = question.substring(prefix.length, question.length).trimStart()
        }
        return {
            prefix,
            content,
            contentPrefix: '',
            contentSuffix: ''
        }
    } else if (question.startsWith('From what Old Testament')
        || question.startsWith('Complete, in essence, the following Old')
        || question.startsWith('Complete, in essence, the following')) {
        const prefix = question.substring(0, question.indexOf(':') + 1)
        let content = question.substring(prefix.length + 2, question.length - 1)
        content = content.replace(' . . .', '...')
        return {
            prefix,
            content,
            contentPrefix: '"',
            contentSuffix: '"'
        }
    } else {
        return {
            prefix: '',
            content: question,
            contentPrefix: '',
            contentSuffix: ''
        }
    }
}
// REPLACE STUFF LIKE [ 'eight' ] with [ 'ei', 'ght' ]

// let doc = nlp('Quote Acts, Chapter 5, verses 8 through 9')
// doc.numbers().toText()
// console.log(doc.text())

// console.log(parsePrefixes('Quote Acts, chapter 8, verses 32 through 33.'))

// console.log(syllables('Quote Acts, Chapter 5, verses 8 through ?d it, and to whom: "This is a test"'))

function addToRows(row: Question) {
    rows.push(row)
    // if (rows.findIndex(r => r != null && r.content === row.content) === -1) {
    //    
    // } else {
    //     console.log('Duplicate question found: ' + row.content)
    // }
}

async function run() {
    try {
        await client.connect()

        await client.db('questions').command({ 
            killAllSessions: [
                { user: 'byref' }
            ]
        })
        console.log('Connected successfully to server')

        let index = 0

        return

        fs.createReadStream('all questions no quotes.csv')
            .pipe(csv.parse({headers: true}))
            .on('error', error => console.error(error))
            .on('data', (row: Row) => {
                const prefixes = parsePrefixes(row.Question)
                // console.log(++index)
                addToRows({
                    tag: Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6),
                    type: parseType(row.Type),
                    prefix: prefixes.prefix,
                    contentPrefix: prefixes.contentPrefix,
                    content: prefixes.content,
                    contentSuffix: prefixes.contentSuffix,
                    answer: row.Answer.replace('. . . ', '...'),
                    reference: {
                        formatted: row.Reference,
                        book: row.Book,
                        chapter: parseInt(row.Chapter),
                        verse: parseVerse(row.Verse)
                    },
                    syllables: syllablesButWeird(prefixes.content)
                })
            })
            .on('end', rowCount => {
                console.log(`Parsed ${rowCount} rows`)
                // console.log(`Added ${totalAdded} rows`)
                console.log(`Total ${rows.length} length`)
                console.log(rows.filter((r) => r.type === QuestionType.ACCORDING_TO)[0])
                // client.connect().then(() => {
                //     client.db('questions').collection('questions').insertMany(rows)
                // })
            })
    } finally {
        await client.close()
    }
}

run()
    .then(() => console.log('done'))
    .catch(console.dir)

