// ====== CONFIG ======
const BRAND_NAME = "LUNARA";
const DEFAULT_CURRENCY = "ARS";

// === Reemplazá por los reales ===
const WHATSAPP_NUMBER = "5491100000000";
const EMAIL_ADDRESS   = "hola@lunara.test";
const INSTAGRAM_URL   = "https://instagram.com/lunara.ar";
const PHONE_DISPLAY   = "+54 9 11 0000-0000";
// ===============================

// ====== UTIL ======
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const fmt = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: DEFAULT_CURRENCY, maximumFractionDigits: 0 }).format(n);

// ====== THEME ======
const root = document.documentElement;
$("#themeToggle")?.addEventListener("click", () => root.classList.toggle("dark"));

// ====== HEADER / CTA / FOOTER LINKS ======
$("#year").textContent = new Date().getFullYear();
const headerWordmark = $("#brandWordmark"); if (headerWordmark) headerWordmark.textContent = BRAND_NAME;

const wappBase = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const WAPP_MSG_PREFIX = `¡Hola! Quiero hacer un pedido en ${BRAND_NAME}:`;

$("#ctaPrincipal").href = wappBase("Hola, quiero comprar ahora 🙌");
$("#wappLink").href      = wappBase("Hola, me gustaría hacer una consulta ✨");
$("#wappFloat").href     = wappBase("Hola, ¿me ayudás con un pedido?");
$("#footerWapp").href    = wappBase("Hola, vengo desde el sitio 🌙");
$("#footerInsta").href   = INSTAGRAM_URL;
$("#footerMail").href    = `mailto:${EMAIL_ADDRESS}`;
$("#footerMail").textContent = EMAIL_ADDRESS;
$("#footerPhone").textContent = PHONE_DISPLAY;

// ====== DATA / RENDER ======
let PRODUCTS = [];
let filtered = [];
let cart = [];
let page = 1;
const PAGE_SIZE = 9;

async function loadProducts() {
  try {
    const res = await fetch("products.json");
    PRODUCTS = await res.json();
    initCategories(PRODUCTS);
    applyFilters(); // hará render con paginación
  } catch (e) {
    console.error("Error cargando products.json", e);
    $("#catalogGrid").innerHTML = "<p class='small'>No pudimos cargar el catálogo. Reintentá más tarde.</p>";
  }
}

function initCategories(list){
  const select = $("#categorySelect");
  const cats = ["all", ...new Set(list.map(p => p.category))];
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c === "all" ? "Todas las categorías" : c;
    select.appendChild(opt);
  });
}

function cardHTML(p){
  const statusText = p.availability === "inmediata" ? "Entrega inmediata" : "Por pedido";
  const firstImg = (p.images && p.images[0]) || p.image || "";
  return `
    <div class="card reveal">
      <div class="media" data-id="${p.id}" role="button" tabindex="0" aria-label="Ver fotos de ${p.name}"
           style="background-image:url('${firstImg}');background-size:cover;background-position:center;"></div>
      <div class="body">
        <div class="card-head">
          <h3 style="margin:0">${p.name}</h3>
          <span class="badge">${statusText}</span>
        </div>
        <p class="small">${p.category}</p>
        <p class="price">${fmt(p.price)}</p>
        ${p.offer ? `<p class="small"><strong>Oferta:</strong> ${p.offer}</p>` : ""}
        <p class="small">${p.description || ""}</p>
        <div class="actions">
          <button class="btn btn-sm" data-add="${p.id}" aria-label="Agregar ${p.name} al pedido">Agregar al pedido</button>
          <a class="btn btn-sm btn-secondary" href="${wappBase(`${WAPP_MSG_PREFIX} ${p.name} (${fmt(p.price)})`)}" target="_blank" rel="noopener">Consultar</a>
        </div>
      </div>
    </div>
  `;
}

function visibleList(){
  return filtered.slice(0, page * PAGE_SIZE);
}

function render(){
  $("#catalogGrid").innerHTML = visibleList().map(cardHTML).join("");
  setupReveal();
  // mostrar/ocultar botón "Mostrar más"
  const more = $("#loadMore");
  if (filtered.length > page * PAGE_SIZE) {
    more.style.display = "inline-flex";
  } else {
    more.style.display = "none";
  }
}

// ====== FILTERS & SORT ======
$("#searchInput").addEventListener("input", applyFilters);
$("#categorySelect").addEventListener("change", applyFilters);
$("#stockSelect").addEventListener("change", applyFilters);
$("#sortSelect").addEventListener("change", applyFilters);

function applyFilters(){
  page = 1;
  const q = $("#searchInput").value.toLowerCase().trim();
  const cat = $("#categorySelect").value;
  const stock = $("#stockSelect").value;
  const sort = $("#sortSelect").value;

  filtered = PRODUCTS.filter(p =>
    (cat === "all" || p.category === cat) &&
    (stock === "all" || p.availability === stock) &&
    (p.name.toLowerCase().includes(q) || (p.description||"").toLowerCase().includes(q))
  );

  if (sort === "priceAsc") filtered.sort((a,b)=>a.price-b.price);
  if (sort === "priceDesc") filtered.sort((a,b)=>b.price-a.price);

  render();
}

