const colorOptions = [
  { label: "女款长袖深海鸥灰", image: "./assets/colors/women-long-gray.webp", price: 452, originalPrice: 619 },
  { label: "女款长袖复古靛蓝", image: "./assets/colors/women-long-blue.webp", price: 452, originalPrice: 619 },
  { label: "女款长袖意大利紫", image: "./assets/colors/women-long-purple.webp", price: 452, originalPrice: 619 },
  { label: "男款长袖深海鸥灰", image: "./assets/colors/men-long-gray.webp", price: 452, originalPrice: 619 },
  { label: "男款长袖复古靛蓝", image: "./assets/colors/men-long-blue.webp", price: 452, originalPrice: 619 },
  { label: "男款长袖意大利紫", image: "./assets/colors/men-long-purple.webp", price: 452, originalPrice: 619 },
  { label: "女款短袖深海鸥灰", image: "./assets/colors/women-short-gray.webp", price: 385, originalPrice: 529 },
  { label: "女款短袖复古靛蓝", image: "./assets/colors/women-short-blue.webp", price: 385, originalPrice: 529 },
  { label: "女款短袖意大利紫", image: "./assets/colors/women-short-purple.webp", price: 385, originalPrice: 529 },
  { label: "男款短袖深海鸥灰", image: "./assets/colors/men-short-gray.webp", price: 385, originalPrice: 529 },
  { label: "男款短袖复古靛蓝", image: "./assets/colors/men-short-blue.webp", price: 385, originalPrice: 529 },
  { label: "男款短袖意大利紫", image: "./assets/colors/men-short-purple.webp", price: 385, originalPrice: 529 },
  { label: "POLO深海鸥灰", image: "./assets/colors/polo-gray.webp", price: 518, originalPrice: 709 },
  { label: "POLO复古靛蓝", image: "./assets/colors/polo-blue.webp", price: 518, originalPrice: 709 },
  { label: "POLO意大利紫", image: "./assets/colors/polo-purple.webp", price: 518, originalPrice: 709 }
];

const PRINT_FEE = 20;

const products = [
  {
    id: "crew",
    name: "OTW Merino Tee",
    fit: "圆领标准版",
    color: "深海鸥灰 / 复古靛蓝 / 意大利紫",
    material: "100% merino wool",
    price: 452,
    originalPrice: 619,
    source: "Zeal Wood OTW",
    image: "./assets/hero/otw-purple-model.jpg",
    colors: colorOptions,
    defaultColor: "女款长袖深海鸥灰",
    specs: ["17.5 微米", "150g", "耐磨, 透气", "S-XL"],
    description: "17.5 微米、150g 美丽诺羊毛，主打透气耐磨，适合日常、旅行和户外。"
  },
  {
    id: "boxy",
    name: "OTW Long Sleeve",
    fit: "女款长袖",
    color: "深海鸥灰",
    material: "100% merino wool",
    price: 452,
    originalPrice: 619,
    image: "./assets/hero/zealwood-forest-model.jpg",
    colors: colorOptions,
    defaultColor: "女款长袖深海鸥灰",
    specs: ["17.5 微米", "150g", "圆领", "常规袖", "L 可选"],
    description: "当前选中女款长袖深海鸥灰，羊毛 100%，透气耐磨，适合日常和户外。"
  }
];

const designerProducts = [];

const state = {
  selectedId: "crew",
  artworkUrl: "",
  color: "女款长袖深海鸥灰",
  colorImage: "./assets/colors/women-long-gray.webp",
  size: "M",
  placement: "左胸小图",
  notes: ""
};

const designerDraft = {
  artworkUrl: "",
  color: "女款长袖深海鸥灰",
  placement: "left"
};

const $ = (selector) => document.querySelector(selector);

function selectedProduct() {
  return [...designerProducts, ...products].find((product) => product.id === state.selectedId) || products[0];
}

function selectedColorOption() {
  const product = selectedProduct();
  return (product.colors || colorOptions).find((option) => option.label === state.color) || (product.colors || colorOptions)[0];
}

function currentPrice() {
  return selectedColorOption().price || selectedProduct().price;
}

function currentOriginalPrice() {
  return selectedColorOption().originalPrice || selectedProduct().originalPrice || 0;
}

function totalPrice() {
  return currentPrice() + PRINT_FEE;
}

function money(value) {
  return `¥${Number(value || 0).toFixed(0)}`;
}

function processArtworkFile(file) {
  return new Promise((resolve) => {
    const rawUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSide = 1200;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let index = 0; index < data.length; index += 4) {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = (r + g + b) / 3;
        const spread = Math.max(r, g, b) - Math.min(r, g, b);

        if (brightness > 242 && spread < 28) {
          data[index + 3] = 0;
        } else if (brightness > 226 && spread < 34) {
          data[index + 3] = Math.min(data[index + 3], Math.round((242 - brightness) * 14));
        }
      }

      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(rawUrl);
        resolve(URL.createObjectURL(blob));
      }, "image/png");
    };

    image.onerror = () => resolve(rawUrl);
    image.src = rawUrl;
  });
}

