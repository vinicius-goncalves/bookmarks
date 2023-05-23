import { loadAdvancedFilterFunctions } from './sections/advanced-filter.js'
import { loadFavorites } from './sections/favorites.js'

export { toolsHandle, dashboardBulkToolCreator }

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

        console.log(toolName)

        const [ _, loadListener ] = Object
            .entries(toolsHandle)
            .find(([ funcName ]) => funcName == toolName)

        loadListener(storedObject, toolCreated)

        return toolCreated
    })

    return toolsCreated
}

function getActiveSection() {
    const currentSection = document.querySelector('[data-section-showing="true"]')
    return currentSection
}

function hideAllSections() {
    const allSections = document.querySelectorAll('[data-section]')
    allSections.forEach(({ style }) => style.display = 'none')
}

function loadSectionFeatures(sectionName) {
    
    const featuresMap = [
        [ 'advanced_search', loadAdvancedFilterFunctions ],
        [ 'bookmarks', null ],
        [ 'favorites', loadFavorites ]
    ]

    const [ _, invokeFunction ] = featuresMap.find(([ funcName ]) => funcName === sectionName)
    
    try {
        invokeFunction()
        return { invoked: true }
    } catch(err) {
        return { invoked: false, err }
    }
}

const getSectionTarget = (sectionTarget) => document.querySelector(`[data-section="${sectionTarget}"]`)

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

function handleWithSectionTargets(target) {

    if(!target.hasAttribute('data-section-target')) {
        return
    }

    const { sectionTarget } = changeActiveActionTo(target)
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

dashboardContent.addEventListener('click', (({ target }) => {
    handleWithSectionTargets(target)
}))

window.addEventListener('DOMContentLoaded', () => {
    handleWithSectionTargets(getActiveSection())
})