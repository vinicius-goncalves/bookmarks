import { hasElementRendered } from '../../utils/functions.js'
import { handleWithDashboardStoredObjectsRendering, showElementsMatchedOnQuery } from '../main.js'
import { createURLFilter, updateCurrentActiveFiltersLength } from '../../database/custom-query.js'
import { MainContentDBManager } from '../../database/db-manager.js'

export { loadAdvancedFilterFunctions, loadAllStoredObjects }

;(async () => {

    const filterOptionsWrapper = document.querySelector('.filter-options-wrapper')
    const searchFromFilters = document.querySelector('button[data-button="search-from-filters"]')
    const openFilterContentWrapper = document.querySelector('.filter-content-icon')

    const listenersToLoad = {
        clearActiveOptions: () => filterTools.clearActiveOptionsWrapper(),
        elsMatchedOnQuery: () => void showElementsMatchedOnQuery(proxyFilters),
        showFilterOptionsWrapper: () => filterOptionsWrapper.removeAttribute('style')
    }

    const { 
        clearActiveOptions,
        elsMatchedOnQuery,
        showFilterOptionsWrapper
    } = listenersToLoad

    window.addEventListener('click', clearActiveOptions)
    searchFromFilters.addEventListener('click', elsMatchedOnQuery)
    openFilterContentWrapper.addEventListener('click', showFilterOptionsWrapper)

})()

const filters = document.querySelector('.filters')

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
    'false': 'False',
    'true': 'True'
})[filterName]

const proxyFilters = new Proxy({}, {
    set(target, prop, newValue) {
        const propDefined = Reflect.set(target, prop, newValue)

        if(!propDefined) {
            return false
        }

        createURLFilter(target)
        return true
    },
    deleteProperty(target, prop) {
        if(!Reflect.has(target, prop)) {
            return false
        }
        
        try {
            const targetDeleted = Reflect.deleteProperty(target, prop)

            if(targetDeleted) {
                createURLFilter(target)
                return true
            }
        } catch (err) {
            console.log(err)
        }
    },
})

const filterTools = {

    clearActiveOptionsWrapper() {
        const allTempFilterOptionsWrapper = document.querySelectorAll('.temp-filter-options-wrapper')
        allTempFilterOptionsWrapper.forEach(tempFilterWrapper => tempFilterWrapper?.remove())
    },

    createMiddleText() {

        const middleText_div = createElement('div').setClass('middle-text')
        const span = createElement('span').setText('IS')
        middleText_div.appendChild(span)

        return middleText_div
    },

    createTempFilterOptionsWrapper(event) {

        const filterOptionsWrapperCSSStyle = [ 
            ['left', `${event.pageX}x`],
            ['top', `${event.pageY}px`] 
        ]

        const tempFilterOptionsWrapper = createElement('div')
            .setClass('temp-filter-options-wrapper')
            .setCSSStyle(filterOptionsWrapperCSSStyle)

        return tempFilterOptionsWrapper
    },

    handleSecondFilterSelection(optionName, individualFilter) {
        
        const optionsToLoad = filtersMap.get(optionName)

        const secondSelectionWrapper = createElement('div').setAttr('data-filter', 'second-selection')
        const selectAOption = createElement('span').setText('Select an option')
        const expandMoreIcon = createIconElement().getIcon('chevron_right')
        secondSelectionWrapper.append(selectAOption, expandMoreIcon)

        secondSelectionWrapper.addEventListener('click', (event) => {
           
            event.stopPropagation()
            this.clearActiveOptionsWrapper()

            const tempFilterOptionsWrapper_div = this.createTempFilterOptionsWrapper(event)
            
            const filterQueryUL = createElement('ul').setClass('filter-options')

            optionsToLoad.forEach(option => {

                const filterOptionLI = createElement('li').setText(literalFilterWords(option))
                filterQueryUL.appendChild(filterOptionLI)

                filterOptionLI.addEventListener('click', () => {

                    // const individualFilterHTMLTag = individualFilter.getTagName()
                    
                    individualFilter.setAttribute('data-filter-value', option)
                    individualFilter.setAttribute('data-filter-status', 'filled')

                    const filterName = individualFilter.getAttribute('data-filter-key')
                    const filterValue = individualFilter.getAttribute('data-filter-value')

                    proxyFilters[filterName] = filterValue

                })
            })

            tempFilterOptionsWrapper_div.appendChild(filterQueryUL)
            document.body.prepend(tempFilterOptionsWrapper_div)
        })

        const deleteFilterBUTTON = createElement('button')
            .setClass('delete-filter-button')

        const deleteICON = createElement('span')
        deleteICON.setClass('material-icons-outlined')
            .setText('delete')
            .appendOn(deleteFilterBUTTON)

        deleteFilterBUTTON.addEventListener('click', () => {
            individualFilter.remove()
            updateFilterInformation()

            const filterName = individualFilter.getAttribute('data-filter-key')
            Reflect.deleteProperty(proxyFilters, filterName)
        })

        individualFilter.appendChild(secondSelectionWrapper)
        individualFilter.insertAdjacentElement('beforeend', deleteFilterBUTTON)
    },

    handleFirstFilterSelection(eventTarget, tempFilterID) {
        
        this.clearActiveOptionsWrapper()
        const filterOptions = [...filtersMap.keys()].filter(key => !Reflect.has(proxyFilters, key))
        const tempFilterOptionsWrapper_div = this.createTempFilterOptionsWrapper(eventTarget)
        
        const createLis = option => {

            const optionLIClickEvt = () => {

                const individualFilter = document.querySelector(`[data-filter-id="${tempFilterID.getAttribute('data-filter-id')}"]`)
    
                const lastItemsFromFirstIndex = [...individualFilter.children].filter((_, index) => index > 0)
                lastItemsFromFirstIndex.forEach(child => child.remove())
    
                individualFilter.appendChild(this.createMiddleText())
                individualFilter.querySelector(`[data-filter="first-selection"]`)
                    .textContent = literalFilterWords(option)
                individualFilter.setAttribute('data-filter-key', option)
    
                const filterName = individualFilter.getAttribute('data-filter-key')
                
                this.handleSecondFilterSelection(option, individualFilter)
            }

            const optionFilterLI = createElement('li')
                .setText(literalFilterWords(option))
                .addEvtListener('click', optionLIClickEvt)
            
            return optionFilterLI
        }

        const lisCreated = filterOptions.map(createLis)

        const filterQueryUL = createElement('ul')
        filterQueryUL.setClass('filter-options')
            .appendElements(...lisCreated)
            .appendOn(tempFilterOptionsWrapper_div)

        document.body.prepend(tempFilterOptionsWrapper_div)
    }
}


