import { hasElementRendered } from '../../utils/functions.js'
export { loadAdvancedFilterFunctions }

const mainContent = document.querySelector('main.content')
const childrenFromMainContent = mainContent.children
const advancedSearchSection = document.querySelector('section[data-section="advanced_search"]')

async function loadItemsFromMainContent() {

    const map = (arr, callback) => Array.prototype.map.call(arr, callback)
    const clonedNodes = map(childrenFromMainContent, (node) => node.cloneNode(true))
   
    clonedNodes.forEach(clonedNode => {
        if(hasElementRendered(advancedSearchSection, clonedNode)) {
            return
        }
        advancedSearchSection.appendChild(clonedNode)
    })
}

function loadAdvancedFilterFunctions() {
    loadItemsFromMainContent()
}