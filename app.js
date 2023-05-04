import { insertNewItem, getItemById } from './database/db-manager.js'
import { loadStoredItemsIntoDOM } from './database/dom-manipulation.js'

const btnInsert = document.querySelector('[data-button="insert"]')
const btnSearch = document.querySelector('[data-button="search"]')

const inputContentManipulator = document.querySelector('[data-input="content-manipulator"]')

function removeOutlineOnKeyUp() {
    window.addEventListener('keyup', () => {
        const elementsWithOutline = document.querySelectorAll('.add-outline')
        elementsWithOutline.forEach(element => element.classList.remove('add-outline'))
    })
}

function applyOutlineOnKeyDown(selector) {

    const element = document.querySelector(selector)
    if(!element.matches(selector)) {
        return
    }

    element.classList.add('add-outline')
}

function loadKeyboardShortcuts() {

    const searchAction = (event) => event.ctrlKey && event.altKey && event.key == 'Enter'
    const insertAction = (event) => event.ctrlKey && event.key == 'Enter'

    window.addEventListener('keydown', (event) => {
      
        const isSearchAction = searchAction(event)
        const isInsertAction = insertAction(event)

        if(isSearchAction) {
            
            applyOutlineOnKeyDown('[data-button="search"]')
            btnSearch.click()

            return
        }

        if(isInsertAction) {

            applyOutlineOnKeyDown('[data-button="insert"]')
            btnInsert.click()

            return
        }
    })
}

window.addEventListener('DOMContentLoaded', () => {
    
    btnInsert.addEventListener('click', () => {
        insertNewItem(inputContentManipulator.value).then(res => console.log(res))
    })

    btnSearch.addEventListener('click', () => {
        getItemById(inputContentManipulator.value).then(res => console.log(res))
    })

    loadKeyboardShortcuts()
    removeOutlineOnKeyUp()
    loadStoredItemsIntoDOM()
})