import { makeDBMainContentTransaction } from './indexedDB-utils.js'

export { MainContentDBManager }

const utils = {
    regexValidator: new RegExp(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/, 'gi')
}

const MainContentDBManager = {
    put: function put(object) {
        const putPromise = new Promise(async (resolve) => {
            const store = await makeDBMainContentTransaction('readwrite')
            const request = store.put(object)
            request.onsuccess = () => resolve({ added: true, res: object })
            request.onerror = () => resolve({ added: false })
        })
        return putPromise
    },
    get: function(id) {

        if(utils.regexValidator.test(id)) {
            const getPromise = new Promise(async (resolve) => {
                
                const store = await makeDBMainContentTransaction()
                const key = IDBKeyRange.only(id)
                const request = store.get(key)
                request.onsuccess = (event) => resolve(event.target.result)                    

            })
            return getPromise
        }

        const getPromise = new Promise(async (resolve) => {
            
            const store = await makeDBMainContentTransaction()
            const request = store.openCursor()
            request.addEventListener('success', (event) => {
                const cursor = event.target.result
                if(!cursor) {
                    return { finished: true, resultFound: 0 }
                }

                if(cursor.value.id === id) {
                    return { finished: true, resultFound: 1, result: cursor.value }
                }
                console.log('a')
                cursor.continue()
            })
        })
        return getPromise
    },
    getAll: async function getAll() {
        const promise = new Promise(async (resolve) => {
            const store = await makeDBMainContentTransaction()
            const request = store.getAll()
            request.onsuccess = (event) => resolve(event.target.result)
        })
        return promise
    }
}