export { makeDBMainContentTransaction }

const DB_NAME = 'bookmarks'

const db = indexedDB.open(DB_NAME, 1)
    
const dbPromise = new Promise(resolve => {

    db.addEventListener('success', (event) => {
        const dbResult = event.target.result
        resolve(dbResult)
    })
    
    db.addEventListener('upgradeneeded', (event) => {
        
        const dbResult = event.target.result

        const indexSettings = {
            0: ['createAt-index', 'createAt', { unique: false }],
            1: ['content-index', 'content', { unique: false }],
            2: ['id-index', 'id', { unique: true }]
        }

        if(!dbResult.objectStoreNames.contains(storeName)) {
            const store = dbResult.createObjectStore(storeName, { keyPath: 'id' })
            
            const indexesSettingsValues = Object.values(indexSettings)
            indexesSettingsValues.forEach(settings => store.createIndex(...settings))
        }
    })
})


async function startDBTransaction(storeName, mode) {
    const db = await dbPromise
    const transaction = db.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    return store
}

const DEFAULT_MODE = 'readonly'
const makeDBMainContentTransaction = (mode = DEFAULT_MODE) => startDBTransaction('main-content', mode)
const makeDBFavoritesTransaction = (mode = DEFAULT_MODE) => startDBTransaction('favorites', mode)