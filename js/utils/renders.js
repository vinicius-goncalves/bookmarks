export { genericStoredObjectRender }

const MAX_CONTENT_LENGTH = 1 << 5

async function genericStoredObjectRender(storedObject, objectOptions = { showTools: true }) {
 
    const { showTools } = objectOptions
    
    const { id, content } = storedObject

    const divItemStored = document.createElement('div')
    divItemStored.classList.add('item-stored')
    divItemStored.dataset.id = id

    const titleDivItemStored = document.createElement('div')
    titleDivItemStored.classList.add('title')
    
    const pItemStoreName = document.createElement('div')
    pItemStoreName.classList.add('item-store-name')
    pItemStoreName.textContent = content.length < MAX_CONTENT_LENGTH 
        ? content
        : `${content.slice(0, MAX_CONTENT_LENGTH)}...`

    const iconsWrapper = document.createElement('div')
    iconsWrapper.classList.add('icons-wrapper')
    iconsWrapper.style.display = showTools ? 'block' : 'none'

    const descriptionDivItemStored = document.createElement('div')
    descriptionDivItemStored.classList.add('description')
    descriptionDivItemStored.dataset.descriptionId = storedObject.id

    const pDescription = document.createElement('p')
    pDescription.textContent = 'To see the entire content'

    const aDescription = document.createElement('a')
    aDescription.href = '#'
    aDescription.textContent = ' go to dashboard.'
    aDescription.classList.add('link')
    pDescription.appendChild(aDescription)
    aDescription.onclick = ({ currentTarget }) => {
        console.log(currentTarget.closest('[data-id]').querySelector('[data-tool="go-to-dashboard"]').querySelector('span').click())
    }

    descriptionDivItemStored.append(pDescription)
    titleDivItemStored.append(pItemStoreName, iconsWrapper)
    descriptionDivItemStored.appendChild(pDescription)
    
    divItemStored.append(titleDivItemStored, descriptionDivItemStored)
    
    return { 
        element: divItemStored,
        iconsWrapper: iconsWrapper
    }
}