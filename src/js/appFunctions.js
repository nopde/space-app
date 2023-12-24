const createSpaceFolderFn = async () => {
    await window.versions.createSpaceFolder()
}

createSpaceFolderFn()

const codeFn = async (name) => {
    await window.versions.code(name)
}

const folderFn = async (name) => {
    await window.versions.folder(name)
}

const removeSpaceFn = async (card) => {
    const name = card.id
    card.remove()
    await window.versions.removeSpace(name)
}

const getFoldersFn = async () => {
    try {
        const folders = await window.versions.getFolders()
        return folders
    }
    catch (error) {
        console.error(error)
        throw error
    }
}

const createSpaceCard = (space) => {
    const spaceList = document.querySelector(".space-list")
    const spaceCard = document.createElement("div")
    spaceCard.classList.add("space-card")
    spaceCard.id = space

    const spaceCardBody = document.createElement("div")
    spaceCardBody.classList.add("space-card-body")

    const nameParagraph = document.createElement("p")
    nameParagraph.textContent = space

    const spaceCardBodyText = document.createElement("div")
    spaceCardBodyText.classList.add("space-card-body-text")

    const codeParagraph = document.createElement("p")
    codeParagraph.textContent = "Code ->"
    codeParagraph.style.color = "#60a5fa"
    codeParagraph.style.textShadow = "0 0 5px #60a5fa"

    spaceCardBody.appendChild(nameParagraph)
    spaceCardBody.appendChild(spaceCardBodyText)

    spaceCardBodyText.appendChild(codeParagraph)

    const spaceCardButtons = document.createElement("div")
    spaceCardButtons.classList.add("space-card-buttons")

    const deleteButton = document.createElement("button")
    deleteButton.classList.add("btn", "red")
    deleteButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
          class="bi bi-trash" viewBox="0 0 16 16">
          <path
              d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
          <path
              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
      </svg>`

    const openFolderButton = document.createElement("button")
    openFolderButton.classList.add("btn", "yellow")
    openFolderButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
          class="bi bi-folder" viewBox="0 0 16 16">
          <path
              d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4H2.19zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707z" />
      </svg>`

    spaceCardButtons.appendChild(deleteButton)
    spaceCardButtons.appendChild(openFolderButton)

    spaceCard.appendChild(spaceCardBody)
    spaceCard.appendChild(spaceCardButtons)

    spaceList.appendChild(spaceCard)

    return spaceCard
}

function createDialog(dialogId, titleText, body = "", submitButtonText = "Confirm") {
    const dialog = document.createElement("dialog")
    dialog.id = dialogId
    const form = document.createElement("form")
    form.classList.add("prompt")
    form.method = "dialog"
    const title = document.createElement("p")
    title.innerHTML = titleText
    const bodyDiv = document.createElement("div")
    bodyDiv.innerHTML = body
    const menu = document.createElement("menu")
    const submitButton = document.createElement("button")
    submitButton.classList.add("btn", "green")
    submitButton.style.flexGrow = "1"
    submitButton.textContent = submitButtonText
    submitButton.id = `${dialogId} confirm-button`
    const cancelButton = document.createElement("button")
    cancelButton.classList.add("btn")
    cancelButton.style.flexGrow = "1"
    cancelButton.textContent = "Cancel"
    cancelButton.id = `${dialogId} cancel-button`

    dialog.appendChild(form)
    form.appendChild(title)
    form.appendChild(bodyDiv)
    form.appendChild(menu)
    menu.appendChild(submitButton)
    menu.appendChild(cancelButton)

    document.body.appendChild(dialog)

    return dialog
}

