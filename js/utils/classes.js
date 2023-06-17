import { randomUUID } from './functions.js'

export { 
    Item,
    FavoriteItem,
    Tool,
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

function Tool(description, iconName, dataTool) {
    this.description = description
    this.iconName = iconName
    this.dataTool = dataTool
}

function InitialPageTools(description, iconName, dataTool) {
    this.description = description
    this.iconName = iconName
    this.dataTool = dataTool
}