const products = [
  {
    id: 1,
    name: "Brasa Bacon",
    cat: "burgers",
    price: 38.9,
    img: "assets/images/burger-bacon.png",
    desc: "Blend de 160g, cheddar inglês, bacon crocante, cebola caramelizada e maionese da casa.",
  },
  {
    id: 2,
    name: "Burger de Costela",
    cat: "burgers",
    price: 42.9,
    img: "assets/images/burger-costela.png",
    desc: "Costela bovina desfiada, queijo prato, picles artesanal e barbecue defumado.",
  },
  {
    id: 3,
    name: "X-Bacon da Brasa",
    cat: "burgers",
    price: 32.9,
    img: "assets/images/x-bacon.png",
    desc: "Smash de 120g, muito bacon, queijo cremoso e molho especial.",
  },
  {
    id: 4,
    name: "Brasa Salad",
    cat: "burgers",
    price: 31.9,
    img: "assets/images/brasa-salad.png",
    desc: "Smash, queijo, alface americana, tomate tostado e maionese cítrica.",
  },
  {
    id: 5,
    name: "Batata Brasa",
    cat: "acompanhamentos",
    price: 24.9,
    img: "assets/images/batata-brasa.png",
    desc: "Batatas crocantes, cheddar cremoso, bacon e páprica defumada.",
  },
  {
    id: 6,
    name: "Onion Rings",
    cat: "acompanhamentos",
    price: 18.9,
    img: "assets/images/onion-rings.png",
    desc: "Anéis de cebola empanados e molho barbecue da casa.",
  },
  {
    id: 7,
    name: "Coca-Cola Zero",
    cat: "bebidas",
    price: 8.9,
    img: "assets/images/cola-zero.png",
    desc: "Lata gelada 350ml.",
  },
  {
    id: 8,
    name: "Brownie da Brasa",
    cat: "sobremesas",
    price: 19.9,
    img: "assets/images/brownie-brasa.png",
    desc: "Brownie intenso, caramelo salgado e sorvete de baunilha.",
  },
];
let cart = JSON.parse(localStorage.getItem("brasa-cart") || "[]"),
  coupon = false,
  selected = null,
  qty = 1,
  step = 1,
  delivery = "entrega",
  shippingFee = 0;
