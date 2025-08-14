/* ========= (12 productos) ========= */
/* Reemplazá las rutas por tus archivos en /img/catalogo/ */
const PRODUCTS = [
  { id:1, name:"Conjunto Luna", category:"Conjuntos", price:18990, stock:"inmediata",
    images:["img/catalogo/lenceria2.jpeg"],
    desc:"Suave y cómodo. Talles S–XL. Colores: negro, lila, nude." },
  { id:2, name:"Conjunto Brisa", category:"Conjuntos", price:20990, stock:"pedido",
    images:["img/catalogo/lenceria3.jpeg"],
    desc:"Soporte medio. Talles S–XL. Colores: celeste, coral, blanco." },
  { id:3, name:"Top Nube", category:"Tops", price:9990, stock:"inmediata",
    images:["img/catalogo/lenceria4.jpeg"],
    desc:"Top básico para todos los días. Talles S–L." },
  { id:4, name:"Conjunto Aurora", category:"Conjuntos", price:22990, stock:"pedido",
    images:["img/catalogo/lenceria5.jpeg"],
    desc:"Encaje suave, muy cómodo. Talles S–XL." },
  { id:5, name:"Top Brillante", category:"Tops", price:11990, stock:"inmediata",
    images:["img/catalogo/lenceria6.jpeg"],
    desc:"Top con soporte ligero. Talles S–L." },
  { id:6, name:"Conjunto Cielo", category:"Conjuntos", price:19990, stock:"pedido",
    images:["img/catalogo/lenceria7.jpeg"],
    desc:"Cómodo y liviano. Talles S–XL." },
  { id:7, name:"Conjunto Duna", category:"Conjuntos", price:21990, stock:"inmediata",
    images:["img/catalogo/lenceria8.jpeg"],
    desc:"Textura suave. Talles S–XL." },
  { id:8, name:"Top Coral", category:"Tops", price:8990, stock:"inmediata",
    images:["img/catalogo/lenceria9.jpeg"],
    desc:"Ligero y fresco. Talles S–L." },
  { id:9, name:"Conjunto Selene", category:"Conjuntos", price:23990, stock:"pedido",
    images:["img/catalogo/lenceria10.jpeg"],
    desc:"Encaje premium. Talles S–XL." },
  { id:10, name:"Top Mar", category:"Tops", price:10990, stock:"inmediata",
    images:["img/catalogo/lenceria11.jpeg"],
    desc:"Confort diario. Talles S–L." },
  { id:11, name:"Conjunto Estela", category:"Conjuntos", price:25990, stock:"pedido",
    images:["img/catalogo/lenceria12.jpeg"],
    desc:"Linea premium. Talles S–XL." },
  { id:12, name:"Conjunto Nórdico", category:"Conjuntos", price:18990, stock:"inmediata",
    images:["img/catalogo/lenceria13.jpeg"],
    desc:"Suave al tacto. Talles S–XL." },
];

/* ========= Estado y helpers ========= */
const $ = (s,ctx=document)=>ctx.querySelector(s);
const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));

let filtered = [...PRODUCTS];
let shown = 0;
const PAGE = 9; // 9 por tanda

const cart = [];
const currency = n => `$ ${n.toLocaleString('es-AR')}`;

/* ========= Render catálogo ========= */
const grid = $("#catalogGrid");
const searchInput = $("#searchInput");
const catSelect = $("#categorySelect");
const stockSelect = $("#stockSelect");
const sortSelect = $("#sortSelect");
const loadMoreBtn = $("#loadMore");

function fillFilters(){
  const cats = [...new Set(PRODUCTS.map(p => p.category))];
  cats.forEach(c=>{
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    catSelect.appendChild(opt);
  });
}

function applyFilters(){
  const q = (searchInput.value||"").toLowerCase();
  const cat = catSelect.value;
  const stk = stockSelect.value;
  const sort = sortSelect.value;

  filtered = PRODUCTS.filter(p=>{
    const qok = !q || p.name.toLowerCase().includes(q);
    const cok = cat==="all" || p.category===cat;
    const sok = stk==="all" || p.stock===stk;
    return qok && cok && sok;
  });

  if(sort==="priceAsc") filtered.sort((a,b)=>a.price-b.price);
  if(sort==="priceDesc") filtered.sort((a,b)=>b.price-a.price);

  shown = 0;
  grid.innerHTML = "";
  revealMore();
}

function cardTemplate(p){
  const badge = p.stock==="inmediata" ? "Entrega inmediata" : "Por pedido";
  return `
  <article class="card reveal" tabindex="-1">
    <img class="media" src="${p.images[0]}" alt="${p.name}" data-id="${p.id}" />
    <div class="body">
      <div class="card-head">
        <h3>${p.name}</h3>
        <span class="badge">${badge}</span>
      </div>
      <p class="small">${p.category}</p>
      <p class="price">${currency(p.price)}</p>
      <p class="small">${p.desc}</p>
      <div class="actions">
        <button class="btn btn-outline" data-add="${p.id}">Agregar al pedido</button>
        <button class="btn btn-secondary" data-consulta="${p.id}">Consultar</button>
      </div>
    </div>
  </article>`;
}

function revealMore(){
  const slice = filtered.slice(shown, shown+PAGE);
  slice.forEach(p=>{
    grid.insertAdjacentHTML("beforeend", cardTemplate(p));
  });
  shown += slice.length;

  requestAnimationFrame(()=>{
    $$(".card.reveal", grid).forEach(el=>el.classList.add("in-view"));
  });

  loadMoreBtn.style.display = shown < filtered.length ? "inline-block" : "none";
}

