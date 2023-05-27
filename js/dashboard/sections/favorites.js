import { createLoader, hasElementRendered } from '../../utils/functions.js'
import { FavoritesDBManager, MainContentDBManager } from '../../database/db-manager.js'
import { genericStoredObjectRender } from '../../database/dom-manipulation.js'

export { updateFavoritesLength, loadFavoriteItems }

const favoritesSection = document.querySelector('[data-section="favorites"]')
const favoriteSectionOption = document.querySelector('[data-section-option="favorites"]')

async function updateFavoritesLength() {
    const favoritesLength = await FavoritesDBManager.length
    favoriteSectionOption.setAttribute('data-favorites-length', favoritesLength)
}

async function loadFavoriteItems() {

    const storedObjectsRendered = await storedObjectsRenderingHelper.all
    
    const filterByObjectKeyCallback = storedObject => storedObject.favoriteElement ? true : false
    const onlyFavoritesStoredObjects = storedObjectsRendered.filter(filterByObjectKeyCallback)

    
    const elementsNotAppendedCallback = element => !hasElementRendered(favoritesSection, element)
    const elementsNotAppended = onlyFavoritesStoredObjects.filter(elementsNotAppendedCallback)

    const fragment = document.createDocumentFragment()
    elementsNotAppended.forEach(element => fragment.appendChild(element))
    favoritesSection.appendChild(fragment)
}

window.addEventListener('DOMContentLoaded', () => {
    updateFavoritesLength()
})