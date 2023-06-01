import { randomUUID } from './functions.js'

export { 
    Item,
    FavoriteItem,
    InitialPageTools
}

function Item(content) {
    this.id = randomUUID()
    this.createdAt = Date.now()
    this.content = content
    this.icon = {
        hasIcon: false,
        iconName: ''
    }
}

function FavoriteItem(id, addedAt) {
    this.id = id
    this.addedAt = addedAt
}

function InitialPageTools(description, iconName, dataTool) {
    this.description = description
    this.iconName = iconName
    this.dataTool = dataTool
}