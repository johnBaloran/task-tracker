import { Task } from "../types/task";

/**
 * DATABASE UTILITY
 *
 * Encapsulates all IndexedDB operations.
 *
 * DESIGN PATTERN: Facade Pattern
 * - Hides complex IndexedDB API behind simple methods
 * - Components don't need to know about IndexedDB details
 *
 * PRINCIPLES:
 * - Single Responsibility: Only handles database operations
 * - Error Handling: All methods handle failures gracefully
 * - Type Safety: Strong TypeScript types throughout
 */

const DB_NAME = "TaskTrackerDB";
const DB_VERSION = 1;
const STORE_NAME = "tasks";

/**
 * Initialize the database
 *
 * IndexedDB uses an upgrade pattern:
 * - onupgradeneeded fires when DB version changes
 * - Create object stores (tables) here
 * - Define indexes for querying
 *
 * Object Store = Table in SQL terms
 * Index = Way to query data efficiently
 */
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    /**
     * ERROR HANDLER
     * Fires if database fails to open
     */
    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };

    /**
     * SUCCESS HANDLER
     * Fires when database opens successfully
     */
    request.onsuccess = () => {
      resolve(request.result);
    };

    /**
     * UPGRADE HANDLER
     *
     * Fires when:
     * 1. Database doesn't exist (first time)
     * 2. DB_VERSION is higher than existing version
     *
     * This is where you define the schema
     */
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      /**
       * Create object store if it doesn't exist
       *
       * keyPath: 'id' means each task's 'id' field is the primary key
       * Like: CREATE TABLE tasks (id PRIMARY KEY, ...)
       */
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });

        /**
         * Create indexes for efficient querying
         *
         * index(name, keyPath, options)
         * - name: Index name for querying
         * - keyPath: Field to index on
         * - unique: Whether values must be unique
         *
         * Like: CREATE INDEX idx_status ON tasks(status)
         */
        objectStore.createIndex("status", "status", { unique: false });
        objectStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

/**
 * SAVE ALL TASKS
 *
 * TRANSACTION PATTERN:
 * 1. Open transaction (read/write)
 * 2. Get object store
 * 3. Perform operations
 * 4. Wait for completion
 *
 * Why clear then add?
 * - Simple sync strategy
 * - Avoids orphaned records
 * - Ensures DB matches state exactly
 *
 * Production consideration:
 * For large datasets, use selective updates instead
 */
export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      /**
       * Create transaction
       *
       * Parameters:
       * 1. Store names (can be multiple)
       * 2. Mode: 'readonly' or 'readwrite'
       */
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      /**
       * CLEAR + ADD PATTERN
       *
       * Alternative approaches:
       * 1. Update only changed tasks (more complex)
       * 2. Delete removed tasks individually
       * 3. Use versioning/timestamps
       *
       * We use clear+add for simplicity
       */
      store.clear(); // Delete all existing tasks

      // Add each task
      tasks.forEach((task) => {
        store.add(task);
      });

      /**
       * Transaction lifecycle events
       *
       * oncomplete: All operations succeeded
       * onerror: Any operation failed (auto-rollback)
       * onabort: Transaction was cancelled
       */
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        db.close();
        reject(new Error("Failed to save tasks"));
      };
    });
  } catch (error) {
    console.error("Error saving tasks:", error);
    throw error;
  }
}

/**
 * LOAD ALL TASKS
 *
 * QUERY PATTERN:
 * - getAll() retrieves all records
 * - Alternative: use cursor for large datasets
 * - Alternative: use index.getAll(query) for filtered results
 */
export async function loadTasks(): Promise<Task[]> {
  try {
    const db = await initDB(); // JavaScript (await) + our function

    return new Promise((resolve, reject) => {
      //     ^^^^^^^^^^^ ^^^^^^^^  ^^^^^^
      //     JavaScript Promise constructor

      const transaction = db.transaction([STORE_NAME], "readonly");
      //                     ^^^^^^^^^^^
      //                     IndexedDB method

      const store = transaction.objectStore(STORE_NAME);
      //            ^^^^^^^^^^^^^^^^^^^
      //            IndexedDB method

      /**
       * getAll() request
       *
       * Returns all records as an array
       * For millions of records, use cursor instead:
       *
       * const cursor = store.openCursor();
       * cursor.onsuccess = (e) => {
       *   const cursor = e.target.result;
       *   if (cursor) {
       *     // Process cursor.value
       *     cursor.continue();
       *   }
       * };
       */
      const request = store.getAll();
      //              ^^^^^^^^^^^^^^
      //              IndexedDB method
      request.onsuccess = () => {
        //      ^^^^^^^^^
        //      IndexedDB callback

        db.close(); // IndexedDB method
        resolve(request.result as Task[]);
        //^^^^^ ^^^^^^^^^^^^^^
        //JS     IndexedDB property
      };

      request.onerror = () => {
        //      ^^^^^^^
        //      IndexedDB callback

        db.close(); // IndexedDB
        reject(new Error("Failed to load tasks"));
        //^^^^  ^^^ ^^^^^
        //JS     JS  JS
      };
    });
  } catch (error) {
    console.error("Error loading tasks:", error);
    return []; // Return empty array on error (graceful degradation)
  }
}

/**
 * DELETE ALL TASKS
 *
 * Useful for:
 * - "Clear all" functionality
 * - Reset during development
 * - Data export before clearing
 */
export async function clearTasks(): Promise<void> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.clear();

      request.onsuccess = () => {
        db.close();
        resolve();
      };

      request.onerror = () => {
        db.close();
        reject(new Error("Failed to clear tasks"));
      };
    });
  } catch (error) {
    console.error("Error clearing tasks:", error);
    throw error;
  }
}
