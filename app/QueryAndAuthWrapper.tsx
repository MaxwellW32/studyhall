"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from 'next-auth/react'

import React, { ReactNode } from 'react'

const queryClient = new QueryClient

export default function QueryAndAuthWrapper({ children }: { children: ReactNode }) {

    // import { useSession } from 'next-auth/react'
    // import { redirect } from 'next/navigation'

    // const { data: session } = useSession({
    //     required: true,
    //     onUnauthenticated() {
    //         redirect("/api/auth/signin?callbackUrl=/client")
    //     },
    // })

    // session?.user

    return (
        // <SessionProvider>
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools />
        </QueryClientProvider>
        // </SessionProvider>
    )
}
