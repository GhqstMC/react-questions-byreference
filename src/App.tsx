import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Questions from './Questions.js'
import { queryFunction } from './cache.js'


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryFn: queryFunction,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            staleTime: Infinity,
            keepPreviousData: true
        }
    }
})

function App() {
    return <QueryClientProvider client={queryClient}>
        <Questions/>
    </QueryClientProvider>
}

export default App
