"use client"

import { ReactNode, useState } from "react"

export default function ShowMore({ title, children, startOpened, headingStyles, titleStyles, seeMoreContStyles, spinner }: { title: string, children: ReactNode, startOpened?: boolean, headingStyles?: React.CSSProperties, titleStyles?: React.CSSProperties, seeMoreContStyles?: React.CSSProperties, spinner?: JSX.Element }) {
    const [showing, showingSet] = useState(startOpened ? true : false)

    return (
        <div style={{ color: "#fff" }}>
            <div className="dimOnMouse" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", backgroundColor: "#aaa", padding: "1rem", cursor: "pointer", ...headingStyles, }} onClick={() => { showingSet(prev => !prev) }}>
                <p style={{ ...titleStyles }} >{title}</p>

                <div style={{ aspectRatio: "1/1", height: "1rem", rotate: showing ? "180deg" : "" }} >
                    {spinner ? spinner :
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" /></svg>
                    }
                </div>
            </div>

            <div style={{ display: showing ? "grid" : "none", padding: "1rem", backgroundColor: "#777", gap: "1rem", ...seeMoreContStyles }}>
                {children}
            </div>
        </div>
    )
}
