// Variáveis
const productForm = document.getElementById("productForm")
const productName = document.getElementById("product-name")
const productQuantity = document.getElementById("product-quantity")
const productPrice = document.getElementById("product-price")
const totalPrice = document.getElementById("total-price")
const totalQuantity = document.getElementById("total-quantity")
const totalParcel = document.getElementById("total-parcel")
const totalParcels = document.getElementById("total-parcels")
const productParcels = document.getElementById("product-parcels")
const installButton = document.getElementById("btn-install")

// Eventos
document.addEventListener("DOMContentLoaded", () => {
    loadProductsFromLocalStorage()
    numberReplace(productQuantity)
    numberReplacewithDot(productPrice)

    productForm.addEventListener("submit", (event) => {
        event.preventDefault()
        if (removeSpaces(productName.value) === "" || removeSpaces(productQuantity.value) === "" || removeSpaces(productPrice.value) === "") {
            messageError("Preencha todos os campos")
            if(Notification.permission === "granted") {
                sendNotification('Erro', 'Preencha todos os campos')
            }
        } else {
            const product = {
                id: randomUniqueId(),
                name: productName.value,
                quantity: parseInt(removeSpaces(productQuantity.value), 10),
                price: parseFloat(removeSpaces(productPrice.value.replace(",", "."))),
            }
            messageSuccess("Cadastrado com sucesso")
            if(Notification.permission === "granted") {
                sendNotification('Sucesso', 'Cadastrado com sucesso')
            }
            addProduct(product)
            saveProductToLocalStorage(product)
            updateTotals()
            productForm.reset()
        }
    })   

    productParcels.addEventListener("change", updateTotals)

    Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
          console.log('Notification permission granted.')
        } else {
          console.log('Unable to get permission to notify.')
        }
    })
})

// Funções de CRUD
function addProduct(object) {
    const tbody = document.getElementById("productList")
    const tr = `
        <tr id="${object.id}">
            <td>${object.name}</td>
            <td>${object.quantity}</td>
            <td>R$ ${object.price.toFixed(2).replace(".", ",")}</td>
            <td>R$ ${(object.quantity * object.price).toFixed(2).replace(".", ",")}</td>
            <td>
                <span class="fa fa-pencil faicon-span" onclick="editProduct('${object.id}')">
                </span>
                <span class="fa fa-trash faicon-span" onclick="deleteProduct('${object.id}')">
                </span>
            </td>
        </tr>
    `
    tbody.innerHTML += tr
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem("products")) || []
    const product = products.find(product => product.id === id)

    if (product) {
        Swal.fire({
            title: 'Editar Produto',
            html: `
                <div class="form-group" style="margin-bottom: .4rem">
                    <label for="edit-name"><span class="text-emphasis">Nome</span></label>
                    <input type="text" id="edit-name" class="" placeholder="Nome" value="${product.name}">
                </div>
                <div class="form-group" style="margin-bottom: .4rem">
                    <label for="edit-quantity"><span class="text-emphasis">Quantidade</span></label>
                    <input type="text" id="edit-quantity" class="" placeholder="Quantidade" value="${product.quantity}">
                </div>
                <div class="form-group" style="margin-bottom: .4rem">
                    <label for="edit-price"><span class="text-emphasis">Preço</span></label>
                    <input type="text" id="edit-price" class="" placeholder="Preço" value="${product.price.toString().replace(".", ",")}">
                </div>
            `,
            showCancelButton: true,
            cancelButtonColor: '#fd1a1a',
            confirmButtonColor: '#00ac00',
            confirmButtonText: 'Salvar',
            preConfirm: () => {
                return {
                    name: document.getElementById('edit-name').value,
                    quantity: parseInt(document.getElementById('edit-quantity').value, 10),
                    price: parseFloat(document.getElementById('edit-price').value.replace(",", "."))
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const updatedProduct = result.value
                updatedProduct.id = id // Preserve the original ID
                updateProductInLocalStorage(updatedProduct)
                updateProductInTable(updatedProduct)
                updateTotals()
                messageSuccess("Produto atualizado com sucesso")
                if(Notification.permission === "granted") {
                    sendNotification('Sucesso', 'Produto atualizado com sucesso')
                }
            }
        })
    }
}

