import './globals.css'
import QueryWrapper from '../components/home/QueryWrapper'
import { Metadata } from 'next'
import NavBar from '@/components/home/NavBar'
import { getServerSession } from "next-auth"
import SessionProvider from "@/components/home/SessionProvider"
import { authOptions } from '@/lib/auth/auth-options'
import { getSpecificUser } from '@/utility/serverFunctions/handleUsers'
import AtomLoader from '@/components/home/AtomLoader'
import ThemeProvider from '@/utility/ThemeProvider'
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Study Hall',
  description: 'Generated by developers for students',
}

export default async function RootLayout({ children, }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <ThemeProvider>
        <SessionProvider session={session}>
          <QueryWrapper>
            <Toaster position="top-center" reverseOrder={false} />
            <AtomLoader />
            {/* no need for this anymore */}
            <NavBar seenUser={session ? await getSpecificUser(session.user.id, "id") : undefined} />
            {children}
          </QueryWrapper>
        </SessionProvider>
      </ThemeProvider>
    </html>
  )
}