const money = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
function renderProducts(filter = "todos") {
  document
    .querySelectorAll(".filter button")
    .forEach((x) => x.classList.toggle("active", x.dataset.filter === filter));
  document.getElementById("productGrid").innerHTML = products
    .filter((p) => filter === "todos" || p.cat === filter)
    .map(
      (p) =>
        `<article class="product"><img src="${p.img}" alt="${p.name}"><div class="product-info"><small>${p.cat}</small><h3>${p.name}</h3><p>${p.desc}</p><div class="price-row"><b>${money(p.price)}</b><button class="add" onclick="openProduct(${p.id})">+</button></div></div></article>`,
    )
    .join("");
}
function categories() {
  let c = [
    ["🍔", "Burgers", "burgers"],
    ["🍟", "Acompanhamentos", "acompanhamentos"],
    ["🥤", "Bebidas", "bebidas"],
    ["🍫", "Sobremesas", "sobremesas"],
  ];
  document.getElementById("categories").innerHTML = c
    .map(
      (x) =>
        `<button class="category" onclick="filterTo('${x[2]}')"><span>${x[0]}</span><b>${x[1]}</b></button>`,
    )
    .join("");
}
function filterTo(f) {
  renderProducts(f);
  document.getElementById("cardapio").scrollIntoView({ behavior: "smooth" });
}
document.querySelector(".filter").addEventListener("click", (e) => {
  if (e.target.dataset.filter) renderProducts(e.target.dataset.filter);
});
function openProduct(id) {
  selected = products.find((p) => p.id === id);
  qty = 1;
  document.getElementById("modalImage").src = selected.img;
  document.getElementById("modalImage").alt = selected.name;
  document.getElementById("modalName").textContent = selected.name;
  document.getElementById("modalCat").textContent = selected.cat;
  document.getElementById("modalDescription").textContent = selected.desc;
  document
    .querySelectorAll(".addon,.remove")
    .forEach((e) => (e.checked = false));
  document.getElementById("note").value = "";
  updateModal();
  openModal("productModal");
}
function changeQty(n) {
  qty = Math.max(1, qty + n);
  updateModal();
}
function updateModal() {
  let add = [...document.querySelectorAll(".addon:checked")].reduce(
    (a, x) => a + Number(x.value),
    0,
  );
  document.getElementById("qty").textContent = qty;
  document.getElementById("modalPrice").textContent = money(
    (selected.price + add) * qty,
  );
}
document.addEventListener("change", (e) => {
  if (e.target.classList.contains("addon")) updateModal();
});
function addFromModal() {
  let addons = [...document.querySelectorAll(".addon:checked")].map((x) => ({
      name: x.dataset.name,
      price: +x.value,
    })),
    removes = [...document.querySelectorAll(".remove:checked")].map(
      (x) => x.dataset.name,
    );
  cart.push({
    key: Date.now(),
    ...selected,
    qty,
    addons,
    removes,
    note: document.getElementById("note").value,
  });
  save();
  closeOverlays();
  toggleCart();
}
function addCombo() {
  cart.push({
    key: Date.now(),
    name: "Combo Brasa em dobro",
    price: 89.9,
    qty: 1,
    img: "assets/images/hero-brasa.png",
    addons: [],
    removes: [],
  });
  save();
  toggleCart();
}
function removeItem(key) {
  cart = cart.filter((x) => x.key !== key);
  save();
}
function save() {
  localStorage.setItem("brasa-cart", JSON.stringify(cart));
  renderCart();
}
function renderCart() {
  let subtotal = cart.reduce(
      (s, x) =>
        s + (x.price + x.addons.reduce((a, z) => a + z.price, 0)) * x.qty,
      0,
    ),
    disc = coupon ? subtotal * 0.15 : 0,
    total = subtotal - disc + shippingFee;
  document.getElementById("cartItems").innerHTML = cart
    .map(
      (x) =>
        `<div class="cart-item"><img src="${x.img}" alt=""><div><b>${x.name}</b><small>${x.qty}x ${x.addons.map((a) => a.name).join(", ") || ""}</small><small>${money((x.price + x.addons.reduce((a, z) => a + z.price, 0)) * x.qty)}</small></div><button onclick="removeItem(${x.key})">×</button></div>`,
    )
    .join("");
  document.getElementById("cartEmpty").hidden = cart.length > 0;
  document.getElementById("subtotal").textContent = money(subtotal);
  document.getElementById("discountRow").hidden = !coupon;
  document.getElementById("discount").textContent = "− " + money(disc);
  document.getElementById("shipping").textContent = shippingFee
    ? money(shippingFee)
    : "A calcular";
  document.getElementById("total").textContent = money(total);
  document.getElementById("mobileTotal").textContent = money(total);
  document.getElementById("cartCount").textContent = cart.reduce(
    (s, x) => s + x.qty,
    0,
  );
  document.getElementById("mobileCount").textContent = cart.reduce(
    (s, x) => s + x.qty,
    0,
  );
}
function applyCoupon() {
  let el = document.getElementById("coupon");
  if (el.value.trim().toUpperCase() === "BRASA15") {
    coupon = true;
    el.value = "BRASA15 aplicado ✓";
  } else alert("Cupom inválido. Tente BRASA15.");
  renderCart();
}
function toggleCart() {
  document.getElementById("cartPanel").classList.toggle("show");
  document.getElementById("backdrop").classList.toggle("show");
}
function openModal(id) {
  document.getElementById(id).classList.add("show");
}
function closeOverlays() {
  document
    .querySelectorAll(".modal")
    .forEach((m) => m.classList.remove("show"));
  document.getElementById("cartPanel").classList.remove("show");
  document.getElementById("backdrop").classList.remove("show");
}
function startCheckout() {
  if (!cart.length) {
    alert("Adicione algo à sua sacola primeiro.");
    return;
  }
  closeOverlays();
  step = 1;
  renderCheckout();
  openModal("checkoutModal");
}
function renderCheckout() {
  let content = document.getElementById("checkoutContent"),
    steps = document.querySelectorAll(".steps span");
  steps.forEach((x, i) => x.classList.toggle("active", i === step - 1));
  let html = "";
  if (step === 1)
    html = `<h2>Prazer em servir.</h2><label>Seu nome</label><input placeholder="Como devemos te chamar?"><label>WhatsApp</label><input placeholder="(11) 99999-9999"><button class="primary" onclick="nextStep()">Continuar →</button>`;
  if (step === 2)
    html = `<h2>Como a Brasa vai até você?</h2><label class="choice"><input type="radio" name="way" checked onchange="delivery='entrega';updateShipping()"> Entrega no endereço</label><label class="choice"><input type="radio" name="way" onchange="delivery='retirada';updateShipping()"> Retirar grátis no balcão</label><label>Seu bairro</label><select id="neighborhood" onchange="updateShipping()"><option value="6.9">Centro — R$ 6,90</option><option value="8.9">Jardins — R$ 8,90</option><option value="5.9">Vila Nova — R$ 5,90</option></select><button class="primary" onclick="nextStep()">Continuar →</button>`;
  if (step === 3)
    html = `<h2>Pagamento na entrega.</h2><label class="choice"><input type="radio" name="pay" checked> Pix</label><label class="choice"><input type="radio" name="pay"> Cartão de crédito</label><label class="choice"><input type="radio" name="pay"> Cartão de débito</label><label class="choice"><input type="radio" name="pay"> Dinheiro</label><button class="primary" onclick="nextStep()">Revisar pedido →</button>`;
  if (step === 4)
    html = `<h2>Quase na brasa.</h2><p style="color:var(--muted);font-size:13px">${cart.map((x) => `${x.qty}× ${x.name}`).join("<br>")}<br><br>${delivery === "retirada" ? "Retirada grátis na Rua das Brasas, 147." : "Entrega no bairro selecionado."}<br><br><b>Total: ${document.getElementById("total").textContent}</b></p><button class="primary" onclick="confirmOrder()">Confirmar pedido →</button>`;
  content.innerHTML = html;
}
function nextStep() {
  step++;
  renderCheckout();
}
function updateShipping() {
  shippingFee =
    delivery === "retirada"
      ? 0
      : +document.getElementById("neighborhood").value;
  renderCart();
}
function confirmOrder() {
  cart = [];
  shippingFee = 0;
  save();
  document.getElementById("checkoutContent").innerHTML =
    `<p class="eyebrow">PEDIDO CONFIRMADO</p><h2>A chama já está acesa. 🔥</h2><p style="color:var(--muted);line-height:1.6">Seu pedido <b>#BR-1048</b> foi recebido e em breve será confirmado. Tempo estimado: 35–50 min.</p><button class="primary" onclick="closeOverlays();openTracking()">Acompanhar pedido →</button>`;
  document.querySelector(".steps").style.display = "none";
}
function openTracking() {
  closeOverlays();
  openModal("trackingModal");
}
function showTracking() {
  document.getElementById("orderStatus").hidden = false;
}
function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "brasa-theme",
    document.body.classList.contains("light") ? "light" : "dark",
  );
}
if (localStorage.getItem("brasa-theme") === "light")
  document.body.classList.add("light");
categories();
renderProducts();
renderCart();