function placementLabel(value) {
  return {
    left: "左胸小图",
    front: "正面大图",
    back: "背面大图"
  }[value] || value;
}

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => el.classList.remove("show"), 1800);
}

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });
}

function renderProducts() {
  $("#productList").innerHTML = products
    .map((product) => productCard(product))
    .join("");
}

function productCard(product) {
  const selected = product.id === state.selectedId ? "selected" : "";
  const price = product.design ? product.design.price + PRINT_FEE : product.price;
  const originalPrice = product.design ? product.design.originalPrice : product.originalPrice;
  const designPrint = product.design
    ? `<img class="product-print placement-${product.design.placement}" src="${product.design.artworkUrl}" alt="定制图案">`
    : "";

  return `
    <button class="product ${selected}" type="button" data-product-id="${product.id}">
      <span class="product-visual">
        <img class="product-image" src="${product.image}" alt="${product.name}">
        ${designPrint}
      </span>
      <span class="product-copy">
        <span class="product-row">
          <strong>${product.name}</strong>
          <strong>${money(price)}</strong>
        </span>
        ${originalPrice ? `<span class="original-price">优惠前 ${money(originalPrice)}</span>` : ""}
        <p>${product.fit} · ${product.color}</p>
        <p>${product.description}</p>
        <span class="spec-row">${(product.specs || []).map((spec) => `<em>${spec}</em>`).join("")}</span>
      </span>
    </button>
  `;
}

function renderDesignerControls() {
  $("#designerColorInput").innerHTML = colorOptions
    .map((option) => `<option value="${option.label}" ${option.label === designerDraft.color ? "selected" : ""}>${option.label}</option>`)
    .join("");
  renderDesignerPreview();
}

function renderDesignerPreview() {
  const color = colorOptions.find((option) => option.label === designerDraft.color) || colorOptions[0];
  $("#designerBaseImage").src = color.image;
  $("#designerPrintImage").src = designerDraft.artworkUrl || "";
  $("#designerPrintImage").className = `mockup-print placement-${designerDraft.placement}`;
  $("#designerPrintImage").style.display = designerDraft.artworkUrl ? "block" : "none";
}

function renderDesignerProducts() {
  $("#designerProducts").innerHTML = designerProducts.length
    ? designerProducts.map((product) => productCard(product)).join("")
    : `<p class="empty-designer">上传图案后，会在这里生成可售产品。</p>`;
}

function renderCustomize() {
  const product = selectedProduct();
  const options = product.colors || colorOptions;
  if (!options.some((option) => option.label === state.color)) {
    state.color = product.defaultColor || options[0].label;
  }
  state.colorImage = selectedColorOption().image;

  $("#summaryFit").textContent = `${product.fit} · ${product.material}`;
  $("#summaryName").textContent = product.name;
  $("#summaryPrice").textContent = money(totalPrice());
  $("#summaryBreakdown").textContent = `商品 ${money(currentPrice())} + 印制费 ${money(PRINT_FEE)}`;
  document.querySelector(".summary").style.backgroundImage = `linear-gradient(90deg, rgba(23,23,23,.9), rgba(23,23,23,.7)), url(${state.colorImage})`;
  $("#colorInput").innerHTML = options
    .map((option) => `<option value="${option.label}" ${option.label === state.color ? "selected" : ""}>${option.label}</option>`)
    .join("");
  $("#placementInput").value = state.placement;
  renderArtworkUpload();
  renderColorPreview();
}

function renderArtworkUpload() {
  if (state.artworkUrl) {
    $("#artworkPreview").src = state.artworkUrl;
    $("#artworkPreview").style.display = "block";
    $("#uploadEmpty").style.display = "none";
  } else {
    $("#artworkPreview").removeAttribute("src");
    $("#artworkPreview").style.display = "none";
    $("#uploadEmpty").style.display = "block";
  }
}

function renderColorPreview() {
  const option = selectedColorOption();
  state.color = option.label;
  state.colorImage = option.image;
  $("#colorPreviewImage").src = option.image;
  renderCustomerMockup();
  $("#colorPreviewLabel").textContent = option.label;
  $("#colorPreviewPrice").textContent = currentOriginalPrice()
    ? `商品 ${money(option.price)} · 优惠前 ${money(currentOriginalPrice())}`
    : money(option.price);
  $("#summaryPrice").textContent = money(totalPrice());
  $("#summaryBreakdown").textContent = `商品 ${money(currentPrice())} + 印制费 ${money(PRINT_FEE)}`;
  document.querySelector(".summary").style.backgroundImage = `linear-gradient(90deg, rgba(23,23,23,.9), rgba(23,23,23,.7)), url(${option.image})`;
}

function renderCustomerMockup() {
  const print = $("#customerPrintImage");
  print.src = state.artworkUrl || "";
  print.className = `mockup-print placement-${placementKey(state.placement)}`;
  print.style.display = state.artworkUrl ? "block" : "none";
}

function placementKey(label) {
  return {
    "左胸小图": "left",
    "正面大图": "front",
    "背面大图": "back"
  }[label] || label || "left";
}

