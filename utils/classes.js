import { randomUUID } from './functions.js'

export { Item }

function Item(content) {
    this.id = randomUUID()
    this.createAt = Date.now()
    this.content = content
}