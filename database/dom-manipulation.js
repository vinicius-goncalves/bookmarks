import { MainContentDBManager, FavoritesDBManager } from './db-manager.js'
import { createIconElement } from '../utils/functions.js'

export { loadStoredItemsIntoDOM }

const main = document.querySelector('main.content')

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

    favorite: function(storedObject, element) {

        const { id, content, createdAt } = storedObject
        
        element.addEventListener('click', async () => {
            const queryRes = await FavoritesDBManager.get(id)
            if(queryRes.isFavorite) {
                await FavoritesDBManager.remove(id)
                updateDOMIcon(id, 'favorite', 'favorite_border')
                return
            }

            const res = await FavoritesDBManager.put(id)
            
            if(!res.added) {
                console.log('An error has occurred when tried to add', id, 'to favorites.')
                return
            }

            updateDOMIcon(id, 'favorite', 'favorite')
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

async function renderStoredElement(storedObject) {

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

    const { isFavorite } = await FavoritesDBManager.get(id)

    const toolsToCreate = [
        isFavorite ? 'favorite' : 'favorite_border',
        'bookmark_border',
        'info'
    ]

    const iconsElementCreated = bulkToolCreator(storedObject, ...toolsToCreate)
    iconsElementCreated.forEach(icon => iconsWrapper.appendChild(icon))

    divItemStored.appendChild(headerWrapper)
    headerWrapper.appendChild(pItemStoreName)
    divItemStored.appendChild(iconsWrapper)
    
    return divItemStored
}

async function loadStoredItemsIntoDOM() {
    
    const storedItems = await MainContentDBManager.getAll()

    const fragment = document.createDocumentFragment()
    const resolvedItems = await Promise.all(storedItems.map(item => renderStoredElement(item)))
    resolvedItems.forEach(item => fragment.appendChild(item))
    main.appendChild(fragment)
}