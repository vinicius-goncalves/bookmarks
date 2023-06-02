import { createDOMElement } from './functions.js'

export { genericStoredObjectRender }

async function genericStoredObjectRender(storedObject, objectOptions = { showTools: false }) {
    
    const { showTools } = objectOptions
    const { id, content } = storedObject

    const MAX_CONTENT_LENGTH = 1 << 5
    const titleItemStoredText = content.length < MAX_CONTENT_LENGTH
        ? content
        : `${content.slice(0, MAX_CONTENT_LENGTH)}...`

    const itemStoredElement = {

        itemStoredWrapper: {
            div: {
                classes: { active: true, classesList: [ 'item-stored-wrapper' ] },
                attributes: { active: true, attributesList: [[ 'data-id', id ]] }
            }
        },

        titleWrapper: {
            div: {
                classes: { active: true, classesList: [ 'title' ] },
            }
        },
        titleName: {
            p: {
                classes: { active: true, classesList: [ 'item-stored-name' ] },
                textContent: { active: true, text: titleItemStoredText }
            }
        },
        toolsWrapper: {
            div: { 
                classes: { active: true, classesList: [ 'tools-wrapper' ] },
                inlineStyle: { active: true, inlineStyleList: [[ 'display', showTools ? 'block' : 'none' ]] }
            }
        },
        
        descriptionWrapper: {
            div: {
                classes: { active: true, classesList: [ 'description' ] },
                attributes: { active: true, attributesList: [[ 'data-description-id', id ]] }
            }
        },
        descriptionContent: {
            div: {
                textContent: { active: true, text: 'To see the entire content, ' }
            }
        },
        gotoDashboardAnchor: {
            a: {
                attributes: { active: true, attributesList: [ ['href', '#'] ] },
                classes: { active: true, classesList: [ 'link' ] },
                textContent: { active: true, text: 'go to dashboard.' },
                evtListeners: {
                    active: true,
                    listenersList: [[ 'click', ({ currentTarget }) => {
                            const mainWrapper = currentTarget.closest('.item-stored-wrapper')
                            const goToDashboard = mainWrapper.querySelector('abbr[title*="Track"]')
                            goToDashboard.click()
                        }]
                    ]
                }
            }
        }
    }

    const itemStoredWrapper = await createDOMElement(itemStoredElement.itemStoredWrapper)

    const titleWrapper = await createDOMElement(itemStoredElement.titleWrapper)
    const titleName = await createDOMElement(itemStoredElement.titleName)
    const toolsWrapper = await createDOMElement(itemStoredElement.toolsWrapper)
    
    const descriptionWrapper = await createDOMElement(itemStoredElement.descriptionWrapper)
    const descriptionContent = await createDOMElement(itemStoredElement.descriptionContent)
    const goToDashboardAnchor = await createDOMElement(itemStoredElement.gotoDashboardAnchor)
    
    itemStoredWrapper.append(titleWrapper, descriptionWrapper)
    titleWrapper.append(titleName, toolsWrapper)
    descriptionWrapper.appendChild(descriptionContent)
    descriptionContent.appendChild(goToDashboardAnchor)
    
    return { 
        element: itemStoredWrapper,
        toolsWrapper: toolsWrapper
    }
}