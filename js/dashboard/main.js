import { FavoritesDBManager, MainContentDBManager } from '../database/db-manager.js'
import { loadAllStoredObjects } from './sections/advanced-search.js'
import { loadFavoriteItems, updateFavoritesLength } from './sections/favorites.js'
import { createURLFilter, startQuery } from '../database/custom-query.js'
import { genericStoredObjectRender } from '../utils/renders.js'
import { loadAdvancedFilterFunctions } from './sections/advanced-search.js'
import { updateDOMIcon } from '../utils/functions.js'

export {
    getDashboardElements,
    loadAdvancedFilterFunctions,
    handleWithDashboardStoredObjectsRendering,
    showElementsMatchedOnQuery
}

const getDashboardElements = () => {

    const o = {
        wrappers: {
            dashboardWrapper: document.querySelector('.dashboard-wrapper'),
            filterOptions: document.querySelector('.filter-options-wrapper')
        },
        contents: {
            dashboardContent: document.querySelector('.dashboard-content'),
        },
        sections: {
            advancedSearch: document.querySelector('[data-section="advanced_search"]')
        },
        targets: {
            advancedSearch: document.querySelector('[data-section-target="advanced_search"]') 
        },
        sectionOption: {
            advancedSearch: document.querySelector('[data-section-option="advanced_search"]') 
        }
    }

    return o
}

async function showElementsMatchedOnQuery(filtersObj) {
    
    const storedObjectsFound = await startQuery(createURLFilter(filtersObj))
    const dashboardElements = (await getDashboardElements())

    const { ['advancedSearch']: advancedSearchSection } = dashboardElements.sections
    const { filterOptions } = dashboardElements.wrappers

    const allRenderedElements = advancedSearchSection.children
    const renderedElementsCopy = [...allRenderedElements].slice(1)
    
    renderedElementsCopy.forEach(element => {
        const elementID = element.getAttribute('data-id')
        const existsOnQuery = storedObjectsFound.some(storedObject => storedObject.id === elementID)
        if(!existsOnQuery) {
            element.style.display = 'none'
            return
        }
        element.style.display = 'flex'
    })

    filterOptions.style.setProperty('display', 'none')
    return
}

const toolsHandle = {

    favorite(storedObject, element) {

        const { id } = storedObject
        
        element.addEventListener('click', async () => {

            try {
                const { isFavorite } = await FavoritesDBManager.get(id)
            
                if(isFavorite) {
                    await FavoritesDBManager.remove(id)
                    updateDOMIcon(id, 'favorite', 'favorite_border')
                    return
                }
    
                const { added } = await FavoritesDBManager.put(id)
                
                if(!added) {
                    console.log(`An error has occurred when tried to add "${id}" to favorites.`)
                    return
                }
    
                updateDOMIcon(id, 'favorite', 'favorite')
            } catch (err) {
                console.error(err)
            } finally {
                updateFavoritesLength()      
            }
        })
    },
    
    bookmark(storedObject, element) {},
    info(storedObject, element) {},
}


function dashboardBulkToolCreator(storedObject, ...GoogleMaterialIconsName) {
    
    const toolsCreated = GoogleMaterialIconsName.map(tool => {
        
        const toolName = tool.split('_').at(0)

        const toolCreated = createIconElement(tool, true)
        toolCreated.classList.add('icon-content-tools')
        toolCreated.dataset.tool = toolName

        const [ _, loadListener ] = Object
            .entries(toolsHandle)
            .find(([ funcName ]) => funcName == toolName)

        loadListener(storedObject, toolCreated)

        return toolCreated
    })

    return toolsCreated
}

