"use client"

import { useRef, useCallback } from "react"

/**
 * Creates a stable callback that doesn't change on re-renders
 * but always calls the latest function provided.
 *
 * This is useful for callbacks passed to effects that shouldn't
 * cause the effect to re-run when the callback changes.
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback)

  // Update the ref whenever the callback changes
  callbackRef.current = callback

  // Return a stable function that calls the current callback
  return useCallback(
    ((...args) => {
      return callbackRef.current(...args)
    }) as T,
    [],
  )
}

