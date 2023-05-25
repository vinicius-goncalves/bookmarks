import { FavoritesDBManager, MainContentDBManager } from '../database/db-manager.js'
import { createIconElement } from '../utils/functions.js'
import { loadAllStoredObjects } from './sections/advanced-filter.js'
import { loadFavoriteItems, updateFavoritesLength } from './sections/favorites.js'
import { handleWithQueryParams } from '../database/custom-query.js'
import { genericStoredObjectRender } from '../database/dom-manipulation.js'

export { storedObjectsRenderingHelper }

const dashboardWrapper = document.querySelector('.dashboard-wrapper')
const dashboardContent = dashboardWrapper.querySelector('.dashboard-content')

function updateDOMIcon(id, iconToUpdate, newIcon) {

    const dataId = `[data-id="${id}"]`
    const element = document.querySelector(dataId)
    
    if(!element.matches(dataId)) {
        return
    }

    const iconIntoElement = element.querySelector(`[data-tool="${iconToUpdate}"]`)
    iconIntoElement.textContent = newIcon
}

async function handleWithDashboardStoredObjectsRendering() {

    const urlQuery = new URL(window.location.href)
    const queryResult = await handleWithQueryParams(urlQuery)

    const options = { showTools: true }
    const renderObjectCallback = (queryStoredItem) => genericStoredObjectRender(queryStoredItem, options)

    const storedObjectsRendered = await Promise.all(queryResult.map(renderObjectCallback))

    const toolsCreationCallback = async ({ element, iconsWrapper }) => {

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
        toolsCreated.forEach(tool => iconsWrapper.appendChild(tool))

        return element
    }

    const renderedObjects = await Promise.all(storedObjectsRendered.map(toolsCreationCallback))
    return renderedObjects
}

const storedObjectsRenderingHelper = {
    get all() {
        return handleWithDashboardStoredObjectsRendering()
    }
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
    sectionFound.style.display = 'block'
    loadSectionFeatures(sectionTarget)
}

const allDataClose = document.querySelectorAll(`[data-close-target]`)

allDataClose.forEach(dataClose => {
    dataClose.addEventListener('click', () => {
        document.querySelector(`[data-close="${dataClose.getAttribute('data-close-target')}"]`).style.display = 'none'
    })
})

dashboardContent.addEventListener('click', (({ ['target']: targetClicked }) => {
    showSection(targetClicked)
}))

window.addEventListener('DOMContentLoaded', () => {
    showSection(getActiveSection())
})