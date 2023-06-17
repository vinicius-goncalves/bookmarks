export {
    ElementHelper,
    StoredObject,
    HomePageStoredObject
}

class ElementHelper {

    #element

    constructor(HTMLTag) {
        this.#element = document.createElement(HTMLTag)
    }

    [Symbol.toPrimitive](hint) {

        if(hint === 'number') {
            return this.#element.nodeName.length
        }

        const defaultValue = ['default', 'string'].includes(hint)
        if(defaultValue) {
            return this.#element.outerHTML
        }

        throw new Error(`The ${hint} is not a valid option to convert. Use number or default instead.`)
    }

    [Symbol.toStringTag] = this.constructor.name

    getTagName() {
        return this.#element.nodeName.toLowerCase()
    }

    setClass(...className) {
        this.#element.classList.add(...className)
        return this
    }

    setAttr(...attrPair) {
        attrPair.forEach(([attrKey, attrValue]) => this.#element.setAttribute(attrKey, attrValue))
        return this
    }

    setCSSStyle(stylePairsArr) {
                
        if(!Array.isArray(stylePairsArr)) {
            isNotAnArrayErrorMsg('classNameArr')
        }

        stylePairsArr.forEach(([ cssProp, cssValue ]) => {
            
            const elStyle = this.#element.style
            elStyle.setProperty(cssProp, cssValue)
            
        })

        return this
    }

    appendText(text) {
        const textNode = document.createTextNode(text)
        this.#element.appendChild(textNode)
        return this
    }

    addEvtListener(type, callback) {
        this.#element.addEventListener(type, callback)
        return this
    }

    appendOn(element, options = undefined) {
                
        if(!Node[Symbol.hasInstance](element)) {
            throw new TypeError()
        }
        
        if(!options) {
            element.appendChild(this.#element)
            return this
        }

        const { position } = options
        element.insertAdjacentElement(position, this.#element)

        return this
    }

    appendElements(...elements) {

        const someIsNotNodeInstance = elements.some(element => !Node[Symbol.hasInstance](element))

        if(someIsNotNodeInstance) {

            throw new DOMException(`Some of the elements passed are not valid DOM references. The error was found at:`)
        }

        const fragment = document.createDocumentFragment()
        elements.forEach(element => fragment.appendChild(element))
        this.#element.appendChild(fragment)

        return this
    }

    build() {
        return this.#element
    }

    connectedCallback() {

        const newElement = this.#element.querySelector(this.getTagName())

        ;(function loadAttrs() {

            const classes = Array.from(this.classList.values())
            const attrs = Array.from(this.attributes, (attr) => [attr.name, attr.value])

            if(classes.length > 0) {
                newElement.classList.add(...classes)
            }

            if(attrs.length > 0) {
                attrs.forEach(([name, value]) => newElement.setAttribute(name, value))
            }

        }).call(this)
    }
}

//     return { 
//         element: itemStoredWrapper,
//         toolsWrapper: toolsWrapper
//     }
// }

class StoredObject extends HTMLElement {

    constructor(storedObject, objectOptions = { showTools: false }) {
        super()
        
        this.storedObject = storedObject
        this.objectOptions = objectOptions

        this.setAttribute('data-id', storedObject.id)
        this.classList.add('item-stored-wrapper')

        const { showTools } = this.objectOptions

        const titleWrapper = new ElementHelper('div')
        const titleWrapperBuilt = titleWrapper
            .setClass('title')
            .build()

        const toolsWrapperBuilt = new ElementHelper('div')
            .setClass('tools-wrapper')
            .setCSSStyle([['display', showTools ? 'block' : 'none']])
            .appendOn(titleWrapperBuilt)
            .build()

        this.appendChild(titleWrapperBuilt)

        this.element = this
        this.toolsWrapper = toolsWrapperBuilt
    }
}

class HomePageStoredObject extends StoredObject {
    constructor(storedObject, objectOptions = { showTools: false }) {
        super(storedObject, objectOptions)
    }

    connectedCallback() {

        const { id, content } = this.storedObject

        const MAX_LENGTH = 36
        const lengthContent = content.length > 36 ? `${content.slice(0, MAX_LENGTH)}...` : content

        const titleWrapperBuilt = this.querySelector('.title')

        const titleContent = new ElementHelper('p')
        titleContent.setClass('item-stored-name')
            .appendText(lengthContent)
            .appendOn(titleWrapperBuilt, { position: 'afterbegin' })
            .build()

        const descriptionWrapper = new ElementHelper('div')
        const descriptionWrapperBuilt = descriptionWrapper
            .setAttr(['data-description-id', id])
            .setClass('description')
            .build()

        const descriptionContent = new ElementHelper('div')
        const descriptionContentBuilt = descriptionContent.appendText('To see the entire content, ')
            .appendOn(descriptionWrapperBuilt)
            .build()

        new ElementHelper('a')
            .setAttr(['href', '#'])
            .setClass('link')
            .appendText('go to dashboard.')
            .appendOn(descriptionContentBuilt)
            .addEvtListener('click', ({ currentTarget }) => {
                const mainWrapper = currentTarget.closest('.item-stored-wrapper')
                const goToDashboard = mainWrapper.querySelector('abbr[title*="Track"]')
                goToDashboard.click()
            })
            .build()

        this.appendChild(descriptionWrapperBuilt)
    }
}

const customElementsPairs = [...new Map([
    ['stored-object', StoredObject],
    ['home-page-stored-object', HomePageStoredObject]
]).entries()]

customElementsPairs.forEach(([ tag, valueClass ]) => customElements.define(tag, valueClass))