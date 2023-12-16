
import { atom } from 'jotai'

export const inProduction = process.env.NEXT_PUBLIC_IN_DEVELOPMENT_FLAG === undefined ? true : false

export const myUrl = inProduction ? "vercel.com" : "http://localhost:3000/"

export const defaultImage = "https://images.pexels.com/photos/264907/pexels-photo-264907.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"

export const themeGlobal = atom<boolean | undefined>(undefined);


