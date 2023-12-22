"use client"

import React, { useState } from 'react'
import { useDraw } from './useDraw'
import { Draw } from './canvasTypes'
import { drawLine } from './drawLine'
import { ChromePicker } from 'react-color';

export default function Page() {
    const [color, setColor] = useState<string>('#000')
    const { canvasRef, onMouseDown, clear } = useDraw(createLine)

    function createLine({ prevPoint, currentPoint, ctx }: Draw) {
        drawLine({ prevPoint, currentPoint, ctx, color })
    }

    return (
        <main style={{ display: "flex", alignItems: "center" }}>
            <div>
                <ChromePicker color={color} onChange={(e) => setColor(e.hex)} />
                <button onClick={clear}>Clear</button>
            </div>

            <div style={{ width: "400px", aspectRatio: "1/1", overflow: "scroll", resize: "both" }} >
                <canvas
                    ref={canvasRef}
                    onMouseDown={onMouseDown}
                    width={5000}
                    height={5000}
                />
            </div>
        </main>
    )
}