function updateFilterInformation() {
    
    const filtersChildren = filters.children
    const lengthFiltersChildren = filtersChildren.length

    if(lengthFiltersChildren === 0) {

        const spanMessage = createElement('span')
        spanMessage
            .setClass(['no-filter-applied-message'])
            .setText('There are no applied filters - try one!')
            .appendOn(filters)

        return
    }

    const elNoFilterAppliedMsg = document.querySelector('span.no-filter-applied-message')

    if(elNoFilterAppliedMsg !== null) {
        elNoFilterAppliedMsg.remove()
        return
    }
}

function createIndividualFilter() {

    const randomNumber = (length = Number.MAX_SAFE_INTEGER) => Math.floor(Math.random() * length)

    const individualFilterWrapper = createElement('div')
        .setAttrs([ 
            ['data-filter-status', 'empty'],
            ['data-filter-id', randomNumber().toString(16)]
        ])
        .setClass('individual-filter')

    const firstSelectionWrapper = createElement('div')
        .setAttr('data-filter', 'first-selection')

    const selectFilterText = createElement('span')
        .setClass('first-selection-span')
        .setText('Select a filter')

    const moreContentIcon = createIconElement()
        .getIcon('chevron_right')

    const createDropdownFilterKey = (event) => {

        const filterStatus = individualFilterWrapper.getAttribute('data-filter-status')

        if(filterStatus !== 'empty') {
            return
        }

        event.stopPropagation()
        const currTarget = event.currentTarget
        const filterID = currTarget.closest('[data-filter-id]')

        filterTools.handleFirstFilterSelection(event, filterID)
    }

    const elementFunctionsContent = {
        addEventListener: ['click', createDropdownFilterKey],
        append: [selectFilterText, moreContentIcon]
    }

    Object.entries(elementFunctionsContent).forEach(([ funcName, args ]) => {
        firstSelectionWrapper[funcName](...args)
    })

    individualFilterWrapper.appendChild(firstSelectionWrapper)
    return individualFilterWrapper
}

const addNewFilterBtn = document.querySelector('button[data-button="add-new-filter"]')

addNewFilterBtn.addEventListener('click', async () => {
    
    const allFilters = document.querySelectorAll('[data-filter-status]')
    const isSomeEmpty = [...allFilters].some(filter => filter.getAttribute('data-filter-status') === 'empty')

    if(isSomeEmpty) {
        return
    }

    filters.appendChild(createIndividualFilter())
    updateFilterInformation()
})

async function loadAllStoredObjects() {
    
    const storedObjectsRendered = await MainContentDBManager.getAll()
    
    if(!storedObjectsRendered) {
        return
    }
    
    const advancedSearchSection = document.querySelector('[data-section="advanced_search"]')
    const dashboardElements = await handleWithDashboardStoredObjectsRendering(storedObjectsRendered)
    
    const fragment = document.createDocumentFragment()
    const elsNotRendered = dashboardElements.filter(el => !hasElementRendered(advancedSearchSection, el))
    elsNotRendered.forEach(element => fragment.appendChild(element))
    advancedSearchSection.appendChild(fragment)
}

async function loadAdvancedFilterFunctions() {
    updateFilterInformation()
    updateCurrentActiveFiltersLength()
}

