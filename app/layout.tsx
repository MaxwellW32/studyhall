import { Inter } from 'next/font/google'
import './globals.css'
import QueryAndAuthWrapper from './QueryAndAuthWrapper'
import { Metadata } from 'next'
import { options } from './api/auth/[...nextauth]/options'
import { getServerSession } from 'next-auth'
// import { redirect } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Study Hall',
  description: 'Generated by developers for students',
}

export default async function RootLayout({ children, }: { children: React.ReactNode }) {
  const session = await getServerSession(options)

  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryAndAuthWrapper>
          {/* <p>{session?.user.}</p> */}
          {children}
        </QueryAndAuthWrapper>
      </body>
    </html>
  )
}
