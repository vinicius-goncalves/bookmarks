export { genericStoredObjectRender }

async function genericStoredObjectRender(storedObject, objectOptions = { showTools: false }) {
    
    const { showTools } = objectOptions
    const { id, content } = storedObject

    const MAX_CONTENT_LENGTH = 1 << 5
    const titleItemStoredText = content.length < MAX_CONTENT_LENGTH
        ? content
        : `${content.slice(0, MAX_CONTENT_LENGTH)}...`

    const itemStoredWrapper = createElement('div')
        .setAttr('data-id', id)
        .setClass('item-stored-wrapper')

    const titleWrapper = createElement('div')
        .setClass('title')
    const titleName = createElement('p')
        .setClass('item-stored-name')
        .setText(titleItemStoredText)
    const toolsWrapper = createElement('div')
        .setClass('tools-wrapper')
        .setCSSStyle([['display', showTools ? 'block' : 'none']])

    const descriptionWrapper = createElement('div')
        .setAttr('data-description-id', id)
        .setClass('description')
    const descriptionContent = createElement('div')
        .setText('To see the entire content, ')
    const goToDashboardAnchor = createElement('a')
        .setAttr('href', '#')
        .setClass(['link'])
        .setText('go to dashboard.')
        .addEvtListener('click', ({ currentTarget}) => {
            const mainWrapper = currentTarget.closest('.item-stored-wrapper')
            const goToDashboard = mainWrapper.querySelector('abbr[title*="Track"]')
            goToDashboard.click()
        })

    itemStoredWrapper.append(titleWrapper, descriptionWrapper)
    titleWrapper.append(titleName, toolsWrapper)
    descriptionWrapper.appendChild(descriptionContent)
    descriptionContent.appendChild(goToDashboardAnchor)
    
    return { 
        element: itemStoredWrapper,
        toolsWrapper: toolsWrapper
    }
}