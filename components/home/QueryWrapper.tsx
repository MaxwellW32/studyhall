"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast';

import React, { ReactNode } from 'react'

const queryClient = new QueryClient

export default function QueryWrapper({ children }: { children: ReactNode }) {

    return (
        <QueryClientProvider client={queryClient}>
            <Toaster position="top-center" reverseOrder={false} />

            {children}
            <ReactQueryDevtools />
        </QueryClientProvider>
    )
}
