/* ========= (12 productos) ========= */
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
/* MOSTRAR 3 AL INICIO */
const PAGE = 3;

const cart = [];
const currency = n => `$ ${n.toLocaleString('es-AR')}`;

/* ========= Render catálogo ========= */
const grid = $("#catalogGrid");
const searchInput = $("#searchInput");
const catSelect = $("#categorySelect");
const stockSelect = $("#stockSelect");
const sortSelect = $("#sortSelect");
const loadMoreBtn = $("#loadMore");
const showLessBtn = $("#showLess"); // Ver menos

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

  shown = Math.min(PAGE, filtered.length);
  renderFromStart();
}

/* ======= Card con SLIDER de 3 fotos mínimo ======= */
function sliderHTML(images, prodId, prodName){
  const imgs = images && images.length ? images.slice(0,3) : [];
  while (imgs.length < 3 && images && images.length) imgs.push(images[0]);
  if (!imgs.length) imgs.push('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width=\'800\' height=\'600\'><rect width=\'100%\' height=\'100%\' fill=\'%23f2f3f5\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%239aa1ab\' font-family=\'Arial\' font-size=\'22\'>Sin imagen</text></svg>');

  const dots = imgs.map((_,i)=>`<span class="dot${i===0?' active':''}" data-dot="${i}" data-slider-id="${prodId}"></span>`).join('');
  const slides = imgs.map(src=>`<img class="slide-img" loading="lazy" src="${src}" alt="${prodName}" data-id="${prodId}" />`).join('');

  return `
    <div class="media-slider" data-slider-id="${prodId}" data-index="0">
      <div class="slides">${slides}</div>
      <button class="nav-btn prev" type="button" aria-label="Anterior" data-prev data-slider-id="${prodId}">‹</button>
      <button class="nav-btn next" type="button" aria-label="Siguiente" data-next data-slider-id="${prodId}">›</button>
      <div class="dot-wrap">${dots}</div>
    </div>
  `;
}

function cardTemplate(p){
  const badge = p.stock==="inmediata" ? "Entrega inmediata" : "Por pedido";
  return `
  <article class="card reveal" tabindex="-1">
    ${sliderHTML(p.images, p.id, p.name)}
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

/* ===== Render helpers ===== */
function renderFromStart(){
  grid.innerHTML = '';
  const toShow = filtered.slice(0, shown);
  toShow.forEach(p => grid.insertAdjacentHTML("beforeend", cardTemplate(p)));

  requestAnimationFrame(()=> $$(".card.reveal", grid).forEach(el=>el.classList.add("in-view")));

  loadMoreBtn.style.display = shown < filtered.length ? "inline-block" : "none";
  showLessBtn.style.display = shown > PAGE ? "inline-block" : "none";
}

function revealMore(){
  shown = Math.min(filtered.length, shown + PAGE);
  renderFromStart();
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

  // ===== Actualizar también el modal del carrito =====
  if (cartModalList && cartModalTotal && cartModalWapp){
    cartModalList.innerHTML = "";
    cart.forEach(item=>{
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${item.name}</span>
        <span class="mono">${currency(item.price)}</span>
        <button class="remove" data-remove="${item.id}" aria-label="Quitar">×</button>
      `;
      cartModalList.appendChild(li);
    });
    cartModalTotal.textContent = currency(total);
    cartModalWapp.href = cartBtn.href;
  }
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

/* ========= Modal galería ========= */
const modal = $("#galleryModal");
const modalImg = $("#modalImg");
const modalClose = $("#modalClose");
const modalPrev = $("#modalPrev");
const modalNext = $("#modalNext");
let currentIndex = 0;
let currentImages = [];

function openModal(images, idx=0){
  currentImages = images || [];
  currentIndex = idx;
  if(modalImg && currentImages.length) modalImg.src = currentImages[currentIndex];
  if(modal) modal.classList.add("open");
}
function closeModal(){ if(modal) modal.classList.remove("open"); }
function prevImg(){ if(!currentImages.length) return; currentIndex = (currentIndex - 1 + currentImages.length)%currentImages.length; if(modalImg) modalImg.src = currentImages[currentIndex]; }
function nextImg(){ if(!currentImages.length) return; currentIndex = (currentIndex + 1)%currentImages.length; if(modalImg) modalImg.src = currentImages[currentIndex]; }

/* ========= Back-to-top ========= */
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

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.nav'); // <- tu <nav class="nav">

menuToggle?.addEventListener('click', () => {
  siteNav?.classList.toggle('active');
});


/* ========= Ocultar header al hacer scroll ========= */
let lastY = window.scrollY;
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > lastY && y > 60) header.classList.add('hide');
  else header.classList.remove('hide');
  lastY = y;
}, {passive:true});

/* ========= Tema ========= */
$("#themeToggle").addEventListener("click", ()=>{
  document.documentElement.classList.toggle("dark");
});

/* ========= ==== MODAL DEL CARRITO ==== ========= */
const cartModal = $("#cartModal");
const cartModalClose = $("#cartModalClose");
const cartModalList = $("#cartModalList");
const cartModalTotal = $("#cartModalTotal");
const cartModalWapp = $("#cartModalWapp");

