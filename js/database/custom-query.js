
import { MainContentDBManager } from './db-manager.js'

async function handleWithQueryParams(url) {
    
    if(!(url instanceof URL)) {
        throw new TypeError()
    }

    const query = url.searchParams
    const globalArr = []

    if(query.has('orderBy')) {

        const orderByValue = query.get('orderBy')
        const storeQueryResult = await MainContentDBManager.getByIndex('createdAt-index')

        if(orderByValue === 'newest') {
            
            const sortedByNewest = storeQueryResult.sort((a, b) => b.createdAt - a.createdAt)
            Array.prototype.push.apply(globalArr, sortedByNewest)
        }
        
        if(orderByValue === 'oldest') {
            Array.prototype.push.apply(globalArr, storeQueryResult)
        }
    }

    globalArr.forEach(({ createdAt }) =>  {
        console.log(new Date(createdAt))
    })
}

window.onload = () => {

    const locationManager = new URL(window.location.href)
    // locationManager.pathname = 'query'

    const query = locationManager.searchParams
    // query.set('orderBy', 'newest')
    query.set('isFavorite', 'false')

    window.history.replaceState(null, '', locationManager)

    handleWithQueryParams(locationManager)

}