import { createLoader, hasElementRendered } from '../../utils/functions.js'
import { FavoritesDBManager, MainContentDBManager } from '../../database/db-manager.js'
import { renderStoredElement } from '../../database/dom-manipulation.js'

export { loadFavorites }

const favoritesSection = document.querySelector('[data-section="favorites"]')

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