function openCartModal(){
  if(!cartModal) return;
  cartModal.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCartModal(){
  if(!cartModal) return;
  cartModal.classList.remove("open");
  document.body.style.overflow = "";
}



/* ========= Listeners ========= */
document.addEventListener("click", (e)=>{
  // Agregar al pedido (cards del catálogo)
  const addId = e.target.closest("[data-add]")?.dataset.add;
  if(addId){
    const prod = PRODUCTS.find(p=>p.id===Number(addId));
    cart.push(prod);
    refreshCartUI();
    openCartDrawer();
  }

  // Agregar al pedido (botón del HERO)
  const heroBtn = e.target.closest(".add-to-cart-sample");
  if(heroBtn){
    const name = heroBtn.dataset.name || "Conjunto";
    const price = Number(heroBtn.dataset.price || 0);
    cart.push({ id: Date.now(), name, price });
    refreshCartUI();
    openCartDrawer();
  }

  // Consultar (WhatsApp prellenado)
  const consultId = e.target.closest("[data-consulta]")?.dataset.consulta;
  if(consultId){
    const prod = PRODUCTS.find(p=>p.id===Number(consultId));
    const msg = `Hola! Quiero consultar por *${prod.name}*.%0A¿Hay talles y colores disponibles?`;
    const url = `https://wa.me/5491100000000?text=${msg}`;
    window.open(url, "_blank", "noopener");
  }

  // Eliminar item del carrito (desde lista o modal)
  const remId = e.target.closest("[data-remove]")?.dataset.remove;
  if(remId){
    const i = cart.findIndex(p=>p.id===Number(remId));
    if(i>-1){ cart.splice(i,1); refreshCartUI(); }
  }

  // Modal de imágenes
  const slideImg = e.target.closest(".slide-img");
  if(slideImg){
    const id = Number(slideImg.dataset.id);
    const prod = PRODUCTS.find(p=>p.id===id);
    if(prod?.images?.length) openModal(prod.images, 0);
  }

  if(e.target===modal || e.target===modalClose) closeModal();
  if(e.target===modalPrev) prevImg();
  if(e.target===modalNext) nextImg();

  // Controles del slider
  const prevBtn = e.target.closest("[data-prev]");
  const nextBtn = e.target.closest("[data-next]");
  const dot = e.target.closest(".dot[data-dot]");
  if(prevBtn || nextBtn || dot){
    const sliderId = (prevBtn||nextBtn||dot).dataset.sliderId || (dot ? dot.dataset.sliderId : null);
    const slider = document.querySelector(`.media-slider[data-slider-id="${sliderId}"]`);
    if(!slider) return;
    const slides = slider.querySelector('.slides');
    const dots = [...slider.querySelectorAll('.dot')];
    let idx = Number(slider.dataset.index || 0);
    const total = dots.length;

    if(prevBtn) idx = (idx - 1 + total) % total;
    if(nextBtn) idx = (idx + 1) % total;
    if(dot) idx = Number(dot.dataset.dot);

    slider.dataset.index = idx;
    slides.style.transform = `translateX(-${idx*100}%)`;
    dots.forEach((d,i)=>d.classList.toggle('active', i===idx));
  }
});

// swipe móvil para slider
let touchStartX = null;
grid.addEventListener('touchstart', (e)=>{
  const slider = e.target.closest('.media-slider');
  if(!slider) return;
  touchStartX = e.touches[0].clientX;
},{passive:true});
grid.addEventListener('touchend', (e)=>{
  const slider = e.target.closest('.media-slider');
  if(!slider || touchStartX===null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  const dots = slider.querySelectorAll('.dot');
  const slides = slider.querySelector('.slides');
  let idx = Number(slider.dataset.index || 0);
  const total = dots.length;
  if (dx < -40) idx = (idx+1) % total;
  if (dx >  40) idx = (idx-1+total) % total;
  slider.dataset.index = idx;
  slides.style.transform = `translateX(-${idx*100}%)`;
  dots.forEach((d,i)=>d.classList.toggle('active', i===idx));
},{passive:true});

/* Filtros */
["input","change"].forEach(ev=>{
  searchInput.addEventListener(ev, applyFilters);
  catSelect.addEventListener(ev, applyFilters);
  stockSelect.addEventListener(ev, applyFilters);
  sortSelect.addEventListener(ev, applyFilters);
});
loadMoreBtn.addEventListener("click", revealMore);
showLessBtn.addEventListener("click", ()=>{
  shown = Math.max(PAGE, shown - PAGE);
  renderFromStart();
});

/* === FAB CARRITO -> abre modal resumen === */
cartFab.addEventListener("click",(e)=>{
  e.preventDefault();
  refreshCartUI(); // asegura datos actualizados
  openCartModal();
});
cartModalClose?.addEventListener("click", closeCartModal);
cartModal?.addEventListener("click", (e)=>{
  if(e.target === cartModal) closeCartModal(); // clic en fondo
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



