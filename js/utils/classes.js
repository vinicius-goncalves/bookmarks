import { randomUUID } from './functions.js'

export { 
    Item,
    FavoriteItem
}

function Item(content) {
    this.id = randomUUID()
    this.createdAt = Date.now()
    this.content = content
}

function FavoriteItem(id, addedAt) {
    this.id = id
    this.addedAt = addedAt
}