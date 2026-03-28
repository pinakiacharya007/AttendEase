export const dynamic = 'force-dynamic'

import NextAuth from 'next-auth'
import {authOptions} from '@/lib/auth'
const h=NextAuth(authOptions)
export {h as GET,h as POST}
