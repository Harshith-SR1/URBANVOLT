const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

export class WebSocketService {
  constructor() {
    this.ws = null
    this.callbacks = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${WS_URL}/ws/updates`)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          this.callbacks.forEach((callback) => callback(data))
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected')
          this.attemptReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => this.connect(), 2000 * this.reconnectAttempts)
    }
  }

  subscribe(id, callback) {
    this.callbacks.set(id, callback)
  }

  unsubscribe(id) {
    this.callbacks.delete(id)
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }
}

export const wsService = new WebSocketService()
