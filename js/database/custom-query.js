
import { getDashboardElements } from '../dashboard/main.js'
import { FavoritesDBManager, MainContentDBManager } from './db-manager.js'

export { startQuery, createURLFilter, updateCurrentActiveFiltersLength }


const arrMethods = {
    push(arr, elements) {
        Array.prototype.push.call(arr, ...elements)
    }
}

async function updateCurrentActiveFiltersLength(currentLength = 0) {
    const { ['advancedSearch']: advancedSearchSectionOption } = (await getDashboardElements()).sectionOption
    advancedSearchSectionOption.setAttribute('data-filters-active-length', currentLength)
}

function clearQueryParams() {

    const currURL = new URL(window.location.href)

    const keysToClear = ['pathname', 'search']
    keysToClear.forEach(key => (currURL[key] = ''))

    return currURL
}

function createURLFilter(filtersObj) {
    
    const emptyURL = clearQueryParams()
    const searchParams = emptyURL.searchParams

    Object.entries(filtersObj).forEach(([ filterName, filterValue ]) => {
        searchParams.set(filterName, filterValue)
    })

    window.history.replaceState(null, '', emptyURL)
    updateCurrentActiveFiltersLength(searchParams.size)

    return emptyURL
}

async function startQuery(url) {
    
    if(!(url instanceof URL)) {
        throw new TypeError(`The "url" param must be a URL instance with the URL properties.`)
    }
    
    let globalArr = []

    const query = url.searchParams
    const favoriteItems = await FavoritesDBManager.getAll()
    const allItems = await MainContentDBManager.getAll()

    if(query.size === 0) {
        return Object(allItems)
    }

    if(query.has('id')) {
        const idValue = query.get('id')
        const itemFound = await MainContentDBManager.get(idValue)
        return [ itemFound ]
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

        globalArr = query.has('orderBy') || query.has('maxTime') ? globalArr : allItems

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