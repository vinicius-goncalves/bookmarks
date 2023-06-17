import { loadStoredElements } from './elements-loader.js'
import { insertNewItem, getItemById } from '../database/db-manager.js'

const btnInsert = document.querySelector('[data-button="insert"]')
const btnSearch = document.querySelector('[data-button="search"]')

const inputContentManipulator = document.querySelector('[data-input="content-manipulator"]')
const openDashboardBtn = document.querySelector('[data-button="open-dashboard"]')

openDashboardBtn.addEventListener('click', () => {
    
    const target = openDashboardBtn.getAttribute('data-target')
    const targetFound = document.querySelector(target)

    if(!targetFound) {
        return
    }
    
    targetFound.removeAttribute('style')
})

function keyUpOutlineRemoverListener() {

    window.addEventListener('keyup', () => {
        const elementsWithOutline = document.querySelectorAll('.active-outline')
        elementsWithOutline.forEach(element => element.classList.remove('active-outline'))
    })
}

function applyOutlineOnKeyDown(selector) {

    const element = document.querySelector(selector)

    if(!element.matches(selector)) {
        return
    }

    element.classList.add('active-outline')
}

function loadKeyboardShortcuts() {

    const searchAction = (event) => event.ctrlKey && event.shiftKey && event.key == 'Enter'
    const insertAction = (event) => event.ctrlKey && event.key == 'Enter'

    const keyboardActions = {
        insert() {
            applyOutlineOnKeyDown('[data-button="insert"]')
            btnInsert.click()
            return
        },
        search() {
            applyOutlineOnKeyDown('[data-button="search"]')
            btnSearch.click()
            return
        }
    }

    window.addEventListener('keydown', (event) => {
      
        const isSearchAction = searchAction(event)
        const isInsertAction = insertAction(event)

        if(isSearchAction) {
            keyboardActions.search()
            return
        }

        if(isInsertAction) {
            keyboardActions.insert()
            return
        }
    })
}

function loadBtnListeners() {

    btnInsert.addEventListener('click', () => {

        if(inputContentManipulator.value.length == 0) {
            return
        }
        
        insertNewItem(inputContentManipulator.value)
    })
    
    btnSearch.addEventListener('click', () => {
        getItemById(inputContentManipulator.value)
    })
}

window.addEventListener('DOMContentLoaded', () => {
    
    loadBtnListeners()
    loadKeyboardShortcuts()
    keyUpOutlineRemoverListener()
    loadStoredElements()
})