/* ========= Carrito ========= */
const cartList = $("#cartList");
const cartTotal = $("#cartTotal");
const cartBtn = $("#cartWhatsApp");
const cartFab = $("#cartFab");
const cartBox = $(".cart");
const cartClose = $("#cartClose");
const cartCount = $("#cartCount");

function refreshCartUI(){
  cartList.innerHTML = "";
  let total = 0;
  cart.forEach(item=>{
    total += item.price;
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} — ${currency(item.price)}
      <button data-remove="${item.id}">×</button>
    `;
    cartList.appendChild(li);
  });
  cartTotal.textContent = currency(total);
  cartCount.textContent = cart.length;

  const lines = cart.map(i=>`• ${i.name} — ${currency(i.price)}`).join("%0A");
  const text = `Hola! Quiero finalizar mi pedido:%0A${lines}%0ATotal: ${currency(total)}`;
  cartBtn.href = `https://wa.me/5491100000000?text=${text}`;
  $("#wappLink").href = `https://wa.me/5491100000000?text=Hola!%20Quiero%20hacer%20una%20consulta%20🙂`;
  $("#wappFloat").href = $("#wappLink").href;
  $("#emailLink").href = `mailto:hola@lunara.test?subject=Consulta%20GEMA&body=${decodeURIComponent(text)}`;
}

function openCartDrawer(){
  if(window.matchMedia("(max-width:560px)").matches){
    cartBox.classList.add("open");
    document.body.classList.add("has-drawer");
  }
}
function closeCartDrawer(){
  cartBox.classList.remove("open");
  document.body.classList.remove("has-drawer");
}

/* ========= Modal galería (simple con 1 img) ========= */
const modal = $("#galleryModal");
const modalImg = $("#modalImg");
const modalClose = $("#modalClose");
const modalPrev = $("#modalPrev");
const modalNext = $("#modalNext");
const modalDots = $("#modalDots");
let currentIndex = 0;
let currentImages = [];

function openModal(images, idx=0){
  currentImages = images;
  currentIndex = idx;
  if(modalImg) modalImg.src = currentImages[currentIndex];
  if(modal) modal.classList.add("open");
}
function closeModal(){ if(modal) modal.classList.remove("open"); }
function prevImg(){ if(!currentImages.length) return; currentIndex = (currentIndex - 1 + currentImages.length)%currentImages.length; if(modalImg) modalImg.src = currentImages[currentIndex]; }
function nextImg(){ if(!currentImages.length) return; currentIndex = (currentIndex + 1)%currentImages.length; if(modalImg) modalImg.src = currentImages[currentIndex]; }

/* ========= Back-to-top / bottom ========= */
const toTop = $("#toTop");
const toTopIcon = $("#toTopIcon");

function updateTopButton(){
  const nearTop = window.scrollY < 80;
  if(nearTop){
    toTop.setAttribute("aria-label","Ir abajo");
    toTop.dataset.mode = "down";
    toTopIcon.innerHTML = `<path d="M12 5v14m0 0-6-6m6 6 6-6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  }else{
    toTop.setAttribute("aria-label","Volver arriba");
    toTop.dataset.mode = "up";
    toTopIcon.innerHTML = `<path d="M12 19V5m0 0-6 6m6-6 6 6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
}

toTop.addEventListener("click", (e)=>{
  e.preventDefault();
  if(toTop.dataset.mode === "down"){
    window.scrollTo({ top: document.body.scrollHeight, behavior:"smooth" });
  }else{
    window.scrollTo({ top: 0, behavior:"smooth" });
  }
});

/* ========= Tema ========= */
$("#themeToggle").addEventListener("click", ()=>{
  document.documentElement.classList.toggle("dark");
});

/* ========= Listeners ========= */
document.addEventListener("click", (e)=>{
  const addId = e.target.closest("[data-add]")?.dataset.add;
  if(addId){
    const prod = PRODUCTS.find(p=>p.id===Number(addId));
    cart.push(prod);
    refreshCartUI();
    openCartDrawer();
  }

  const remId = e.target.closest("[data-remove]")?.dataset.remove;
  if(remId){
    const i = cart.findIndex(p=>p.id===Number(remId));
    if(i>-1){ cart.splice(i,1); refreshCartUI(); }
  }

  const img = e.target.closest(".media[data-id]");
  if(img){
    const id = Number(img.dataset.id);
    const prod = PRODUCTS.find(p=>p.id===id);
    if(prod?.images?.length) openModal(prod.images, 0);
  }

  if(e.target===modal || e.target===modalClose) closeModal();
  if(e.target===modalPrev) prevImg();
  if(e.target===modalNext) nextImg();
});

["input","change"].forEach(ev=>{
  searchInput.addEventListener(ev, applyFilters);
  catSelect.addEventListener(ev, applyFilters);
  stockSelect.addEventListener(ev, applyFilters);
  sortSelect.addEventListener(ev, applyFilters);
});
loadMoreBtn.addEventListener("click", revealMore);

cartFab.addEventListener("click",(e)=>{
  e.preventDefault();
  openCartDrawer();
});
$("#cartClose").addEventListener("click", closeCartDrawer);
window.addEventListener("scroll", updateTopButton);

/* ========= Init ========= */
function init(){
  const y = new Date().getFullYear();
  const yNode = document.getElementById("year");
  if(yNode) yNode.textContent = y;

  fillFilters();
  applyFilters();
  refreshCartUI();
  updateTopButton();
}
document.addEventListener("DOMContentLoaded", init);
