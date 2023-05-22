// import { hasElementRendered } from '../../utils/functions.js'
import { handleWithQueryParams } from '../../database/custom-query.js'
import { renderStoredElement } from '../../database/dom-manipulation.js'
import { createLoader } from '../../utils/functions.js'

export { loadAdvancedFilterFunctions }

const mainContent = document.querySelector('main.content')
const childrenFromMainContent = mainContent.children
const advancedSearchSection = document.querySelector('section[data-section="advanced_search"]')

const filters = document.querySelector('.filters')

const addNewFilterBtn = document.querySelector('button[data-button="add-new-filter"]')
const openFilterContentWrapper = document.querySelector('.filter-content-icon')

const filtersMap = new Map([
    ['orderBy', [
        'newest',
        'oldest'
    ]],
    ['isFavorite', [
        'true',
        'false'
    ]]
])

const literalFilterWords = (filterName) => ({
    'orderBy': 'Order by',
    'isFavorite': 'Favorite',
    'newest': 'Newest',
    'oldest': 'Oldest',
    'true': 'True',
    'false': 'False'
})[filterName]

const activeFilters = Object.create(Object.create(null), {})

let isFirstTime = true

async function handleWithElementRendering(storedItem) {
    const element = await renderStoredElement(storedItem)
    advancedSearchSection.appendChild(element)
}

async function loadItemsFromMainContent(url) {

    const loader = createLoader()
    const queryResult = await handleWithQueryParams(url)
    const some = (arr, callback) => Array.prototype.some.call(arr, callback)

    if(!isFirstTime) {

        queryResult.forEach(async (queryRes) => {

            const res = some(advancedSearchSection.children, (item) => {
                if(item.classList.contains('filter-wrapper')) {
                    return
                }

                if(item.getAttribute('data-id') == queryRes.id) {
                    return true
                }
                return false
            })

            if(!res) {
                await handleWithElementRendering(queryRes)
            }
        })
        
        loader.remove()
        return
    }
    
    queryResult.forEach(async (queryRes) => await handleWithElementRendering(queryRes))
    isFirstTime = false
    loader.remove()
}

function updateFilterParamsFromObject(activeFiltersObj) {
    
    const currURL = new URL(window.location.href)

    const keysToClear = ['pathname', 'search']
    keysToClear.forEach(key => (currURL[key] = ''))

    const searchParams = currURL.searchParams

    Object.entries(activeFiltersObj).forEach(([ filterName, filterValue ]) => {
        searchParams.set(filterName, filterValue)
    })

    window.history.replaceState(null, '', currURL)

    return currURL
}

const proxyActiveFilters = new Proxy(activeFilters, {

    set(target, prop, newValue) {
        
        target[prop] = newValue

        if(!Object.hasOwn(target, prop)) {
            return false
        }

        updateFilterParamsFromObject(target)
        return true
    },
    
    deleteProperty(target, prop) {

        if(!(prop in target)) {
            return false
        }
        
        delete target[prop]

        if(!(prop in target)) {
            updateFilterParamsFromObject(target)
            return true
        }
    },
})

