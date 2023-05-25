import { createPromise } from '../utils/functions.js'
import { FavoriteItem, Item } from '../utils/classes.js'
import { 
    makeDBFavoritesTransaction,
    makeDBMainContentTransaction,
} from './indexedDB-utils.js'

export { MainContentDBManager, FavoritesDBManager, insertNewItem, getItemById, getAll }

const GenericDBManager = {
    getStoreLength: function(requestResult) {

        return createPromise(async (resolve) => {
            const res = requestResult.isLengthZero ? 0 : requestResult.res.length 
            resolve(res)
        })
    }
}

const MainContentDBManager = {

    put(object) {

        return createPromise(async (resolve) => {
            
            const store = await makeDBMainContentTransaction('readwrite')
            const request = store.put(object)

            request.onsuccess = () => resolve({ added: true, res: object })
            request.onerror = () => resolve({ added: false })
        })
    },

    get(id) {

        return createPromise(async (resolve) => {
                const store = await makeDBMainContentTransaction()
                const key = IDBKeyRange.only(id)
                const request = store.get(key)

                request.onsuccess = (event) => resolve(event.target.result)                   
        })
    },

    getByIndex(indexName) {
        return createPromise(async (resolve) => {
            
            const store = await makeDBMainContentTransaction()
            const query = store.index(indexName).getAll()
            query.onsuccess = (event) => resolve(event.target.result)

        })
    },

    getAll() {

        const promise = new Promise(async (resolve) => {
            const store = await makeDBMainContentTransaction()
            const request = store.getAll()
            request.onsuccess = (event) => resolve(event.target.result)
        })
        return promise
    },

    get length() {
        return (async () => {
            const requestResult = await this.getAll()
            return GenericDBManager.getStoreLength(requestResult)
        })()
    },

    bulkSearch(...ids) {
        return Promise.all(ids.map(async (id) => this.get(id)))
    }
}

function insertNewItem(value) {
    return MainContentDBManager.put(new Item(value))
}

function getItemById(id) {
    return MainContentDBManager.get(id)
}

function getAll() {
    return MainContentDBManager.getAll()
}

const FavoritesDBManager = {

    get(id) {

        return createPromise(async (resolve, reject) => {

            const store = await makeDBFavoritesTransaction()
            const keyRange = IDBKeyRange.only(id)

            const request = store.get(keyRange)
    
            const res = (result) => result 
                ? { isFavorite: true } 
                : { isFavorite : false }
    
            request.onsuccess = ({ target }) => resolve(res(target.result))
            request.onerror = () => reject(`An error has occurred when tried to get -> "${id}"`)
        })
    },

    getAll() {

        return createPromise(async (resolve, reject) => {
    
            const store = await makeDBFavoritesTransaction()
            const request = store.getAll()
            
            const handleWithRequestResult = (result) => result.length === 0 
                ? { isLengthZero: true, res: [] } 
                : { isLengthZero: false, res: result }

            request.onsuccess = ({ target }) => resolve(handleWithRequestResult(target.result))
            request.onerror = () => reject(`An error has occurred when tried to get all items`)
        })
    },

    get length() {
        return (async () => {
            const requestResult = await this.getAll()
            return GenericDBManager.getStoreLength(requestResult)
        })()
    },

    put(id) {

        return createPromise(async (resolve, reject) => {

            const itemFound = MainContentDBManager.get(id)
            
            if(!itemFound) {
                const o = { exists: false, message: `Item with id "${id}" does not exists on MAIN store.` }
                return o
            }

            const store = await makeDBFavoritesTransaction('readwrite')
            const request = store.put(new FavoriteItem(id, Date.now()))

            request.onsuccess = () => resolve({ added: true, id })
            request.onerror = () => reject(`An error has occurred when tried to put item "${id}".`)
        })
    },

    remove(id) {

        return createPromise(async (resolve, reject) => {

            const store = await makeDBFavoritesTransaction('readwrite')
            const keyRange = IDBKeyRange.only(id)
            const request = store.delete(keyRange)
            
            request.onsuccess = () => resolve({ deleted: true })
            request.onerror = () => reject(`An error has occurred when tried to remove item "${id}".`)
        })
    }
}