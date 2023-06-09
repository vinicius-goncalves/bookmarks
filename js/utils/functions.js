export {
    createPromise,
    createIconElement,
    createLoader,
    clearLoaders,
    createDOMElement,
    hasElementRendered,
    updateDOMIcon,
    randomUUID
}

;(() => {

    Window.prototype.createElement = function(HTMLTag) {
        
        const newEl = document.createElement(HTMLTag)

        const isNotAnArrayErrorMsg = (paramName) => {
            throw new TypeError(`The param "${paramName} is not a valid array."`)
        }

        const protoFuncs = {
            setAttrs: function(attrsPairsArr) {

                if(!Array.isArray(attrsPairsArr)) {
                    isNotAnArrayErrorMsg('attrsPairsArr')
                }

                attrsPairsArr.forEach(([ attrName, attrValue ]) => newEl.setAttribute(attrName, attrValue))

                return newEl
            },
            
            setCls: function(clsNameArr) {

                if(!Array.isArray(clsNameArr)) {
                    isNotAnArrayErrorMsg('clsNameArr')
                }

                clsNameArr.forEach(clsName => newEl.classList.add(clsName.trim()))
                return newEl
            },

            setText: function(clsNameArr) {

                const newTextNode = document.createTextNode(clsNameArr)
                newEl.appendChild(newTextNode)
                
                return newEl
            },

            setCSSStyle: function(stylePairsArr) {
                
                if(!Array.isArray(stylePairsArr)) {
                    isNotAnArrayErrorMsg('clsNameArr')
                }

                stylePairsArr.forEach(([ cssProp, cssValue ]) => {
                    
                    const newElStyle = newEl.style
                    newElStyle.setProperty(cssProp, cssValue)
                    
                })

                return newEl
            },

            addEvtListener: function(evtName, callback, options = {}) {
                newEl.addEventListener(evtName, callback, options)
                return newEl
            }
        }

        const entriesProtoFuncs = Object.entries(protoFuncs)

        for(const [ funcName, funcCallee ] of entriesProtoFuncs) {
            Object.defineProperty(newEl, funcName, {
                value: funcCallee,
                enumerable: true
            })
        }

        if(newEl.nodeType === Node.ELEMENT_NODE) {
            return newEl
        }
    }

})()

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