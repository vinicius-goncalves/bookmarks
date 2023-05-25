
import { FavoritesDBManager, MainContentDBManager } from './db-manager.js'

export { handleWithQueryParams }

const arrMethods = {
    push(arr, elements) {
        Array.prototype.push.call(arr, ...elements)
    }
}

async function handleWithQueryParams(url) {
    
    if(!(url instanceof URL)) {
        throw new TypeError(`The "url" param must be a URL instance with the URL properties.`)
    }
    
    let globalArr = []

    const query = url.searchParams
    const favoriteItems = await FavoritesDBManager.getAll()
    const allItems = await MainContentDBManager.getAll()
    // const hasSomeTimeFilter = ['orderBy'].some(timeFilter => query.has(timeFilter))

    if(query.size === 0) {
        return Object(allItems)
    }

    if(query.has('orderBy')) {

        const orderByValue = query.get('orderBy')
        const storeQueryResult = await MainContentDBManager.getByIndex('createdAt-index')

        function newestFunction() {
            const sortedByNewest = storeQueryResult.sort((a, b) => b.createdAt - a.createdAt)
            arrMethods.push(globalArr, sortedByNewest)
        }

        function oldestFunction() {
            arrMethods.push(globalArr, storeQueryResult)
        }

        switch(orderByValue) {
            case 'newest':
                newestFunction()
                break
            case 'oldest':
                oldestFunction()
                break
        }
    }

    if(query.has('maxTime')) {

        if(!query.has('orderBy')) {
            globalArr = Object(allItems)
        }

        globalArr = globalArr.filter(({ createdAt }) => createdAt <= +query.get('maxTime'))

    }

    if(query.has('isFavorite')) {

        const isFavoriteValue = Boolean(query.get('isFavorite') === 'false' ? 0 : 1)

        function getFavoritesThroughBoolean(shouldBeTrue = true) {

            const { res } = favoriteItems

            globalArr = globalArr.filter(({ ['id']: storedItemId }) => {
                const indexFound = res.findIndex(({ ['id']: storedFavId }) => storedFavId == storedItemId)
                if(shouldBeTrue) {
                    return indexFound > -1 ? true : false
                } else {
                    return indexFound < 0 ? true : false
                }
            })
        }
        
        switch(isFavoriteValue) {
            case true:
                getFavoritesThroughBoolean(1)
                break
            case false:
                getFavoritesThroughBoolean(0)
                break
        }
    }

    if(query.has('shouldContain')) {
        const shouldContainValue = query.get('shouldContain')
        globalArr = globalArr.filter(({ content }) => content
            .toLowerCase().includes(shouldContainValue.toLowerCase()))
    }
    
    return globalArr
}

window.onload = () => {

    const locationManager = new URL(window.location.href)
    // locationManager.pathname = 'query'

    const query = locationManager.searchParams
    // query.set('fromTime', '1683832790601')
    // query.set('isFavorite', 'true')

    // window.history.replaceState(null, '', locationManager)

    // handleWithQueryParams(locationManager)
}