function updateProductInTable(product) {
    const tr = document.getElementById(product.id)
    if (tr) {
        tr.innerHTML = `
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>R$ ${product.price.toFixed(2).replace(".", ",")}</td>
            <td>R$ ${(product.quantity * product.price).toFixed(2).replace(".", ",")}</td>
            <td>
                <span class="fa fa-pencil faicon-span" onclick="editProduct('${product.id}')">
                </span>
                <span class="fa fa-trash faicon-span" onclick="deleteProduct('${product.id}')">
                </span>
            </td>
        `
    }
}

function deleteProduct(id) {
    const tr = document.getElementById(id)
    if (tr) {
        tr.remove()
        deleteProductFromLocalStorage(id)
        updateTotals()
        messageSuccess("Excluído com sucesso")
        if(Notification.permission === "granted") {
            sendNotification('Sucesso', 'Excluído com sucesso')
        }
    }
}

// Funções para Local Storage
function loadProductsFromLocalStorage() {
    const products = JSON.parse(localStorage.getItem("products")) || []
    products.forEach(product => {
        product.price = parseFloat(product.price)
        addProduct(product)
    })
    updateTotals()
}

function saveProductToLocalStorage(product) {
    const products = JSON.parse(localStorage.getItem("products")) || []
    products.push(product)
    localStorage.setItem("products", JSON.stringify(products))
}

function updateProductInLocalStorage(updatedProduct) {
    let products = JSON.parse(localStorage.getItem("products")) || []
    products = products.map(product => product.id === updatedProduct.id ? updatedProduct : product)
    localStorage.setItem("products", JSON.stringify(products))
}

function deleteProductFromLocalStorage(id) {
    const products = JSON.parse(localStorage.getItem("products")) || []
    const updatedProducts = products.filter(product => product.id !== id)
    localStorage.setItem("products", JSON.stringify(updatedProducts))
}

// Funções de Mensagem (SweetAlert2 e Notifications)
function messageError(text) {
    Swal.fire({
        title: 'Erro',
        text: text,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f44336'
    })
}

function messageSuccess(text) {
    Swal.fire({
        title: 'Sucesso',
        text: text,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#4CAF50'
    })
}

function sendNotification(title, message) {
    navigator.serviceWorker.ready.then(function(registration) {
      registration.showNotification(`${title}`, {
        body: message,
        icon: '../assets/img/icon144.png',
      })
    })
  }
  
// Funções de Manipulação de Strings
function removeSpaces(string) {
    return string.replace(/\s/g, '')
}

function randomUniqueId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function numberReplace(num) {
    num.addEventListener("input", function (event) {
        let value = event.target.value
        value = value.replace(/[^0-9/?]/g, "")
        event.target.value = value
    })
}

function numberReplacewithDot(num) {
    num.addEventListener("input", function (event) {
        let value = event.target.value
        value = value.replace(/[^0-9.,]/g, "")
        event.target.value = value
    })
}

// Função para Atualizar Totais
function updateTotals() {
    const products = JSON.parse(localStorage.getItem("products")) || []
    let totalP = 0
    let totalQ = 0
    products.forEach(product => {
        totalP += product.quantity * parseFloat(product.price)
        totalQ += Number(product.quantity)
    })
    totalPrice.textContent = totalP.toFixed(2).replace(".", ",")
    totalQuantity.textContent = totalQ

    const parcels = Number(productParcels.value)
    if (parcels > 1) {
        totalParcel.textContent = (totalP / parcels).toFixed(2).replace(".", ",")
        totalParcels.textContent = parcels
    } else {
        totalParcel.textContent = totalP.toFixed(2).replace(".", ",")
        totalParcels.textContent = 1
    }
}
