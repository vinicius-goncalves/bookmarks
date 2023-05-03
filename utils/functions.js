export {
    createIconElement,
    randomUUID
}

function createIconElement(GoogleMaterialIconsName, outlined = true) {
    const span = document.createElement('span')
    span.classList.add(outlined ? 'material-icons-outlined' : 'material-icons')
    span.textContent = GoogleMaterialIconsName
    return span
}

function randomUUID() {
    let dateTime = Date.now()
    const uuid = 'xxxxxxxx-4xxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const random = (dateTime + Math.random() * 16) % 16 | 0
        dateTime = dateTime / 16
        return (char === 'x' ? random : random & 0x3 | 0x8).toString(16)
    })
    return uuid
}