$("#loadMore").addEventListener("click", ()=>{ page += 1; render(); });

// ====== CART ======
document.addEventListener("click", (e)=>{
  const addId = e.target?.dataset?.add;
  if (addId){
    const item = PRODUCTS.find(p => String(p.id) === String(addId));
    if (item){ cart.push(item); updateCart(); }
  }
});

function updateCart(){
  $("#cartCount").textContent = String(cart.length);

  const ul = $("#cartList");
  ul.innerHTML = "";
  cart.forEach((it, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `${it.name} <button aria-label="Quitar">×</button>`;
    li.querySelector("button").addEventListener("click", ()=>{
      cart.splice(idx,1); updateCart();
    });
    ul.appendChild(li);
  });

  const total = cart.reduce((acc,it)=>acc+it.price,0);
  $("#cartTotal").textContent = fmt(total);
  const msg = `${WAPP_MSG_PREFIX}\n\n${cart.map(c=>`• ${c.name} - ${fmt(c.price)}`).join("\n")}\n\nTotal: ${fmt(total)}\n\n¿Me confirmás talle y color?`;
  $("#cartWhatsApp").href = wappBase(msg);

  if (cart.length > 0) openCartDrawer();
}

// ====== Drawer carrito (mobile) ======
const cartEl = document.querySelector(".cart");
const cartFab = document.getElementById("cartFab");
const cartClose = document.getElementById("cartClose");

function openCartDrawer(){
  if (window.matchMedia("(max-width: 560px)").matches) {
    cartEl.classList.add("open");
    document.body.classList.add("has-drawer");
    cartEl.setAttribute("aria-hidden", "false");
  }
}
function closeCartDrawer(){
  if (window.matchMedia("(max-width: 560px)").matches) {
    cartEl.classList.remove("open");
    document.body.classList.remove("has-drawer");
    cartEl.setAttribute("aria-hidden", "true");
  }
}
cartFab?.addEventListener("click", (e)=>{
  if (window.matchMedia("(max-width: 560px)").matches) {
    e.preventDefault();
    cartEl.classList.contains("open") ? closeCartDrawer() : openCartDrawer();
  }
});
cartClose?.addEventListener("click", (e)=>{ e.preventDefault(); closeCartDrawer(); });

// ====== FORM SUBMIT -> WhatsApp ======
$("#contactForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  const name = $("#name").value.trim();
  const email = $("#email").value.trim();
  const message = $("#message").value.trim();
  window.open(wappBase(`Hola! Soy ${name} (${email}). ${message}`), "_blank", "noopener");
});

// ====== GALERÍA MODAL ======
const modal = $("#galleryModal");
const modalImg = $("#modalImg");
const modalPrev = $("#modalPrev");
const modalNext = $("#modalNext");
const modalClose = $("#modalClose");
const modalDots = $("#modalDots");
let modalIndex = 0;
let modalImages = [];

function openModal(images, start=0){
  modalImages = images && images.length ? images : [];
  if (!modalImages.length) return;
  modalIndex = start;
  updateModal();
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
}
function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
}
function updateModal(){
  modalImg.src = modalImages[modalIndex];
  // dots
  modalDots.innerHTML = "";
  modalImages.forEach((_,i)=>{
    const b = document.createElement("button");
    if (i===modalIndex) b.classList.add("active");
    b.addEventListener("click",()=>{ modalIndex=i; updateModal(); });
    modalDots.appendChild(b);
  });
}
modalPrev.addEventListener("click", ()=>{ modalIndex = (modalIndex-1+modalImages.length)%modalImages.length; updateModal(); });
modalNext.addEventListener("click", ()=>{ modalIndex = (modalIndex+1)%modalImages.length; updateModal(); });
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e)=>{ if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e)=>{ if (e.key==="Escape" && modal.classList.contains("open")) closeModal(); });

// abrir desde card (click/enter en .media)
$("#catalogGrid").addEventListener("click",(e)=>{
  const el = e.target.closest(".media");
  if (!el) return;
  const id = el.dataset.id;
  const p = PRODUCTS.find(x=>String(x.id)===String(id));
  if (p && p.images && p.images.length) openModal(p.images, 0);
});
$("#catalogGrid").addEventListener("keydown",(e)=>{
  if ((e.key==="Enter" || e.key===" ") && e.target.classList.contains("media")){
    e.preventDefault();
    const id = e.target.dataset.id;
    const p = PRODUCTS.find(x=>String(x.id)===String(id));
    if (p && p.images && p.images.length) openModal(p.images, 0);
  }
});

// ====== Reveal on scroll (con fallback) ======
let io;
function setupReveal(){
  const cards = $$(".card.reveal");
  if (!cards.length) return;

  if (typeof IntersectionObserver === "undefined") {
    cards.forEach(c => c.classList.add("in-view"));
    return;
  }
  if (!io){
    io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if (entry.isIntersecting){
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
  }
  cards.forEach(c=> io.observe(c));
}

// Init
loadProducts();
