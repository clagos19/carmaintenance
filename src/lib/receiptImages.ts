/**
 * Receipt photos live in IndexedDB rather than localStorage: a phone gives a site only a few MB of
 * localStorage, while IndexedDB holds hundreds of photos.
 */

const DB = 'carmaint-receipts'
const STORE = 'images'

let dbp: Promise<IDBDatabase> | null = null

function db() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('This browser can’t store photos.'))
  dbp ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => {
      dbp = null
      reject(req.error ?? new Error('Photo storage is unavailable.'))
    }
  })
  return dbp
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const tx = d.transaction(STORE, mode)
        const req = fn(tx.objectStore(STORE))
        tx.oncomplete = () => resolve(req.result)
        tx.onerror = tx.onabort = () => reject(tx.error ?? new Error('Photo storage failed.'))
      }),
  )
}

/** Save a photo as a JPEG data URL under the receipt's id. */
export const saveReceiptImage = (id: string, dataUrl: string) => run('readwrite', (s) => s.put(dataUrl, id)).then(() => undefined)

export const getReceiptImage = (id: string) => run<string | undefined>('readonly', (s) => s.get(id) as IDBRequest<string | undefined>)

export const deleteReceiptImage = (id: string) => run('readwrite', (s) => s.delete(id)).then(() => undefined)

/** Every saved receipt photo, keyed by receipt id, for backups. */
export async function allReceiptImages(): Promise<Record<string, string>> {
  try {
    const [keys, values] = await Promise.all([
      run('readonly', (s) => s.getAllKeys()),
      run('readonly', (s) => s.getAll() as IDBRequest<string[]>),
    ])
    return Object.fromEntries(keys.map((k, i) => [String(k), values[i]]))
  } catch {
    return {}
  }
}
