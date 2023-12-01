"use client"
import { atom, useAtom } from 'jotai'
import { useLayoutEffect } from 'react';

export const screenSizeGlobal = atom<{
    desktop: boolean
    tablet: boolean,
    phone: boolean,
}>({
    desktop: false,
    tablet: false,
    phone: false
});

export default function AtomLoader() {
    const [screenSize, screenSizeSet] = useAtom(screenSizeGlobal)

    const findScreenSize = () => {
        // const matchPhone = window.matchMedia("(max-width: 768px)")

        screenSizeSet(prev => {
            prev.desktop = false
            prev.tablet = false
            prev.phone = false

            return { ...prev }
        })

        if (window.innerWidth > 1024) {
            screenSizeSet(prev => {
                prev.desktop = true
                return { ...prev }
            })
        } else if (window.innerWidth > 768) {
            screenSizeSet(prev => {
                prev.tablet = true
                return { ...prev }
            })
        } else {
            screenSizeSet(prev => {
                prev.phone = true
                return { ...prev }
            })
        }
    }

    useLayoutEffect(() => {
        findScreenSize()
        window.addEventListener("resize", findScreenSize)

        return () => {
            window.removeEventListener("resize", findScreenSize)
        }
    }, [])

    return null
}
