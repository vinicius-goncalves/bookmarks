import { MainContentDBManager } from './db-manager.js'
import { createIconElement } from '../utils/functions.js'

export { loadStoredItemsIntoDOM }

const main = document.querySelector('main.content')

const toolsHandle = {

    favorite: function(storedObject, element) {

        const { id, content, createdAt } = storedObject
        
        element.addEventListener('click', () => {
            console.log(id, content, createdAt)
        })
    },

    
    bookmark: function(storedObject, element) {
        
    },

    info: function(storedObject, element) {

        element.addEventListener('mouseenter', () => {
            
        })
    },
}

function bulkToolCreator(storedObject, ...GoogleMaterialIconsName) {
    
    const toolsCreated = GoogleMaterialIconsName.map(tool => {
        
        const toolName = tool.split('_').at(0)

        const toolCreated = createIconElement(tool, true)
        toolCreated.classList.add('icon-content-tools')
        toolCreated.dataset.tool = toolName

        const [ _, loadToolListenerTo ] = Object.entries(toolsHandle).find(([ prop ]) => prop == toolName)
        loadToolListenerTo(storedObject, toolCreated)

        return toolCreated
    })

    return toolsCreated
}

function renderStoredElement(storedObject) {

    const { id, content } = storedObject

    const divItemStored = document.createElement('div')
    divItemStored.classList.add('item-stored')
    divItemStored.dataset.id = id
    
    const headerWrapper = document.createElement('div')
    
    const pItemStoreName = document.createElement('div')
    pItemStoreName.classList.add('item-store-name')
    pItemStoreName.textContent = content

    const iconsWrapper = document.createElement('div')
    iconsWrapper.classList.add('icons-wrapper')

    const iconsElementCreated = bulkToolCreator(storedObject, 'favorite_border', 'bookmark_border', 'info')
    iconsElementCreated.forEach(icon => iconsWrapper.appendChild(icon))

    divItemStored.appendChild(headerWrapper)
    headerWrapper.appendChild(pItemStoreName)
    divItemStored.appendChild(iconsWrapper)
    
    return divItemStored
}

async function loadStoredItemsIntoDOM() {
    
    const storedItems = await MainContentDBManager.getAll()

    const fragment = document.createDocumentFragment()
    storedItems.forEach(item => fragment.appendChild(renderStoredElement(item)))

    main.appendChild(fragment)
}