const renderSpaces = async () => {
    try {
        const spaces = await window.versions.getFolders()

        for (const space of spaces) {
            const card = createSpaceCard(space)

            card.addEventListener("click", (event) => {
                codeFn(card.id)
            })
            const deleteButton = card.querySelector(":scope > div > button.btn.red")
            const folderButton = card.querySelector(":scope > div > button.btn.yellow")
            deleteButton.addEventListener("click", (event) => {
                newCard = createDialog("delete-space-dialog", `Delete <b>${card.id}</b>`)
                newCard.showModal()
                const confirmButton = document.getElementById("delete-space-dialog confirm-button")
                confirmButton.addEventListener("click", (event) => {
                    removeSpaceFn(card)
                    newCard.remove()
                })
                const cancelButton = document.getElementById("delete-space-dialog cancel-button")
                cancelButton.addEventListener("click", (event) => {
                    newCard.remove()
                })
                event.stopPropagation()
            })
            folderButton.addEventListener("click", (event) => {
                folderFn(card.id)
                event.stopPropagation()
            })
        }
    } catch (error) {
        console.error(error)
    }
}

function updateSpaces() {
    const spaceList = document.querySelector(".space-list")

    spaceList.innerHTML = ""

    renderSpaces()
}

updateSpaces()

const newSpaceFn = async (name) => {
    try {
        const success = await window.versions.newSpace(name)
        if (success) {
            updateSpaces()
        }
    } catch (error) {
        console.error("Error creating space:", error)
    }
}

const newSpaceButton = document.getElementById("new-space")

newSpaceDialogBody = `
    <div class="prompt-input-container">
        <input placeholder="Name" type="text" id="new-space-dialog new-space-input" class="prompt-input" spellcheck="false" autocomplete="off">
    </div>
`

newSpaceDialog = createDialog("new-space-dialog", "New space", newSpaceDialogBody)

newSpaceButton.addEventListener("click", (event) => {
    newSpaceDialog.showModal()
    newSpaceDialogNameInput.value = ""
})

const newSpaceDialogConfirmButton = document.getElementById("new-space-dialog confirm-button")
const newSpaceDialogNameInput = document.getElementById("new-space-dialog new-space-input")

newSpaceDialogConfirmButton.addEventListener("click", (event) => {
    newSpaceFn(newSpaceDialogNameInput.value)
})

const quitButton = document.getElementById("quit")
const minimizeButton = document.getElementById("minimize")

quitButton.addEventListener("click", async () => {
    await window.versions.quit()
})

minimizeButton.addEventListener("click", async () => {
    await window.versions.minimize()
})

/*
    *-----------------*
    *   SEARCH BARS   *
    *-----------------*
*/

/**
 * Search bar function.
 * 
 * @param {*} event - The triggered event.
 * @param {*} itemList - The list of items.
 * @param {*} itemNames - The list of item names.
 */
function search(event, itemList, itemNames) {
    try {
        const searchValue = event.target.value.trim().toLowerCase()
        const searchWords = searchValue.split(" ").filter(word => word !== "")

        itemNames.forEach((item, index) => {
            const itemText = item.toLowerCase()
            const result = itemList[index]

            let match = true

            searchWords.forEach(word => {
                if (!itemText.includes(word)) {
                    match = false
                }
            })

            if (match) {
                result.style.display = "flex"
            } else {
                result.style.display = "none"
            }
        })
    } catch (error) {
        console.error(error)
    }
}

const spaceSearchBar = document.getElementById("space-search")
const spaceContainer = document.getElementById("space-list")
let spaceList = []
let spaceCardNames = []

function getSpaces() {
    spaceList.splice(0, spaceList.length)
    spaceList = Array.from(spaceContainer.querySelectorAll(".space-card"))

    spaceCardNames.splice(0, spaceCardNames.length)
    spaceList.forEach(spaceCard => {
        spaceCardNames.push(spaceCard.id)
    })
}

spaceSearchBar.addEventListener("input", event => {
    getSpaces()
    search(event, spaceList, spaceCardNames)
})

const spaceFolderButton = document.getElementById("space-folder-button")

spaceFolderButton.addEventListener("click", (event) => {
    folderFn(".")
})