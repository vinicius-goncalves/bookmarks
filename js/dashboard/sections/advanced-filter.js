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

const queryMap = new Map([
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

const activeFilters = {}
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

async function loadURLParams(object) {
    
    const url = new URL(window.location.href)
    url.pathname = ''

    const searchParams = url.searchParams
    
    for(const key in object) {
        searchParams.set(key, object[key])
    }
}

async function removeAllActiveQueryValues() {
    const allItems = document.querySelectorAll('.query-values')
    allItems.forEach(item => item.remove())
}

async function createFilterOptions(closestLiOption, values) {

    const rect = closestLiOption.getBoundingClientRect()
    console.log(values)

    const ul = document.createElement('ul')
    ul.classList.add('query-values')
    ul.style.left = rect.right + 10 + 'px'
    ul.style.top = rect.top + 10 + 'px'
    document.body.prepend(ul)

    values.forEach(value => {
        
        const li = document.createElement('li')
        li.textContent = literalQueryWords(value)
        ul.appendChild(li)

        li.onclick = () => {

            // const a = closestLiOption.closest('[data-query-name]').dataset.queryName
            // const b = value

            // Object.defineProperty(activeFilters, a, {
            //     value: b,
            //     enumerable: true,
            //     writable: true,
            //     configurable: true
            // })

            closestLiOption.closest('.individual-filter').replaceWith()
            removeAllActiveQueryValues()
        }
    })

    ul.onmouseleave = () => {
        ul.remove()
    }
}

{/* <div class="middle-text">
                            <span>IS</span>
                        </div>
                        <div data-filter="second-selection">
                            <span>Select a filter option</span>
                            <span class="material-icons-outlined">chevron_right</span>
                        </div> --> */}

const filterTools = {

    removeAllActiveOptions() {
        const allTempFilterOptionsWrapper = document.querySelectorAll('.temp-filter-options-wrapper')
        allTempFilterOptionsWrapper.forEach(tempFilterWrapper => tempFilterWrapper.remove())
    },

    createMiddleText() {

        const middleText_div = document.createElement('div')
        middleText_div.classList.add('middle-text')
        
        const span = document.createElement('span')
        span.textContent = 'IS'
        
        middleText_div.appendChild(span)

        return middleText_div

    },

    createTempFilterOptionsUList(event) {

        const tempFilterOptionsWrapper_div = document.createElement('div')

        tempFilterOptionsWrapper_div.classList.add('temp-filter-options-wrapper')
        tempFilterOptionsWrapper_div.style.left = `${event.pageX}px`
        tempFilterOptionsWrapper_div.style.top = `${event.pageY}px`

        return tempFilterOptionsWrapper_div

    },

    handleWithSecondSelection(optionName, individualFilter,) {
        
        const optionsToLoad = queryMap.get(optionName)

        const secondSelection_div = document.createElement('div')
        secondSelection_div.dataset.filter = 'second-selection'

        const selectAOption = document.createElement('span')
        selectAOption.textContent = 'Select a filter option'

        const icon = document.createElement('span')
        icon.classList.add('material-icons-outlined')
        icon.textContent = 'chevron_right'

        secondSelection_div.append(selectAOption, icon)

        secondSelection_div.addEventListener('click', (event) => {
           
            event.stopPropagation()

            const tempFilterOptionsWrapper_div = this.createTempFilterOptionsUList(event)
            
            const filterOptions_ul = document.createElement('ul')
            filterOptions_ul.classList.add('filter-options')

            optionsToLoad.forEach(option => {

                const filterOption_li = document.createElement('li')
                filterOption_li.textContent = literalFilterWords(option)
                filterOptions_ul.appendChild(filterOption_li)

                filterOption_li.addEventListener('click', () => {
                    individualFilter.setAttribute('data-filter-status', 'filled')
                })
            })

            tempFilterOptionsWrapper_div.appendChild(filterOptions_ul)
            document.body.prepend(tempFilterOptionsWrapper_div)
        })

        individualFilter.appendChild(secondSelection_div)
    },

    handleWithFirstSelection(filterOptions, filterId, event) {
        
        this.removeAllActiveOptions()

        if(!Array.isArray(filterOptions)) {
            return
        }

        const tempFilterOptionsWrapper_div = document.createElement('div')

        tempFilterOptionsWrapper_div.classList.add('temp-filter-options-wrapper')
        tempFilterOptionsWrapper_div.style.left = `${event.pageX}px`
        tempFilterOptionsWrapper_div.style.top = `${event.pageY}px`

        const filterOptions_ul = document.createElement('ul')
        filterOptions_ul.classList.add('filter-options')

        filterOptions.forEach(option => {

            const optionForFilter_li = document.createElement('li')
            
            optionForFilter_li.textContent = literalFilterWords(option)
            optionForFilter_li.addEventListener('click', () => {

                const individualFilterFromID = document.querySelector(`[data-filter-id="${filterId}"]`)
                
                const lastTwoChildren = [...individualFilterFromID.children].filter((_, index) => index > 0)
                lastTwoChildren.forEach(child => child.remove())

                individualFilterFromID.appendChild(this.createMiddleText())
                individualFilterFromID.querySelector(`[data-filter="first-selection"]`)
                    .textContent = literalFilterWords(option)

                this.handleWithSecondSelection(option, individualFilterFromID)
                
            })
            
            filterOptions_ul.appendChild(optionForFilter_li)
            
        })

        tempFilterOptionsWrapper_div.appendChild(filterOptions_ul)
        document.body.prepend(tempFilterOptionsWrapper_div)
    }
}

async function createIndividualFilter() {

    const filterId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)

    const individualFilter_div = document.createElement('div')
    individualFilter_div.classList.add('individual-filter')
    individualFilter_div.dataset.filterStatus = 'empty'
    individualFilter_div.dataset.filterId = filterId

    const firstSelection_div = document.createElement('div')
    firstSelection_div.dataset.filter = 'first-selection'
    
    const selectFilterText_span = document.createElement('span')
    selectFilterText_span.classList.add('first-selection-span')
    selectFilterText_span.textContent = 'Select a filter'

    const icon = document.createElement('span')
    icon.classList.add('material-icons-outlined')
    icon.textContent = 'chevron_right'
    
    firstSelection_div.append(selectFilterText_span, icon)
    individualFilter_div.appendChild(firstSelection_div)

    firstSelection_div.addEventListener('click', (event) => {
        event.stopPropagation()
        filterTools.handleWithFirstSelection([...queryMap.keys()], filterId, event)
    })

    return individualFilter_div
}

addNewFilterBtn.addEventListener('click', async () => {
    
    const allFilters = document.querySelectorAll('[data-filter-status]')
    
    if([...allFilters].some(filter => filter.getAttribute('data-filter-status') === 'empty')) {
        return
    }

    const individualFilterElement = await createIndividualFilter()
    filters.appendChild(individualFilterElement)

    verifyFilterLength()
})

window.addEventListener('click', () => {
    filterTools.removeAllActiveOptions()
})

addNewFilterBtn.click()

function verifyFilterLength() {

    const children = filters.children

    if(children.length === 1 && children[0].classList.contains('no-filter-applied-message')) {
        return
    }

    const noFilterAppliedMessageElement = document.querySelector('span.no-filter-applied-message')
    if(!noFilterAppliedMessageElement) {
        return
    }

    noFilterAppliedMessageElement.remove()

}

function loadAdvancedFilterFunctions() {
    loadItemsFromMainContent(new URL(window.location.href))
    verifyFilterLength()
}
