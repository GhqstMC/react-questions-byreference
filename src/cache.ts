import FIFO from 'fifo'
import { Question, QuestionFilter, QuestionType } from './questions/types.js'
import { fetchQuestionPoolSize, fetchQuestions } from './questions/api.js'

let poolSize: number | undefined = undefined
let lastIndex = 0
let questionsCache = new FIFO<Question>()

const prejump = "With great power the apostles"
const thing = `With great power the apostles in Jerusalem continued to testify to the resurrection of the Lord Jesus. And God's grace was so powerfully at work in them all that there were no needy people among them. For from time to time those who owned land or houses sold them, brought the money from the sale, and put it at the apostles' feet, and it was distributed to anyone who had need.`

const quoteTest: Question = {
    tag: "sdfg",
    type: QuestionType.REFERENCE,
    prefix: 'Finish this verse and give the reference:',
    contentPrefix: '"',
    content: prejump,
    contentSuffix: '"',
    answer: `"${thing}"`,
    reference: { formatted: 'Acts 1:8', book: 'Acts', chapter: 1, verse: 8 },
    syllables: prejump.split(' ')
}
const accordingToTest: Question = {
    tag: "",
    type: QuestionType.ACCORDING_TO,
    prefix: 'According to Acts',
    contentPrefix: '',
    content: 'chapter one, verse one, who began to teach',
    contentSuffix: '',
    answer: 'Jesus',
    reference: { formatted: 'Acts 1:1', book: 'Acts', chapter: 1, verse: 1 },
    syllables: [
        [ 'chap', 'ter' ],
        [ 'o', 'ne,' ],
        [ 'verse' ],
        [ 'o', 'ne,' ],
        [ 'who' ],
        [ 'be', 'gan' ],
        [ 'to' ],
        [ 'teach' ]
    ]

}

questionsCache.push(quoteTest)

async function fetchMoreQuestions(filter: QuestionFilter, not?: Array<string>) {
    const {data} = await fetchQuestions(filter, Math.min(20, poolSize - questionsCache.length), not)
    console.log('data', data)
    if (data != null) {
        data.forEach(q => questionsCache.push(q))
    }
}


export const queryFunction = async (ctx) => {
    const [_, index, filter, not] = ctx.queryKey
    if (poolSize == undefined) {
        const {data} = await fetchQuestionPoolSize(filter, not)
        poolSize = data
    }
    if (questionsCache.length < 5 && questionsCache.length > 0) {
        fetchMoreQuestions(filter, not)
    }
    if (questionsCache.length > 0) {
        if (index == lastIndex) {
            return [questionsCache.first(), poolSize]
        } else {
            lastIndex = index
            return [questionsCache.shift(), poolSize]
        }
    } else {
        await fetchMoreQuestions(filter, not)
        lastIndex = index
        return [questionsCache.shift(), poolSize]
    }
}
