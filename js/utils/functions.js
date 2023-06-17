export {
    createPromise,
    createLoader,
    clearLoaders,
    hasElementRendered,
    updateDOMIcon,
    randomUUID,
    randomID
}

;(() => {

    Window.prototype.createElement = function(HTMLTag) {
        
        const newEl = document.createElement(HTMLTag)

        const isNotAnArrayErrorMsg = (paramName) => {
            throw new TypeError(`The param "${paramName} is not a valid array."`)
        }

        const getDefiner = (name) => ({
            attr: function(attrName, attrValue) {
                newEl.setAttribute(attrName, attrValue)
            },
            class: function(className) {
                newEl.classList.add(className)
            }
        })[name]

        const protoFuncs = {

            setAttrs: function(attrsArr) {

                if(!Array.isArray(attrsArr)) {
                    isNotAnArrayErrorMsg('attrsArr')
                }

                const defineAttr = getDefiner('attr')

                const isAllArray = attrsArr.every(pair => Array.isArray(pair))

                if(isAllArray) {
                    attrsArr.forEach(([ attrName, attrValue ]) => defineAttr(attrName, attrValue))
                    return newEl
                }
            },

            setAttr: function(attrName, attrValue) {
                
                const defineAttr = getDefiner('attr')
                defineAttr(attrName, attrValue)

                return newEl
            },
            
            setClasses: function(classNameArr) {

                if(!Array.isArray(classNameArr)) {
                    isNotAnArrayErrorMsg('classNameArr')
                }

                classNameArr.forEach(clsName => newEl.classList.add(clsName.trim()))
                return newEl
            },

            setClass: function(className) {
                
                const defineClass = getDefiner('class')
                defineClass(className)

                return newEl
            },

            setText: function(classNameArr) {

                const newTextNode = document.createTextNode(classNameArr)
                newEl.appendChild(newTextNode)
                
                return newEl
            },

            setCSSStyle: function(stylePairsArr) {
                
                if(!Array.isArray(stylePairsArr)) {
                    isNotAnArrayErrorMsg('classNameArr')
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
            },

            appendOn: function(element, options = undefined) {
                
                if(!Node[Symbol.hasInstance](element)) {
                    return
                }
                
                if(!options) {
                    element.appendChild(newEl)
                    return
                }

                const { position } = options
                element.insertAdjacentElement(position, newEl)

                return newEl
            },

            appendElements: function(...elements) {

                const someIsNotNodeInstance = elements.some(element => !Node[Symbol.hasInstance](element))

                if(someIsNotNodeInstance) {

                    console.log(this.constructor)

                    throw new DOMException(`Some of the elements passed are not valid DOM references. The error was found at:`)
                }

                const fragment = document.createDocumentFragment()
                elements.forEach(element => fragment.appendChild(element))
                newEl.appendChild(fragment)

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

    Window.prototype.createIconElement = function(useOutlinedIcons = true) {

        const span = createElement('span')
            .setClass(useOutlinedIcons ? 'material-icons-outlined' : 'material-icons')
        
        const propOptions = {
            value: function getIcon(name) {
                span.setText(name)
                return span
            },
            enumerable: true
        }
    
        Object.defineProperty(span, 'getIcon', propOptions)

        return span
    }

    Window.prototype.getDocumentBody = function() {
        return document.body
    }
    

    Node.prototype.getTagName = function() {
        return this.nodeName.toLowerCase()
    }
    
    Array.prototype.group = function(callback) {
        return this.reduce((acc, item) => (acc[callback(item)] ??= []).push(item) && acc, {})
    }
})()

const createPromise = (callback) => new Promise(callback)

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

function randomID() {
    return 'x'.repeat(15).replace(/x/g, () => ((Math.random() * 16) % 16 | 0).toString(16))
}