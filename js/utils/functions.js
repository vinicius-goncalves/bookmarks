export {
    createPromise,
    createIconElement,
    createLoader,
    clearLoaders,
    hasElementRendered,
    updateDOMIcon,
    randomUUID
}

const createPromise = (callback) => new Promise(callback)

function createIconElement(GoogleMaterialIconsName, outlined = true) {
    const span = document.createElement('span')
    span.classList.add(outlined ? 'material-icons-outlined' : 'material-icons')
    span.textContent = GoogleMaterialIconsName
    return span
}

function createLoader() {
    
    const loaderWrapper = document.createElement('div')
    const loaderContent = document.createElement('div')
    
    loaderWrapper.classList.add('loader-wrapper')
    loaderContent.classList.add('loader-content')

    loaderWrapper.appendChild(loaderContent)
    document.body.insertAdjacentElement('afterbegin', loaderWrapper)
    
    return loaderWrapper
}

function clearLoaders() {

    const allLoaders = document.querySelectorAll('loader-wrapper')
    allLoaders.forEach(loader => loader.remove())

}

function hasElementRendered(root, node) {

    const nodeIterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT, {
        acceptNode: function(nodeToAccept) {
            const containsClass = nodeToAccept.classList.contains('item-stored')
            return containsClass ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        }
    })

    let currentNode = null
    while(currentNode = nodeIterator.nextNode()) {
        if(JSON.stringify(currentNode.innerHTML) === JSON.stringify(node.innerHTML)) {
            return true 
        }
    }

    return false
}

function updateDOMIcon(id, iconToUpdate, newIcon) {

    const dataId = `[data-id="${id}"]`
    const element = document.querySelector(dataId)
    
    if(!element.matches(dataId)) {
        return
    }

    const iconIntoElement = element.querySelector(`[data-tool="${iconToUpdate}"]`)
    iconIntoElement.textContent = newIcon
}


function randomUUID() {
    let dateTime = Date.now()
    const uuid = 'xxxxxxxx-4xxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const random = (dateTime + Math.random() * 16) % 16 | 0
        dateTime = dateTime / 16
        return (char === 'x' ? random : random & 0x3 | 0x8).toString(16)
    })
    return uuid
}