interface Window {
  starModelCache: {
    isLoaded: boolean
    isLoading: boolean
    loadPromise: Promise<any> | null
    model: any | null
    error: boolean
    lastAttempt: number
    retryCount: number
    fallbackUsed: boolean
    localFallbackUsed: boolean
  }
}

