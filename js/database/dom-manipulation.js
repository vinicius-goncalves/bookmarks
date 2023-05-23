import { MainContentDBManager, FavoritesDBManager } from './db-manager.js'
import { createIconElement } from '../utils/functions.js'
import { updateFavoritesLength } from '../dashboard/sections/favorites.js'

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

async function genericStoredObjectRender(storedObject, showTools = false) {

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

async function loadIconsMenu(x, y) {
    const DEFAULT_LINK = `js/database/available-icons.json`
    const response = await fetch(DEFAULT_LINK)
    const availableIcons = await response.json()

    const tempIconWrapper = document.createElement('div')
    tempIconWrapper.classList.add('temp-icons-menu')

    availableIcons.forEach(item => tempIconWrapper.appendChild(createIconElement(item)))

    tempIconWrapper.onmouseleave = () => tempIconWrapper.remove()

    tempIconWrapper.style.left = x + 'px'
    tempIconWrapper.style.top = y + 'px'
    tempIconWrapper.style.position = 'absolute'
    
    document.body.prepend(tempIconWrapper)
}

async function loadStoredElements() {
    
    const storedItems = await MainContentDBManager.getAll()

    const fragment = document.createDocumentFragment()
    const renderStoredObjectsCallback = storedItems.map(item => genericStoredObjectRender(item))
    const genericStoredObjectsRendered = await Promise.all(renderStoredObjectsCallback)
    
    const renderedObjectsModified = genericStoredObjectsRendered.map(({ element, iconsWrapper }) => {
        
        const goToDashboard = createToolFromIconName('north_east', 'Track down this task on dashboard')
        const changeIcon = createToolFromIconName('emoji_emotions', 'Change task icon')

        Array.of(goToDashboard, changeIcon).forEach(tool => iconsWrapper.appendChild(tool))

        changeIcon.addEventListener('click', (event) => {
            console.log(event.pageX, event.pageY)
            loadIconsMenu(event.pageX, event.pageY)
        })

        // changeIcon.click()

        element.addEventListener('mouseenter', () => iconsWrapper.style.display = 'block')
        element.addEventListener('mouseleave', () => iconsWrapper.style.display = 'none')

        return element
    })

    renderedObjectsModified.forEach(item => fragment.appendChild(item))
    mainContent.appendChild(fragment)
}