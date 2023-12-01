import './globals.css'
import QueryWrapper from '../components/home/QueryWrapper'
import { Metadata } from 'next'
import NavBar from '@/components/home/NavBar'
import { getServerSession } from "next-auth"
import SessionProvider from "@/components/home/SessionProvider"
import { authOptions } from '@/lib/auth/auth-options'
import { getSpecificUser } from '@/utility/serverFunctions/handleUsers'
import AtomLoader from '@/components/home/AtomLoader'

export const metadata: Metadata = {
  title: 'Study Hall',
  description: 'Generated by developers for students',
}

export default async function RootLayout({ children, }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <QueryWrapper>
            <AtomLoader />
            <NavBar seenUser={session ? await getSpecificUser(session.user.id, "id") : undefined} />
            {children}
          </QueryWrapper>
        </SessionProvider>
      </body>
    </html>
  )
}
