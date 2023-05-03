import { Item } from '../utils/classes.js'
import { MainContentDBManager } from './db-manager.js'

export { insertNewItem, getItemById }

function insertNewItem(value) {
    return MainContentDBManager.put(new Item(value))
}

function getItemById(id) {
    return MainContentDBManager.get(id)
}