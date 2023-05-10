export { 
    makeDBMainContentTransaction, 
    makeDBFavoritesTransaction 
}

const DB_NAME = 'bookmarks'
const db = indexedDB.open(DB_NAME, 1)

const dbPromise = new Promise(resolve => {

    db.addEventListener('success', (event) => {
        const dbResult = event.target.result
        resolve(dbResult)
    })
    
    db.addEventListener('upgradeneeded', (event) => {
        
        const dbResult = event.target.result

        const mainContentIndexSettings = {
            0: ['createdAt-index', 'createdAt', { unique: false }],
            1: ['content-index', 'content', { unique: false }],
            2: ['id-index', 'id', { unique: true }]
        }
        
        const favoritesIndexSettings = {
            0: ['id-index', 'id', { unique: true }]
        }

        const storesSettings = [
            ['main-content', { keyPath: 'id' }, mainContentIndexSettings],
            ['favorites', { keyPath: 'id' }, favoritesIndexSettings]
        ]
    
        storesSettings.forEach(storeSettings => {

            const [ storeName, keyPath, indexSettings ] = storeSettings

            if(!dbResult.objectStoreNames.contains(storeName)) {

                const store = dbResult.createObjectStore(storeName, keyPath)
                const indexesSettingsValues = Object.values(indexSettings)
                indexesSettingsValues.forEach(settings => store.createIndex(...settings))
            }
        })
    })
})

const startDBTransaction = (storeName) => async (mode = 'readonly') => {
    const db = await dbPromise
    const transaction = db.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    return store
}

const makeDBMainContentTransaction = startDBTransaction('main-content')
const makeDBFavoritesTransaction = startDBTransaction('favorites')