import { hasElementRendered } from '../../utils/functions.js'
import { FavoritesDBManager } from '../../database/db-manager.js'
import { getDashboardElements } from '../main.js'

export { updateFavoritesLength, loadFavoriteItems }

const favoritesSection = document.querySelector('[data-section="favorites"]')
const favoriteSectionOption = document.querySelector('[data-section-option="favorites"]')

async function updateFavoritesLength() {
    const favoritesLength = await FavoritesDBManager.length
    favoriteSectionOption.setAttribute('data-favorites-length', favoritesLength)
}

async function loadFavoriteItems() {

    const { advancedSearch } = (await getDashboardElements()).sections
    const advancedSearchChildren = Array.prototype.slice.call(advancedSearch.children, 1)

    const idsFavoritesStoredObjects = (await FavoritesDBManager.getAll()).res.map(({ id }) => id)
    
    const onlyFavoritesStoredObjects = advancedSearchChildren.filter(element => {
        const elementID = element.getAttribute('data-id')
        return idsFavoritesStoredObjects.find(storedObjectID => storedObjectID == elementID)
    })

    const elementsNotAppendedCallback = element => !hasElementRendered(favoritesSection, element)
    const elementsNotAppended = onlyFavoritesStoredObjects.filter(elementsNotAppendedCallback)

    console.log(elementsNotAppended)

    const fragment = document.createDocumentFragment()
    elementsNotAppended.forEach(element => fragment.appendChild(element))
    favoritesSection.appendChild(fragment)
}

window.addEventListener('DOMContentLoaded', () => {
    updateFavoritesLength()
})