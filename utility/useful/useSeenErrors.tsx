"use client"
import React, { useEffect, useRef, useState } from 'react'
import { ZodError } from 'zod-validation-error'

export default function useSeenErrors(passedErrors: (Error | ZodError | undefined)) {

    const [seenErrors, seenErrorsSet] = useState<JSX.Element | undefined>()

    useEffect(() => {
        if (!passedErrors) return

        console.log(`$use effect ran`, passedErrors);

        let isZodError = false

        try {//test if zod error
            JSON.parse(passedErrors.message)
            isZodError = true
        } catch (otherError) {
        }

        if (isZodError) {
            //zod error
            seenErrorsSet(() => {
                const childPs = JSON.parse(passedErrors.message).map((eachErr: ZodError, index: number) => <p key={index}>{eachErr.message}</p>)
                return <div>{childPs}</div>
            })
        } else {
            //normal error
            seenErrorsSet(() => {
                return <div>{passedErrors.message}</div>
            })
        }

    }, [passedErrors])

    //clear seenError after some time
    const myErrorTimeout = useRef<undefined | NodeJS.Timeout>()
    useEffect(() => {
        if (seenErrors !== undefined) {
            if (myErrorTimeout.current) clearTimeout(myErrorTimeout.current)

            myErrorTimeout.current = setTimeout(() => {
                seenErrorsSet(undefined)
            }, 15000)
        }
    }, [seenErrors])



    return seenErrors
}
