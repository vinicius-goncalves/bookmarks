import { createLoader, hasElementRendered } from '../../utils/functions.js'
import { FavoritesDBManager, MainContentDBManager } from '../../database/db-manager.js'
import { renderStoredElement } from '../../database/dom-manipulation.js'

export { loadFavorites, updateFavoritesLength }

const favoritesSection = document.querySelector('[data-section="favorites"]')
const favoriteSectionOption = document.querySelector('[data-section-option="favorites"]')

async function loadFavorites() {

    const loader = createLoader()
    
    const { res } = await FavoritesDBManager.getAll()
    const idsFavorites = res.map(({ id }) => id)
    
    const favorites = await MainContentDBManager.bulkSearch(...idsFavorites)
    
    favorites.forEach(async (favorite) => {

        const item = await renderStoredElement(favorite)
        
        if(hasElementRendered(favoritesSection, item)) {
            return
        }

        favoritesSection.appendChild(item)
    })

    loader.remove()
}

async function updateFavoritesLength() {
    console.log(await FavoritesDBManager.getAll())
    const favoritesLength = await FavoritesDBManager.length
    favoriteSectionOption.setAttribute('data-favorites-length', favoritesLength)
}

window.addEventListener('load', () => updateFavoritesLength())