const filterTools = {

    removeAllActiveOptions() {
        const allTempFilterOptionsWrapper = document.querySelectorAll('.temp-filter-options-wrapper')
        allTempFilterOptionsWrapper.forEach(tempFilterWrapper => tempFilterWrapper?.remove())
    },

    createMiddleText() {

        const middleText_div = document.createElement('div')
        middleText_div.classList.add('middle-text')
        
        const span = document.createElement('span')
        span.textContent = 'IS'
        
        middleText_div.appendChild(span)

        return middleText_div
    },

    createTempFilterOptionsWrapper(event) {

        const tempFilterOptionsWrapper_div = document.createElement('div')

        tempFilterOptionsWrapper_div.classList.add('temp-filter-options-wrapper')
        tempFilterOptionsWrapper_div.style.left = `${event.pageX}px`
        tempFilterOptionsWrapper_div.style.top = `${event.pageY}px`

        return tempFilterOptionsWrapper_div
    },

    handleSecondFilterSelection(optionName, individualFilter) {
        
        const optionsToLoad = filtersMap.get(optionName)

        const secondSelection_div = document.createElement('div')
        secondSelection_div.dataset.filter = 'second-selection'

        const selectAOption = document.createElement('span')
        selectAOption.textContent = 'Select a option'

        const icon = document.createElement('span')
        icon.classList.add('material-icons-outlined')
        icon.textContent = 'chevron_right'

        secondSelection_div.append(selectAOption, icon)

        secondSelection_div.addEventListener('click', (event) => {
           
            event.stopPropagation()

            this.removeAllActiveOptions()

            const tempFilterOptionsWrapper_div = this.createTempFilterOptionsWrapper(event)
            
            const filterOptions_ul = document.createElement('ul')
            filterOptions_ul.classList.add('filter-options')

            optionsToLoad.forEach(option => {

                const filterOption_li = document.createElement('li')
                filterOption_li.textContent = literalFilterWords(option)
                filterOptions_ul.appendChild(filterOption_li)
                
                filterOption_li.addEventListener('click', () => {
                    
                    secondSelection_div.textContent = literalFilterWords(option)
                    individualFilter.setAttribute('data-filter-value', option)
                    individualFilter.setAttribute('data-filter-status', 'filled')

                    const filterName = individualFilter.getAttribute('data-filter-name')
                    const filterValue = individualFilter.getAttribute('data-filter-value')

                    proxyActiveFilters[filterName] = filterValue

                })
            })

            tempFilterOptionsWrapper_div.appendChild(filterOptions_ul)
            document.body.prepend(tempFilterOptionsWrapper_div)
        })

        const deleteFilter_button = document.createElement('button')
        deleteFilter_button.classList.add('delete-filter-button')

        const delete_icon = document.createElement('span')
        delete_icon.classList.add('material-icons-outlined')
        delete_icon.textContent = 'delete'

        deleteFilter_button.appendChild(delete_icon)

        deleteFilter_button.addEventListener('click', () => {
            individualFilter.remove()
            updateFilterLengthInformation()

            const filterName = individualFilter.getAttribute('data-filter-name')
            delete proxyActiveFilters[filterName]
        })

        individualFilter.appendChild(secondSelection_div)
        individualFilter.insertAdjacentElement('beforeend', deleteFilter_button)
    },

    handleFirstFilterSelection(eventTarget, tempFilterID) {
        
        this.removeAllActiveOptions()
        const filterOptions = [...filtersMap.keys()]

        const tempFilterOptionsWrapper_div = this.createTempFilterOptionsWrapper(eventTarget)

        const filterOptions_ul = document.createElement('ul')
        filterOptions_ul.classList.add('filter-options')

        filterOptions.forEach(option => {

            if(activeFilters[option]) {
                return 
            }

            const optionForFilter_li = document.createElement('li')
            
            optionForFilter_li.textContent = literalFilterWords(option)
            optionForFilter_li.addEventListener('click', () => {

                const individualFilter = document.querySelector(`[data-filter-id="${tempFilterID}"]`)

                const lastItemsFromFirstIndex = [...individualFilter.children]
                    .filter((_, index) => index > 0)
                lastItemsFromFirstIndex.forEach(child => child.remove())

                individualFilter.appendChild(this.createMiddleText())
                individualFilter.querySelector(`[data-filter="first-selection"]`)
                    .textContent = literalFilterWords(option)
                individualFilter.setAttribute('data-filter-name', option)

                const filterName = individualFilter.getAttribute('data-filter-name')
                proxyActiveFilters[filterName]

                this.handleSecondFilterSelection(option, individualFilter)
                
            })
            
            filterOptions_ul.appendChild(optionForFilter_li)
        })

        tempFilterOptionsWrapper_div.appendChild(filterOptions_ul)
        document.body.prepend(tempFilterOptionsWrapper_div)
    }
}

async function createIndividualFilter() {

    const tempFilterID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)

    const individualFilter_div = document.createElement('div')
    individualFilter_div.classList.add('individual-filter')
    individualFilter_div.dataset.filterStatus = 'empty'
    individualFilter_div.dataset.filterId = tempFilterID

    const firstSelection_div = document.createElement('div')
    firstSelection_div.dataset.filter = 'first-selection'
    
    const selectFilterText_span = document.createElement('span')
    selectFilterText_span.classList.add('first-selection-span')
    selectFilterText_span.textContent = 'Select a filter'

    const icon = document.createElement('span')
    icon.classList.add('material-icons-outlined')
    icon.textContent = 'chevron_right'
    
    firstSelection_div.addEventListener('click', (event) => {

        const filterStatus = individualFilter_div.getAttribute('data-filter-status')

        if(filterStatus === 'filled') {
            return
        }

        event.stopPropagation()
        filterTools.handleFirstFilterSelection(event, tempFilterID)
    })

    firstSelection_div.append(selectFilterText_span, icon)
    individualFilter_div.appendChild(firstSelection_div)

    return individualFilter_div
}

function updateFilterLengthInformation() {

    const filtersChildren = filters.children

    if(filtersChildren.length === 0) {

        const spanMessage = document.createElement('span')
        spanMessage.textContent = 'There are no applied filters - try an one!'
        spanMessage.classList.add('no-filter-applied-message')
        
        filters.appendChild(spanMessage)

        return
    }

    if(filtersChildren.length === 1 && filtersChildren[0].classList.contains('no-filter-applied-message')) {
        return
    }

    const noFilterAppliedMessageElement = document.querySelector('span.no-filter-applied-message')

    if(!noFilterAppliedMessageElement) {
        return
    }

    noFilterAppliedMessageElement.remove()
}

addNewFilterBtn.addEventListener('click', async () => {
    
    const allFilters = document.querySelectorAll('[data-filter-status]')
    const isSomeEmpty = [...allFilters].some(filter => filter.getAttribute('data-filter-status') === 'empty')
    
    if(isSomeEmpty) {
        return
    }

    const individualFilterElement = await createIndividualFilter()
    filters.appendChild(individualFilterElement)

    updateFilterLengthInformation()
})

window.addEventListener('click', () => {
    filterTools.removeAllActiveOptions()
})

openFilterContentWrapper.addEventListener('click', () => {
    document.querySelector('.filter-options-wrapper').removeAttribute('style')
})

function loadAdvancedFilterFunctions() {
    loadItemsFromMainContent(new URL(window.location.href))
    updateFilterLengthInformation()

    updateFilterParamsFromObject(activeFilters)
}
