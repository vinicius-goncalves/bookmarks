import { MainContentDBManager } from './db-manager.js'
import { createIconElement } from '../utils/functions.js'
import { createURLFilter, startQuery } from '../database/custom-query.js'
import { getDashboardElements } from '../dashboard/main.js'

export { loadStoredElements, genericStoredObjectRender }

const MAX_CONTENT_LENGTH = 1 << 6

const mainContent = document.querySelector('main.content')

 function createToolFromIconName(GoogleMaterialIconsName, toolDescription) {

    const toolFromIcon = createIconElement(GoogleMaterialIconsName)

    const abbr = document.createElement('abbr')
    abbr.title = toolDescription
    abbr.appendChild(toolFromIcon)

    return abbr
}

async function genericStoredObjectRender(storedObject, objectOptions = { showTools: false }) {
 
    const { showTools } = objectOptions
    
    const { id, content } = storedObject

    const divItemStored = document.createElement('div')
    divItemStored.classList.add('item-stored')
    divItemStored.dataset.id = id
    
    const headerWrapper = document.createElement('div')
    
    const pItemStoreName = document.createElement('div')
    pItemStoreName.classList.add('item-store-name')
    pItemStoreName.textContent = content.length < MAX_CONTENT_LENGTH 
        ? content
        : `${content.slice(0, MAX_CONTENT_LENGTH)}...`

    const iconsWrapper = document.createElement('div')
    iconsWrapper.classList.add('icons-wrapper')
    iconsWrapper.style.display = showTools ? 'block' : 'none'

    divItemStored.appendChild(headerWrapper)
    headerWrapper.appendChild(pItemStoreName)
    divItemStored.appendChild(iconsWrapper)
    
    return { 
        element: divItemStored,
        iconsWrapper: iconsWrapper
    }
}

async function updateStoredObjectIcon(id, newIcon) {
    console.log(id, newIcon)
}

async function loadIconsMenu(id, x, y) {

    const DEFAULT_LINK = `js/database/available-icons.json`
    const response = await fetch(DEFAULT_LINK)
    const availableIcons = await response.json()

    const tempIconWrapper = document.createElement('div')
    tempIconWrapper.classList.add('temp-icons-menu')

    const createTools = (icon) => {
        
        const newIcon = createIconElement(icon)
        newIcon.addEventListener('click', () =>  updateStoredObjectIcon(id, icon))

        tempIconWrapper.appendChild(newIcon)
    }

    availableIcons.forEach(createTools)

    tempIconWrapper.onmouseleave = () => tempIconWrapper.remove()

    tempIconWrapper.style.left = x + 'px'
    tempIconWrapper.style.top = y + 'px'
    tempIconWrapper.style.position = 'absolute'
    
    document.body.prepend(tempIconWrapper)
}

async function openElementOnDashboard(elementID) {
    
    const storedObjectFound = await startQuery(createURLFilter({ id: elementID }))
    
    if(!storedObjectFound) {
        return
    }

    const dashboardElements = (await getDashboardElements())

    const { ['advancedSearch']: advancedSearchSection } = dashboardElements.sections
    const { dashboardWrapper } = dashboardElements.wrappers

    const allRenderedElements = advancedSearchSection.children
    const renderedElementsCopy = [...allRenderedElements].slice(1)
    
    const [ storedObject ] = storedObjectFound, { ['id']: storedObjectID } = storedObject

    const handleWithElementsVisibleCallback = el => el.getAttribute('data-id') == storedObjectID 
        ? el.style.display = 'flex'
        : el.style.display = 'none'
    renderedElementsCopy.forEach(handleWithElementsVisibleCallback)

    dashboardWrapper.removeAttribute('style')

    return
}

async function loadStoredElements() {
    
    const storedItems = await MainContentDBManager.getAll()

    const fragment = document.createDocumentFragment()
    const renderStoredObjectsCallback = storedItems.map(item => genericStoredObjectRender(item))
    const genericStoredObjectsRendered = await Promise.all(renderStoredObjectsCallback)

    const renderedObjectsModified = genericStoredObjectsRendered.map(({ element, iconsWrapper }) => {
        
        const expandIcon = createToolFromIconName('expand_more', 'Click to expand the task')
        const goToDashboardIcon = createToolFromIconName('north_east', 'Track down this task on dashboard')
        const changeIcon = createToolFromIconName('emoji_emotions', 'Change task icon')

        const elementID = element.getAttribute('data-id')

        const toolsToAppend = [expandIcon, goToDashboardIcon, changeIcon]
        toolsToAppend.forEach(tool => iconsWrapper.appendChild(tool))

        goToDashboardIcon.addEventListener('click', async () => {
            await openElementOnDashboard(elementID)
            
        })

        changeIcon.addEventListener('click', (event) => loadIconsMenu(elementID, event.pageX, event.pageY))

        element.addEventListener('mouseenter', () => iconsWrapper.style.display = 'block')
        element.addEventListener('mouseleave', () => iconsWrapper.style.display = 'none')

        return element
    })

    renderedObjectsModified.forEach(item => fragment.appendChild(item))
    mainContent.appendChild(fragment)
}