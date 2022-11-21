import { Fragment, useState } from 'react'
import './App.css'
import { formatQuestionType, Question, QuestionType } from './questions/types'
import { renderSyllables } from './questions/syllables'
import { motion } from 'framer-motion'
import { copyTextToClipboard } from './utils/copy.js'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon as XIcon } from '@heroicons/react/24/outline'

const variants = {
    enter: (direction: number) => {
        return {
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }
    },
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => {
        return {
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        }
    }
}

const quoteTest: Question = {
    type: QuestionType.QUOTE,
    prefix: 'Quote Acts,',
    contentPrefix: '',
    content: 'chapter one, verse eight',
    contentSuffix: '',
    answer: '"But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.""',
    reference: { formatted: 'Acts 1:8', book: 'Acts', chapter: 1, verse: 8 },
    syllables: [ [ 'chap', 'ter' ], [ 'one,' ], [ 'verse' ], [ 'ei', 'ght' ] ]
}

const accordingToTest: Question = {
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




function App() {

    const [question, setQuestion] = useState<Question>(accordingToTest)

    const [syllableCount, setSyllableCount] = useState(1)

    const [answerVisible, setAnswerVisible] = useState(false)

    const [copied, setCopied] = useState(false)

    const [settingsOpen, setSettingsOpen] = useState(false)

    const copyCurrentText = () => {
        console.log(renderSyllables(question, syllableCount) + '"')
        copyTextToClipboard(answerVisible ? question.answer : question.prefix + ' ' + renderSyllables(question, syllableCount)).then(() => {
            setCopied(true)
            setTimeout(() => {
                setCopied(false)
            }, 800)
        })
    }

    const direction1 = 0
    const direction2 = -1

    const swipeConfidenceThreshold = 10000
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity
    }

    return (
        <>
            <div className="bg-lgray-900 w-full h-screen font-outfit flex">
                <div
                    className="bg-lgray-800 shadow overflow-x-hidden rounded-md text-white w-full sm:w-1/2 mt-5 mb-5 mr-2 ml-2 sm:m-auto">
                    <ul role="list" className="divide-y divide-lgray-750">
                        <motion.div layout className="grid grid-cols-1 grid-rows-1"
                                    drag="x" dragSnapToOrigin={true}
                                    dragConstraints={{left: 0, right: 0}}
                                    dragElastic={0.4}
                                    onDragEnd={(e, {offset, velocity}) => {
                                        const swipe = swipePower(offset.x, velocity.x)

                                        if (swipe < -swipeConfidenceThreshold || swipe > swipeConfidenceThreshold) {
                                            setAnswerVisible(!answerVisible)
                                        }
                                    }}
                                    onClick={(event) => {
                                        if (event.detail === 2) {
                                            setAnswerVisible(!answerVisible)
                                        }
                                    }}
                            // onClick={() => setAnswerVisible(!answerVisible)}
                        >

                            <div className={`col-span-full row-span-full lg:py-4 xl:py-8 opacity-0`}>
                                {question.prefix.length > 0 && <li className="px-4 py-4 pb-1 sm:px-6 lg:-mb-4 xl:mb-0 text-center question-text-header">
                                    {question.prefix}
                                </li>}
                                <li className="px-4 pt-1 lg:pt-4 pb-5 sm:px-6 text-center question-text">
                                    {question.contentPrefix + question.content + question.contentSuffix}
                                </li>
                            </div>

                            <motion.div layout
                                        className={`col-span-full row-span-full lg:py-4 xl:py-8 ${answerVisible && 'opacity-0'}`}>
                                {question.prefix.length > 0 && <li className="px-4 py-4 pb-1 sm:px-6 lg:-mb-4 xl:mb-0 text-center question-text-header">
                                    {question.prefix}
                                </li>}
                                <li className="px-4 pt-1 lg:pt-4 pb-6 sm:px-6 text-center question-text">
                                    {renderSyllables(question, syllableCount)}
                                </li>
                            </motion.div>


                            <motion.div layout
                                        className={`col-span-full row-span-full lg:py-4 xl:py-8 ${!answerVisible && 'opacity-0'}`}>
                                <li className="px-4 py-4 pb-2 sm:px-6 text-center question-text">
                                    {question.answer}
                                </li>
                            </motion.div>

                        </motion.div>

                        <li className="px-4 sm:px-6 lg:py-2 text-center text-sm lg:text-xl xl:text-2xl font-light relative">
                        <span
                            className="text-xs lg:text-lg absolute -top-[1.2rem] lg:-top-[2rem] left-0 right-0 mx-auto select-none cursor-pointer text-gray-300 bg-transparent"
                            onClick={() => copyCurrentText()}>{copied ? 'COPIED' : 'COPY'}</span>
                            <span className="py-0.5">{formatQuestionType(question.type)}</span>
                        </li>
                        <li className="px-4 py-4 sm:px-6 text-center text-xl">

                            <motion.button type="button"
                                           whileHover={{scale: 0.99}}
                                           whileTap={{scale: 0.975}}
                                           onClick={() => setSyllableCount(syllableCount + 1)}
                                           className="btn inline-flex w-full items-center justify-center px-2 py-1
                                       border border-transparent shadow-sm text-xl transition-colors font-medium rounded-md text-white
                                       bg-purple-500 hover:bg-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400
                                       lg:text-4xl lg:py-2">

                                <span className="-mt-1">Syllable</span>

                                {/* Heroicon name: outline/arrow-right */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 button-icon" fill="none"
                                     viewBox="0 0 24 24"
                                     stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                                </svg>
                            </motion.button>

                            <motion.button type="button"
                                           whileHover={{scale: 0.99}}
                                           whileTap={{scale: 0.975}}
                                           onClick={() => setSyllableCount(1)}
                                           className="btn inline-flex w-full items-center justify-center px-2 py-1 mt-2
                                        border border-transparent shadow-sm text-xl transition-colors font-medium rounded-md text-white
                                         bg-purple-600 hover:bg-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500
                                         lg:text-4xl lg:py-2">

                                {/* Heroicon name: solid/forward */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 button-icon" fill="currentColor"
                                     viewBox="0 0 24 24"
                                     stroke="currentColor">
                                    <path
                                        d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z"/>
                                </svg>
                                <span className="-mt-1">Question</span>

                            </motion.button>

                            <motion.button type="button"
                                           whileHover={{scale: 0.99}}
                                           whileTap={{scale: 0.975}}
                                           onClick={() => setSettingsOpen(true)}
                                           className="btn inline-flex w-full items-center justify-center px-2 pb-1 mt-2
                                        border border-transparent shadow-sm text-xl transition-colors font-medium rounded-md text-white
                                         bg-lgray-700 hover:bg-lgray-600 focus:outline-none focus:ring-1 focus:ring-lgray-600
                                         lg:text-4xl lg:py-2">

                                {/* Heroicon name: solid/cog-6-tooth */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 button-icon" fill="currentColor"
                                     viewBox="0 0 24 24"
                                     stroke="currentColor">
                                    <path fillRule="evenodd"
                                          d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                                          clipRule="evenodd"/>
                                </svg>
                                <span className="">Settings</span>

                            </motion.button>

                        </li>

                    </ul>
                </div>
            </div>


            <Transition.Root show={settingsOpen} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 overflow-hidden" onClose={setSettingsOpen}>
                    <div className="absolute inset-0 overflow-hidden">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-in-out duration-500"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in-out duration-500"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
                        </Transition.Child>

                        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <div className="w-screen max-w-2xl">
                                    <div className="h-full flex flex-col py-6 bg-lgray-850 shadow-xl overflow-y-auto text-white">
                                        <div className="px-4 sm:px-6">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-2xl font-medium text-white">Settings</Dialog.Title>
                                                <div className="ml-3 h-7 flex items-center">
                                                    <button
                                                        type="button"
                                                        className="bg-lgray-750 rounded-md text-gray-100 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        onClick={() => setSettingsOpen(false)}
                                                    >
                                                        <span className="sr-only">Close panel</span>
                                                        <XIcon className="h-6 w-6" aria-hidden="true"/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 relative flex-1 px-4 sm:px-6">
                                            {/* Replace with your content */}

                                            {/* /End replace */}
                                        </div>
                                    </div>
                                </div>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    )
}

export default App
