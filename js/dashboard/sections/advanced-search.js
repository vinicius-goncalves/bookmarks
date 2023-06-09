import { createDOMElement, hasElementRendered } from '../../utils/functions.js'
import { getDashboardElements, handleWithDashboardStoredObjectsRendering, showElementsMatchedOnQuery } from '../main.js'
import { createURLFilter, updateCurrentActiveFiltersLength } from '../../database/custom-query.js'
import { MainContentDBManager } from '../../database/db-manager.js'

export { loadAdvancedFilterFunctions, loadAllStoredObjects }

const addNewFilterBtn = document.querySelector('button[data-button="add-new-filter"]')
const searchFromFilters = document.querySelector('button[data-button="search-from-filters"]')

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
    'false': 'False',
    'true': 'True'
})[filterName]

const proxyFiltersObj = new Proxy(Object.create(Object.create(null), {}), {

    set(target, prop, newValue) {

        const propDefined = Reflect.set(target, prop, newValue)

        if(!propDefined) {
            return false
        }

        createURLFilter(target)
        return true
    },
    
    deleteProperty(target, prop) {

        if(!(prop in target)) {
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

                    proxyFiltersObj[filterName] = filterValue

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
            updateFilterInformation()

            const filterName = individualFilter.getAttribute('data-filter-name')
            delete proxyFiltersObj[filterName]
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

            if(proxyFiltersObj[option]) {
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
                proxyFiltersObj[filterName]

                this.handleSecondFilterSelection(option, individualFilter)
                
            })
            
            filterOptions_ul.appendChild(optionForFilter_li)
        })

        tempFilterOptionsWrapper_div.appendChild(filterOptions_ul)
        document.body.prepend(tempFilterOptionsWrapper_div)
    }
}

const randomIdentifier = (length = Number.MAX_SAFE_INTEGER) => Math.floor(Math.random() * length).toString(16)

async function createIndividualFilter() {

    const individualFilterTemplate = {
        wrapper: {
            div: {
                classes: { active: true, classesList: ['individual-filter'] },
                attributes: { active: true, attributesList: [ 
                        ['data-filter-status', 'empty'], 
                        [ 'data-filter-id', randomIdentifier() ]] 
                }
            }
        }
    }

    const individualFilterWrapper = await createDOMElement(individualFilterTemplate.wrapper)
    const individualFilter_div = document.createElement('div')
    individualFilter_div.classList.add('individual-filter')
    individualFilter_div.dataset.filterStatus = 'empty'
    individualFilter_div.dataset.filterId = randomIdentifier()

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

const filters = document.querySelector('.filters')

async function updateFilterInformation() {

    const filtersChildren = filters.children

    if(filtersChildren.length === 0) {

        const templateSpanMessage = {
            span: {
                classes: { active: true, classesList: [ 'no-filter-applied-message' ] },
                textContent: { active: true, text: 'There are no applied filters - try one!' }
            }
        }

        const spanMessage = await createDOMElement(templateSpanMessage)
        filters.appendChild(spanMessage)
        return
    }

    if(filtersChildren[0].classList.contains('no-filter-applied-message')) {
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

    updateFilterInformation()
})

searchFromFilters.addEventListener('click', async () => 
    showElementsMatchedOnQuery(proxyFiltersObj))

window.addEventListener('click', () => filterTools.removeAllActiveOptions())

openFilterContentWrapper.addEventListener('click', () => {
    document.querySelector('.filter-options-wrapper').removeAttribute('style')
})


async function loadAllStoredObjects() {
    
    const storedObjectsRendered = await MainContentDBManager.getAll()
    
    if(!storedObjectsRendered) {
        return
    }
    
    const { ['advancedSearch']: advancedSearchSection } = (await getDashboardElements()).sections
    const dashboardElements = await handleWithDashboardStoredObjectsRendering(storedObjectsRendered)
    
    const callback = element => !hasElementRendered(advancedSearchSection, element)
    const elementsNotAppended = dashboardElements.filter(callback)
    
    const fragment = document.createDocumentFragment()
    elementsNotAppended.forEach(element => fragment.appendChild(element))
    advancedSearchSection.appendChild(fragment)
}

async function loadAdvancedFilterFunctions() {
    updateFilterInformation()
    updateCurrentActiveFiltersLength(0)
}
