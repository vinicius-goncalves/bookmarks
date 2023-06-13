import { InitialPageTools } from '../utils/classes.js'
import { genericStoredObjectRender } from '../utils/renders.js'
import { MainContentDBManager } from '../database/db-manager.js'
import { startQuery, createURLFilter } from '../database/custom-query.js'
import { getDashboardElements } from '../dashboard/main.js'

export { loadStoredElements }

const mainContent = document.querySelector('main.content')

async function createToolFromIconName(GoogleMaterialIconsName, toolDescription, dataTool) {

    const toolFromIcon = createIconElement().getIcon(GoogleMaterialIconsName)
    
    const abbr = createElement('abbr')
    abbr.setAttrs([
        ['title', toolDescription ], 
        ['data-tool', dataTool]
    ]).appendElements(toolFromIcon)

    return abbr
}

// async function updateStoredObjectIcon(id, newIcon) {
//     console.log(id, newIcon)
// }

const toolsFunctions = {
    expandDetails(elementID) {
        
        const selector = `[data-description-id="${elementID}"]`
        const descriptionElement = mainContent.querySelector(selector)

        if(!descriptionElement) {
            return
        }

        const inlineStyle = descriptionElement.style
        const heightLength = window.parseInt(inlineStyle.height.replace('px', ''))
        
        if(!heightLength) {
            inlineStyle.height = `${descriptionElement.scrollHeight}px`
            return
        }

        inlineStyle.height = '0px'

    },
    async sendToDashboard(elementID) {

        const storedObjectFound = await startQuery(createURLFilter({ id: elementID }))
    
        if(!storedObjectFound) {
            return
        }

        const advancedSearchSection = document.querySelector('[data-section="advanced_search"]')
        const dashboardWrapper = document.querySelector('.dashboard-wrapper')

        const allRenderedElements = [...advancedSearchSection.children].slice(1)
        const [ storedObject ] = storedObjectFound, { ['id']: storedObjectID } = storedObject

        const handleWithElementsVisibleCallback = el => el.getAttribute('data-id') == storedObjectID 
            ? el.style.display = 'flex'
            : el.style.display = 'none'
        allRenderedElements.forEach(handleWithElementsVisibleCallback)

        dashboardWrapper.removeAttribute('style')

    },
    
    async openEmojisMenu(id, x, y) {

        const DEFAULT_LINK = `js/database/available-icons.json`
        const response = await fetch(DEFAULT_LINK)
        const availableIcons = await response.json()
    
        const tempIconWrapperCSSStyle = [
            ['left', x + 'px'],
            ['top', y + 'px'],
            ['position', 'absolute']
        ]

        const tempIconWrapper = createElement('div')
            .setClass('temp-icons-menu')
            .setCSSStyle(tempIconWrapperCSSStyle)
            .addEvtListener('mouseleave', () => tempIconWrapper.remove())
            .appendOn(getDocumentBody())
    
        const createTools = (icon) => {
            
            const newIcon = createIconElement().getIcon(icon)
            newIcon.addEventListener('click', () =>  updateStoredObjectIcon(id, icon))
    
            tempIconWrapper.appendChild(newIcon)
        }
    
        availableIcons.forEach(createTools)
    }
}

async function loadStoredElements() {
    
    const storedItems = await MainContentDBManager.getAll()

    const fragment = document.createDocumentFragment()
    const renderStoredObjectsCallback = storedItems.map(item => genericStoredObjectRender(item))
    const genericStoredObjectsRendered = await Promise.all(renderStoredObjectsCallback)

    const toolsSettings = [
        new InitialPageTools('expand_more', 'Click to expand the task', 'expand-details'),
        new InitialPageTools('north_east', 'Track down this task on dashboard', 'go-to-dashboard'),
        new InitialPageTools('emoji_emotions', 'Change task emoji', 'change-emoji')
    ]

    const toolsEvents = [
        {
            toolName: 'expand-details',
            startListenerTo: function(expandDetailsTool, element) {

                const event = () => {
                    const elementID = element.getAttribute('data-id')
                    void toolsFunctions.expandDetails(elementID)
                }

                expandDetailsTool.addEventListener('click', event)
            }
        },
        {
            toolName: 'go-to-dashboard',
            startListenerTo: function(goToDashboardTool, element) {
                
                const event = () => {
                    const elementID = element.getAttribute('data-id')
                    void toolsFunctions.sendToDashboard(elementID)
                }

                goToDashboardTool.addEventListener('click', event)
            }
        },
        {
            toolName: 'change-emoji',
            startListenerTo: function(changeEmojiTool, element) {
                
                const event = (event) => {
                    const elementID = element.getAttribute('data-id')
                    void toolsFunctions.openEmojisMenu(elementID, event.pageX, event.pageY)
                }

                changeEmojiTool.addEventListener('click', event)
            }
        }
    ]

    const renderedObjectsModified = genericStoredObjectsRendered.map(async (currElement) => {

        const { element, toolsWrapper } = currElement

        const createToolsFunc = async (settings) => {

            const { dataTool } = settings
            const toolCreated = await createToolFromIconName(...Object.values(settings))

            const { startListenerTo } = toolsEvents.find(({ toolName }) => toolName == dataTool)
            startListenerTo(toolCreated, element)

            return toolCreated
        }

        const toolsCreated = await Promise.all(toolsSettings.map(createToolsFunc))
        toolsCreated.forEach((tool) => toolsWrapper.appendChild(tool))

        const toolsWrapperEvents = [
            [ 'mouseenter', () => toolsWrapper.style.display = 'block' ],
            [ 'mouseleave', () => toolsWrapper.style.display = 'none' ]
        ]

        toolsWrapperEvents.forEach(([ evtName, evtListener ]) => element.addEventListener(evtName, evtListener))

        return element
    })

    const modifiedElementsResolved = await Promise.all(renderedObjectsModified)
    modifiedElementsResolved.forEach(item => fragment.appendChild(item))
    mainContent.appendChild(fragment)
}