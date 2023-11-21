"use client"
import { useRef, useEffect } from "react"

export default function DisplayImage({ imageID }: { imageID: string }) {
    const imageRef = useRef<HTMLImageElement>(null!)

    useEffect(() => {
        const widthLonger = imageRef.current.offsetWidth > imageRef.current.offsetHeight

        const seenImageEl = imageRef.current

        if (widthLonger) {
            seenImageEl.style.width = "100%"
        }
    }, [])

    return (
        <img ref={imageRef} style={{ objectFit: "contain" }} src={imageID} />
    );
}
