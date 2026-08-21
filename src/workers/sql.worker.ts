/// <reference lib="webworker" />
import initSqlJs, { type Database } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import type { QueryResult, SchemaItem, SqlValue } from '../types'

let database: Database | null = null
let setupSql = ''

const sqlPromise = initSqlJs({ locateFile: () => wasmUrl })

async function reset(sql: string) {
  const SQL = await sqlPromise
  database?.close()
  database = new SQL.Database()
  setupSql = sql
  if (setupSql.trim()) database.run(setupSql)
}

function schema(): SchemaItem[] {
  if (!database) return []
  const result = database.exec(`
    SELECT name, type, sql
    FROM sqlite_master
    WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
    ORDER BY type, name
  `)[0]
  if (!result) return []
  return result.values.map((row) => ({
    name: String(row[0]),
    type: String(row[1]),
    sql: String(row[2] ?? ''),
  }))
}

function execute(sql: string): QueryResult {
  if (!database) throw new Error('The lesson database is still warming up.')
  const started = performance.now()
  const results = database.exec(sql)
  const last = results[results.length - 1]
  return {
    columns: last?.columns ?? [],
    rows: (last?.values ?? []) as SqlValue[][],
    duration: performance.now() - started,
    affectedRows: database.getRowsModified(),
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { id, type, payload } = event.data
  try {
    if (type === 'init' || type === 'reset') {
      await reset(payload.setupSql)
      self.postMessage({ id, ok: true, data: { schema: schema() } })
      return
    }
    if (type === 'run') {
      self.postMessage({ id, ok: true, data: execute(payload.sql) })
      return
    }
    if (type === 'schema') {
      self.postMessage({ id, ok: true, data: schema() })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error'
    self.postMessage({ id, ok: false, error: message.replace(/^Error:\s*/, '') })
  }
}

export {}
