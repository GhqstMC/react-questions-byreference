import { Question, QuestionFilter, QuestionType } from './types.js'
import { fetchQuestionPoolSize, fetchQuestions } from './api.js'
import FIFO from 'fifo'

export function fifoAsArray<F>(fifo: FIFO): F[] {
    const arr = new Array(fifo.length)
    let last = fifo.node
    for (let i = 0; i < fifo.length; i++) {
        last = fifo.next(last)
        arr[i] = last
    }
    return arr
}

export class QuestionCache {

    poolSize: number
    currentPool: FIFO<Question> = new FIFO<Question>()
    currentQuestion: Question

    repetitionLimit: number = 10
    recentTags: FIFO<string> = new FIFO<string>()

    // updateQuestion: (question: Question) => void

    filter: QuestionFilter = {}

    constructor() {
        console.log('constructing')
        // this.updateQuestion = updateQuestion
        this.reinitializePool()
    }

    nextQuestion() {
        this.currentQuestion = this.currentPool.shift() as unknown as Question
        this.recentTags.push(this.currentQuestion.tag)
        if (this.recentTags.length > this.repetitionLimit) this.recentTags.shift()
        if (this.currentPool.length < 10) this.fetchMoreQuestions()
        // this.updateQuestion(this.currentQuestion)
        return this.currentQuestion
    }

    async reinitializePool() {
        await this.fetchPoolSize()
        await this.fetchMoreQuestions()
        this.nextQuestion()
    }

    async fetchPoolSize() {
        this.poolSize = (await fetchQuestionPoolSize(this.filter)).data
        console.log('pool size', this.poolSize)
        this.calculateRepetitionLimit()
    }

    async fetchMoreQuestions() {
        const { data } = await fetchQuestions(this.filter, Math.min(15, this.poolSize), fifoAsArray<string>(this.recentTags))
        data.forEach(q => this.currentPool.push(q))
    }

    calculateRepetitionLimit() {
        this.repetitionLimit = Math.min(this.poolSize, 10)
    }

    resetPool() {
        this.currentPool = new FIFO<Question>()
        this.recentTags = new FIFO<string>()
        this.reinitializePool()
    }

    updateFilterTypes(types: QuestionType[]) {
        this.filter.type = types
        this.resetPool()
    }

    updateFilterChapter(chapter: string) {
        this.filter.chapter = chapter
        this.resetPool()
    }

}
//
// export default new QuestionCache()