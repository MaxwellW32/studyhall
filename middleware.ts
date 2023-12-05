export { default } from "next-auth/middleware"

export const config = { matcher: ["/newCommunity", "/newCommunity/edit/:path*", "/user/edit/:path*", "/newStudySession", "/newStudySession/edit/:path*"] }