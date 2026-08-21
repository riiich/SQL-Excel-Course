import { useCallback, useEffect, useRef, useState } from 'react'
import type { QueryResult, SchemaItem } from '../types'

interface PendingRequest {
  resolve: (value: unknown) => void
  reject: (reason: Error) => void
  timeout: number
}

export function useSqlEngine(setupSql: string) {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef(new Map<number, PendingRequest>())
  const requestId = useRef(0)
  const [schema, setSchema] = useState<SchemaItem[]>([])
  const [ready, setReady] = useState(false)

  const rejectPending = useCallback((message: string) => {
    pendingRef.current.forEach(({ reject, timeout }) => {
      window.clearTimeout(timeout)
      reject(new Error(message))
    })
    pendingRef.current.clear()
  }, [])

  const startWorker = useCallback(() => {
    workerRef.current?.terminate()
    rejectPending('The database was restarted.')
    const worker = new Worker(new URL('../workers/sql.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event) => {
      const pending = pendingRef.current.get(event.data.id)
      if (!pending) return
      window.clearTimeout(pending.timeout)
      pendingRef.current.delete(event.data.id)
      if (event.data.ok) pending.resolve(event.data.data)
      else pending.reject(new Error(event.data.error))
    }
    worker.onerror = () => rejectPending('The SQL engine stopped unexpectedly.')
    workerRef.current = worker
    return worker
  }, [rejectPending])

  const send = useCallback(<T,>(type: string, payload: unknown, limit = 4000) => {
    return new Promise<T>((resolve, reject) => {
      const worker = workerRef.current
      if (!worker) return reject(new Error('The SQL engine is not ready.'))
      const id = ++requestId.current
      const timeout = window.setTimeout(() => {
        pendingRef.current.delete(id)
        worker.terminate()
        workerRef.current = null
        setReady(false)
        reject(new Error('Query stopped after 4 seconds. Check for runaway recursion or a very large join.'))
      }, limit)
      pendingRef.current.set(id, { resolve: resolve as (value: unknown) => void, reject, timeout })
      worker.postMessage({ id, type, payload })
    })
  }, [])

  const initialize = useCallback(async () => {
    setReady(false)
    startWorker()
    const data = await send<{ schema: SchemaItem[] }>('init', { setupSql }, 8000)
    setSchema(data.schema)
    setReady(true)
  }, [send, setupSql, startWorker])

  useEffect(() => {
    void initialize().catch(() => setReady(false))
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
      rejectPending('The lesson changed.')
    }
  }, [initialize, rejectPending])

  const run = useCallback((sql: string) => send<QueryResult>('run', { sql }), [send])
  const reset = useCallback(async () => {
    if (!workerRef.current) startWorker()
    const data = await send<{ schema: SchemaItem[] }>('reset', { setupSql }, 8000)
    setSchema(data.schema)
    setReady(true)
  }, [send, setupSql, startWorker])

  return { ready, run, reset, schema, restart: initialize }
}
