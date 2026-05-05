import { useEffect, useState } from 'react'

export const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const ws = useState(() => new WebSocket(url))[0]

  useEffect(() => {
    const handleOpen = () => setIsConnected(true)
    const handleClose = () => setIsConnected(false)
    const handleMessage = (event) => setData(JSON.parse(event.data))
    const handleError = (error) => setError(error)

    ws.addEventListener('open', handleOpen)
    ws.addEventListener('close', handleClose)
    ws.addEventListener('message', handleMessage)
    ws.addEventListener('error', handleError)

    return () => {
      ws.removeEventListener('open', handleOpen)
      ws.removeEventListener('close', handleClose)
      ws.removeEventListener('message', handleMessage)
      ws.removeEventListener('error', handleError)
    }
  }, [ws])

  const send = (message) => {
    if (isConnected) {
      ws.send(JSON.stringify(message))
    }
  }

  return { isConnected, data, error, send }
}

export const useGeolocation = () => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setLoading(false)
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
        setLoading(false)
      },
      (error) => {
        setError(error.message)
        setLoading(false)
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return { location, error, loading }
}

export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle')
  const [value, setValue] = useState(null)
  const [error, setError] = useState(null)

  const execute = async () => {
    setStatus('pending')
    try {
      const response = await asyncFunction()
      setValue(response)
      setStatus('success')
      return response
    } catch (error) {
      setError(error)
      setStatus('error')
    }
  }

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate])

  return { execute, status, value, error }
}

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}
