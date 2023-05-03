export { 
    makeDBMainContentTransaction, 
    makeDBFavoritesTransaction 
}

const DB_NAME = 'bookmarks'

function openDBStore(storeName) {

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

            const storeSettings = new Map([
                ['main-content', mainContentIndexSettings],
                ['favorites', favoritesIndexSettings]
            ])

            const storeSettingsGenericArr = [...storeSettings.values()]
            const storeFound = storeSettingsGenericArr.find(([ store ]) => store == storeName)
            
            if(!storeFound) {
                return
            }

            const [ store, indexSettings ] = storeFound
    
            if(!dbResult.objectStoreNames.contains(store)) {
                const store = dbResult.createObjectStore(store, { keyPath: 'id' })
                
                const indexesSettingsValues = Object.values(indexSettings)
                indexesSettingsValues.forEach(settings => store.createIndex(...settings))
            }
        })
    })

    return dbPromise
}

const startDBTransaction = (storeName) => async (mode = 'readonly') => {
    const db = await openDBStore(storeName)
    const transaction = db.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    return store
}

const makeDBMainContentTransaction = startDBTransaction('main-content')
const makeDBFavoritesTransaction = startDBTransaction('favorites')