async function handleWithDashboardStoredObjectsRendering(elements) {

    const toolsCreationCallback = async ({ element, toolsWrapper }) => {

        const storedObjectID = element.getAttribute('data-id')
        const storedObjectFromID = await MainContentDBManager.get(storedObjectID)
        
        if(!storedObjectFromID) {
            return
        }

        const storedFavoriteObjectFromID = await FavoritesDBManager.get(storedObjectID)
        const { isFavorite } = storedFavoriteObjectFromID
        
        const toolsToCreate = [ 
            isFavorite ? 'favorite' : 'favorite_border',
            'bookmark_border',
            'info'
        ]

        const toolsCreated = dashboardBulkToolCreator(storedObjectFromID, ...toolsToCreate)
        toolsCreated.forEach(tool => toolsWrapper.appendChild(tool))

        return element
    }

    const options = { showTools: true }
    const renderObjectCallback = (queryStoredItem) => genericStoredObjectRender(queryStoredItem, options)

    const storedObjectsRendered = await Promise.all(elements.map(renderObjectCallback))
    const renderedObjects = await Promise.all(storedObjectsRendered.map(toolsCreationCallback))
    return renderedObjects
}

function loadSectionFeatures(sectionName) {
    
    const featuresMap = [
        [ 'advanced_search', loadAllStoredObjects ],
        [ 'bookmarks', null ],
        [ 'favorites', loadFavoriteItems ]
    ]

    const [ _, functionInvoker ] = featuresMap.find(([ funcName ]) => funcName === sectionName)
    
    try {
        functionInvoker()
        return { invoked: true }
    } catch(err) {
        return { invoked: false, err }
    }
}

function hideAllSections() {
    const allSections = document.querySelectorAll('[data-section]')
    allSections.forEach(({ style }) => style.display = 'none')
}

function getActiveSection() {
    const currentSection = document.querySelector('[data-section-showing="true"]')
    return currentSection
}

function changeActiveActionTo(newTarget) {

    if(!newTarget || !(newTarget instanceof Node)) {
        throw new Error('It was not possible to change the target. Verify if "target" is a valid DOM node.')
    }

    const currentSection = document.querySelector('[data-section-showing="true"]')
    currentSection.setAttribute('data-section-showing', false)
    
    newTarget.setAttribute('data-section-showing', true)

    const targetResult = { sectionTarget: newTarget.getAttribute('data-section-target') }
    return targetResult
}

const getSectionTarget = (sectionTarget) => document.querySelector(`[data-section="${sectionTarget}"]`)

function showSection(targetClicked) {

    if(!targetClicked.hasAttribute('data-section-target')) {
        return
    }

    const { sectionTarget } = changeActiveActionTo(targetClicked)
    const sectionFound = getSectionTarget(sectionTarget)
    
    if(!sectionFound) {
        return
    }

    hideAllSections()
    sectionFound.removeAttribute('style')
    loadSectionFeatures(sectionTarget)
}

;(async () => {

    const { dashboardContent } = (await getDashboardElements()).contents

    const eventsHandler = {

        handleWithSectionChanges({ ['target']: targetClicked }) {
            showSection(targetClicked)
        },

        handleWithClosesButtons(closeButton) {
            closeButton.addEventListener('click', () => {

                const wrapperToClose = `[data-close="${closeButton.getAttribute('data-close-target')}"]`
                const wrapperFound = document.querySelector(wrapperToClose)

                if(!wrapperFound) {
                    return
                }

                const wrapperStyle = wrapperFound.style
                wrapperStyle.setProperty('display', 'none')
            })
        },

        handleWithFunctionsLoading() {
            showSection(getActiveSection())
            loadAdvancedFilterFunctions()
        }
    }

    const { 
        handleWithSectionChanges, 
        handleWithClosesButtons, 
        handleWithFunctionsLoading } = eventsHandler

    dashboardContent.addEventListener('click', handleWithSectionChanges)
    window.addEventListener('DOMContentLoaded', handleWithFunctionsLoading)

    const allDataClose = document.querySelectorAll(`[data-close-target]`)
    const setListenerForDataCloseCallback = closeButton => handleWithClosesButtons(closeButton)
    allDataClose.forEach(setListenerForDataCloseCallback)

})()