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

// const elementSettings = {
//     p: {
//         classes: {
//             active: true,
//             classesList: new Map([
//                 [1, 'one'],
//                 [2, 'two'],
//                 [3, 'three']
//             ])
//         },
//         attributes: {
//             active: true,
//             attributesList: new Map([
//                 ['data-tool', 1234]
//             ])
//         },
//         inlineStyle: {
//             active: true,
//             inlineStyleList: new Map([
//                 ['background-color', 'red'],
//                 ['font-size', '32px']
//             ])
//         },
//         textContent: {
//             active: true,
//             text: 'Hello World!'
//         },
//         evtListeners: {
//             active: true,
//             listenersList: new Map([
//                 ['click', () => console.log('hello world?')]
//             ])
//         }
//     }
// }
async function createDOMElement(objElementSettings) {

    const promiseCreated = createPromise(resolve => {
        const objKeys = Object.keys(objElementSettings)
        const elementsDefined = objKeys.length

        if(elementsDefined > 1) {
            throw new TypeError(`Just only one element per object. Were found ${objKeys.length}`)
        }

        const HTMLTag = objKeys[0]
        const emptyElement = document.createElement(HTMLTag)
        const elementSettings = objElementSettings[HTMLTag]
        
        const knowSettings = ['classes', 'attributes', 'inlineStyle', 'evtListeners', 'textContent']

        const getDefinedSettings = (settingName) => knowSettings.includes(settingName)
        const settingsDefined = Object.keys(elementSettings).filter(getDefinedSettings)

        const filterActiveSettingsCallback = (objAcc, settingPropName) => {

            const currSetting = Reflect.get(elementSettings, settingPropName)
            const isActive = Reflect.get(currSetting, 'active')

            if(!isActive) {
                return objAcc
            }

            Reflect.set(objAcc, settingPropName, currSetting)
            return objAcc
        }

        const accValue = Object.assign(Object.create(null))
        const objSettingsFiltered = Object.freeze(settingsDefined.reduce(filterActiveSettingsCallback, accValue))

        const getAttributeList = (currAttrSettings) => {
            const attributeSettings = Object.keys(currAttrSettings)
            const listType = attributeSettings.find(propName => propName.search(/.*List$/gi) >= 0)
            return [...currAttrSettings[listType].entries()]
        }

        const settersFunctions = {

            'classes': (element, currAttrSettings) => {
                const classesList = getAttributeList(currAttrSettings)
                const setClasses = ([ _, className ]) => element.classList.add(className)
                classesList.forEach(setClasses)
            },

            'attributes': (element, currAttrSettings) => {
                const attributesList = getAttributeList(currAttrSettings)
                const setAttributes = ([ attrName, attrValue ]) => element.setAttribute(attrName, attrValue)
                attributesList.forEach(setAttributes)
            },

            'inlineStyle': (element, currAttrSettings) => {
                const stylePropList = getAttributeList(currAttrSettings)
                const setStyle = ([ styleProp, styleValue ]) => element.style.setProperty(styleProp, styleValue)
                stylePropList.forEach(setStyle)
            },

            'evtListeners': (element, currAttrSettings) => {
                const listeners = getAttributeList(currAttrSettings)
                const setListeners = ([ evtName, evtFunc ]) => element.addEventListener(evtName, evtFunc)
                listeners.forEach(setListeners)
            },

            'textContent': (element, currAttrSettings) => {
                const textNode = document.createTextNode(currAttrSettings.text)
                element.appendChild(textNode)
            }
        }

        const finalElement = Object.keys(objSettingsFiltered).reduce((emptyElement, currPropName) => {
            
            const [ _, setterFunc ] = Object.entries(settersFunctions).find(([ setter ]) => setter === currPropName)
            
            try {
                setterFunc(emptyElement, Reflect.get(objSettingsFiltered, currPropName))
            } catch (err) {
                console.error(err)
            }

            return emptyElement

        }, emptyElement)

        resolve(finalElement)
    })

    return promiseCreated
}

const e = {
    a: {
        attributes: {
            active: true,
            attributesList: new Map([
                ['href', '#']
            ])
        },
        classes: {
            active: true,
            classesList: new Map([
                [ 0, 'eae' ]
            ])
        },
        textContent: {
            active: true,
            text: 'Hello World'
        }
    }
}

createDOMElement(e).then(elCreated => console.log(elCreated))

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