function renderOrder() {
  const product = selectedProduct();
  $("#orderProductImage").src = state.colorImage;
  $("#orderName").textContent = product.name;
  $("#orderMeta").textContent = `${state.size} · ${state.color} · ${state.placement}`;
  $("#orderPrice").textContent = money(totalPrice());
  $("#orderNotes").textContent = state.notes || "无备注";
  $("#itemAmount").textContent = money(currentPrice());
  $("#printAmount").textContent = money(PRINT_FEE);
  $("#payAmount").textContent = money(totalPrice());
}

$("#productList").addEventListener("click", (event) => {
  selectProductFromCard(event);
});

$("#designerProducts").addEventListener("click", (event) => {
  selectProductFromCard(event);
});

function selectProductFromCard(event) {
  const productButton = event.target.closest("[data-product-id]");
  if (!productButton) return;

  state.selectedId = productButton.dataset.productId;
  const product = selectedProduct();
  state.color = product.defaultColor || (product.colors || colorOptions)[0].label;
  state.colorImage = selectedColorOption().image;
  state.placement = product.design ? placementLabel(product.design.placement) : state.placement;
  state.artworkUrl = product.design ? product.design.artworkUrl : state.artworkUrl;
  renderProducts();
  renderDesignerProducts();
}

$("#startButton").addEventListener("click", () => {
  renderCustomize();
  showScreen("customize");
});

$("#artworkInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (state.artworkUrl) URL.revokeObjectURL(state.artworkUrl);
  state.artworkUrl = await processArtworkFile(file);
  $("#artworkPreview").src = state.artworkUrl;
  $("#artworkPreview").style.display = "block";
  $("#uploadEmpty").style.display = "none";
  renderCustomerMockup();
});

$("#designerArtworkInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (designerDraft.artworkUrl) URL.revokeObjectURL(designerDraft.artworkUrl);
  designerDraft.artworkUrl = await processArtworkFile(file);
  $("#designerArtworkThumb").src = designerDraft.artworkUrl;
  $("#designerArtworkThumb").style.display = "block";
  $("#designerUploadEmpty").style.display = "none";
  renderDesignerPreview();
});

$("#designerColorInput").addEventListener("change", (event) => {
  designerDraft.color = event.target.value;
  renderDesignerPreview();
});

$("#designerPlacementInput").addEventListener("change", (event) => {
  designerDraft.placement = event.target.value;
  renderDesignerPreview();
});

$("#createDesignerProduct").addEventListener("click", () => {
  if (!designerDraft.artworkUrl) {
    toast("请先上传图案");
    return;
  }

  const color = colorOptions.find((option) => option.label === designerDraft.color) || colorOptions[0];
  const productNumber = designerProducts.length + 1;
  const product = {
    id: `designer-${Date.now()}`,
    name: `设计师款 #${productNumber}`,
    fit: "图案定制款",
    color: color.label,
    material: "100% merino wool",
    price: color.price,
    originalPrice: color.originalPrice,
    image: color.image,
    colors: colorOptions,
    defaultColor: color.label,
    specs: [placementLabel(designerDraft.placement), "可售产品", "含印制费"],
    description: "由上传图案生成的设计师定制商品，可直接选择并下单。",
    design: {
      artworkUrl: designerDraft.artworkUrl,
      placement: designerDraft.placement,
      price: color.price,
      originalPrice: color.originalPrice
    }
  };

  designerProducts.unshift(product);
  state.selectedId = product.id;
  state.color = color.label;
  state.colorImage = color.image;
  state.artworkUrl = designerDraft.artworkUrl;
  state.placement = placementLabel(designerDraft.placement);
  renderDesignerProducts();
  renderProducts();
  toast("已生成可售产品");
});

$("#colorInput").addEventListener("change", (event) => {
  state.color = event.target.value;
  renderColorPreview();
});

$("#placementInput").addEventListener("change", (event) => {
  state.placement = event.target.value;
  renderCustomerMockup();
});

$("#confirmButton").addEventListener("click", () => {
  if (!state.artworkUrl) {
    toast("请先上传图案");
    return;
  }

  state.size = $("#sizeInput").value;
  state.color = $("#colorInput").value;
  state.colorImage = selectedColorOption().image;
  state.placement = $("#placementInput").value;
  state.notes = $("#notesInput").value.trim();
  renderOrder();
  showScreen("order");
});

$("#payButton").addEventListener("click", () => {
  const missing = [$("#buyerName"), $("#phone"), $("#address")].some((input) => !input.value.trim());
  if (missing) {
    toast("请补全收货信息");
    return;
  }

  toast("演示付款成功，订单已提交");
  window.setTimeout(() => showScreen("shop"), 900);
});

$("#applyEdits").addEventListener("click", () => {
  const brand = $("#brandEditor").value.trim() || "Woolmark Tee";
  products[0].price = Number($("#crewPriceEditor").value || products[0].price);
  products[1].price = Number($("#boxyPriceEditor").value || products[1].price);
  document.title = `${brand} 定制演示`;
  document.querySelector(".topbar span").textContent = brand;
  renderProducts();
  renderCustomize();
  toast("已应用修改");
});

renderProducts();
renderDesignerControls();
renderDesignerProducts();
