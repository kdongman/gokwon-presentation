export type GokwonPageLanguage = "en" | "cn" | "ja" | "ru" | "es";

export type PageTranslation = {
  heroTitle: string;
  addressLabel: string;
  addressPlaceholder: string;
  notice1: string;
  notice2: string;
  checkoutBtn: string;
  successTitle: string;
  successSub: string;
  brandEyebrow: string;
  localPickBadge: string;
  addToOrder: string;
  addedToOrder: string;
  estimatedTotal: string;
  quantityLabel: string;
  loadingMenus: string;
  emptyCategory: string;
  reviewsSuffix: string;
  selectOptionError: string;
  emptyCartError: string;
  loadFallbackNotice: string;
  backToHome: string;
  orderNumber: string;
  subtotal: string;
  serviceFee: string;
  totalPaid: string;
  statusLabel: string;
  orderNotFound: string;
  loadFailed: string;
  foodSelection: string;
  productOptions: string;
  categories: {
    all: string;
    chicken: string;
    tteokbokki: string;
    pizza: string;
    noodles: string;
    jokbal: string;
    side: string;
    dessert: string;
  };
};

export const GOKWON_LANGUAGE_OPTIONS: Array<{
  code: GokwonPageLanguage;
  label: string;
}> = [
  { code: "en", label: "English" },
  { code: "cn", label: "简体中文" },
  { code: "ja", label: "日本語" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
];

export const pageTranslations: Record<GokwonPageLanguage, PageTranslation> = {
  en: {
    heroTitle: "Locally Recommended by Real Koreans",
    addressLabel: "Delivery address",
    addressPlaceholder: "Enter Delivery Address (Hotel / Spot)",
    notice1:
      "GoKwon analyzes your delivery location and places your order from the highest-rated, verified local restaurants nearby.",
    notice2:
      "Delivery may not be available in every area. We will contact you by email if your location is outside our service zone.",
    checkoutBtn: "Continue to Checkout",
    successTitle: "Order Completed Successfully!",
    successSub:
      "Your concierge is on it. Check your email for delivery updates.",
    brandEyebrow: "GoKwon",
    localPickBadge: "K-Local Pick",
    addToOrder: "Add to order",
    addedToOrder: "Added to order",
    estimatedTotal: "Estimated total",
    quantityLabel: "Quantity",
    loadingMenus: "Loading menus...",
    emptyCategory: "No menus in this category yet.",
    reviewsSuffix: "reviews",
    selectOptionError: "Please select an option before adding to your order.",
    emptyCartError: "Please add at least one item to your order.",
    loadFallbackNotice:
      "Could not load menus from admin. Showing default menu.",
    backToHome: "Back to Home",
    orderNumber: "Order #",
    subtotal: "Subtotal",
    serviceFee: "Service Fee",
    totalPaid: "Total Paid",
    statusLabel: "Status",
    orderNotFound: "Order not found.",
    loadFailed: "Could not load receipt.",
    foodSelection: "Food",
    productOptions: "Option",
    categories: {
      all: "All",
      chicken: "Chicken",
      tteokbokki: "Tteokbokki",
      pizza: "Pizza",
      noodles: "Noodles",
      jokbal: "BBQ",
      side: "Side Menu",
      dessert: "Dessert",
    },
  },
  cn: {
    heroTitle: "韩国本地人亲自推荐的顶流美味",
    addressLabel: "送餐地址",
    addressPlaceholder: "请输入送餐地址 (酒店名称 / 汉江公园出入口)",
    notice1:
      "GoKwon 将分析您的配送位置，为您在附近评分最高、经过验证的本地餐厅下单。",
    notice2:
      "部分区域可能无法配送。如果您的位置超出服务区，我们将通过电子邮件与您联系。",
    checkoutBtn: "继续结账",
    successTitle: "订单提交成功！",
    successSub: "您的专属助手已收到订单。请检查您的电子邮箱以获取配送状态更新。",
    brandEyebrow: "GoKwon",
    localPickBadge: "本地人推荐",
    addToOrder: "加入订单",
    addedToOrder: "已加入订单",
    estimatedTotal: "预估总计",
    quantityLabel: "数量",
    loadingMenus: "菜单加载中...",
    emptyCategory: "该分类暂无菜单。",
    reviewsSuffix: "条评价",
    selectOptionError: "请先选择选项再加入订单。",
    emptyCartError: "请至少添加一个商品到订单。",
    loadFallbackNotice: "无法从管理后台加载菜单，正在显示默认菜单。",
    backToHome: "返回首页",
    orderNumber: "订单 #",
    subtotal: "小计",
    serviceFee: "服务费",
    totalPaid: "实付金额",
    statusLabel: "状态",
    orderNotFound: "未找到订单。",
    loadFailed: "无法加载订单详情。",
    foodSelection: "所选餐品",
    productOptions: "选项",
    categories: {
      all: "全部",
      chicken: "韩国炸鸡",
      tteokbokki: "辣炒年糕",
      pizza: "披萨",
      noodles: "面食",
      jokbal: "韩式烤肉",
      side: "加点小食",
      dessert: "甜品",
    },
  },
  ja: {
    heroTitle: "韓国人が本当におすすめするローカルグルメ",
    addressLabel: "配達先",
    addressPlaceholder: "配達先を入力（ホテル名 / 部屋番号 / 漢江公園入口）",
    notice1:
      "GoKwonはお客様の配達先を分析し、近くで評価の高い認証済みレストランから注文します。",
    notice2:
      "一部エリアでは配達できない場合があります。サービス対象外の場合はメールでご連絡します。",
    checkoutBtn: "決済に進む",
    successTitle: "ご注文が完了しました！",
    successSub:
      "コンシェルジュが対応中です。配達状況はメールをご確認ください。",
    brandEyebrow: "GoKwon",
    localPickBadge: "ローカルおすすめ",
    addToOrder: "注文に追加",
    addedToOrder: "追加済み",
    estimatedTotal: "見積合計",
    quantityLabel: "数量",
    loadingMenus: "メニューを読み込み中...",
    emptyCategory: "このカテゴリにはまだメニューがありません。",
    reviewsSuffix: "件のレビュー",
    selectOptionError: "注文に追加する前にオプションを選択してください。",
    emptyCartError: "少なくとも1品を注文に追加してください。",
    loadFallbackNotice:
      "管理画面からメニューを読み込めませんでした。デフォルトメニューを表示しています。",
    backToHome: "ホームに戻る",
    orderNumber: "注文 #",
    subtotal: "小計",
    serviceFee: "サービス料",
    totalPaid: "合計支払額",
    statusLabel: "ステータス",
    orderNotFound: "注文が見つかりません。",
    loadFailed: "領収書を読み込めませんでした。",
    foodSelection: "料理",
    productOptions: "オプション",
    categories: {
      all: "すべて",
      chicken: "チキン",
      tteokbokki: "トッポッキ",
      pizza: "ピザ",
      noodles: "麺類",
      jokbal: "韓国BBQ",
      side: "サイドメニュー",
      dessert: "デザート",
    },
  },
  ru: {
    heroTitle: "Блюда, которые рекомендуют настоящие корейцы",
    addressLabel: "Адрес доставки",
    addressPlaceholder:
      "Введите адрес доставки (отель / номер / вход в парк Ханган)",
    notice1:
      "GoKwon анализирует ваш адрес и оформляет заказ в лучших проверенных ресторанах поблизости.",
    notice2:
      "Доставка может быть недоступна в некоторых районах. Мы свяжемся с вами по email, если адрес вне зоны обслуживания.",
    checkoutBtn: "Перейти к оплате",
    successTitle: "Заказ успешно оформлен!",
    successSub:
      "Ваш консьерж уже занимается заказом. Проверьте email для обновлений доставки.",
    brandEyebrow: "GoKwon",
    localPickBadge: "Выбор местных",
    addToOrder: "Добавить в заказ",
    addedToOrder: "Добавлено",
    estimatedTotal: "Примерная сумма",
    quantityLabel: "Количество",
    loadingMenus: "Загрузка меню...",
    emptyCategory: "В этой категории пока нет блюд.",
    reviewsSuffix: "отзывов",
    selectOptionError: "Выберите опцию перед добавлением в заказ.",
    emptyCartError: "Добавьте хотя бы одно блюдо в заказ.",
    loadFallbackNotice:
      "Не удалось загрузить меню из админки. Показано меню по умолчанию.",
    backToHome: "На главную",
    orderNumber: "Заказ #",
    subtotal: "Подытог",
    serviceFee: "Сервисный сбор",
    totalPaid: "Итого оплачено",
    statusLabel: "Статус",
    orderNotFound: "Заказ не найден.",
    loadFailed: "Не удалось загрузить чек.",
    foodSelection: "Блюдо",
    productOptions: "Опция",
    categories: {
      all: "Все",
      chicken: "Чикен",
      tteokbokki: "Ттокпокки",
      pizza: "Пицца",
      noodles: "Лапша",
      jokbal: "K-BBQ",
      side: "Добавки",
      dessert: "Десерт",
    },
  },
  es: {
    heroTitle: "Platos recomendados por coreanos de verdad",
    addressLabel: "Dirección de entrega",
    addressPlaceholder:
      "Ingrese la dirección (hotel / habitación / entrada del parque Han)",
    notice1:
      "GoKwon analiza su ubicación y hace el pedido en los restaurantes locales mejor valorados y verificados cercanos.",
    notice2:
      "La entrega puede no estar disponible en todas las zonas. Le contactaremos por email si su ubicación está fuera del área de servicio.",
    checkoutBtn: "Continuar al pago",
    successTitle: "¡Pedido completado con éxito!",
    successSub:
      "Su conserje ya está gestionando el pedido. Revise su email para actualizaciones de entrega.",
    brandEyebrow: "GoKwon",
    localPickBadge: "Favorito local",
    addToOrder: "Añadir al pedido",
    addedToOrder: "Añadido",
    estimatedTotal: "Total estimado",
    quantityLabel: "Cantidad",
    loadingMenus: "Cargando menús...",
    emptyCategory: "Aún no hay menús en esta categoría.",
    reviewsSuffix: "reseñas",
    selectOptionError: "Seleccione una opción antes de añadir al pedido.",
    emptyCartError: "Añada al menos un artículo al pedido.",
    loadFallbackNotice:
      "No se pudo cargar el menú del admin. Mostrando menú predeterminado.",
    backToHome: "Volver al inicio",
    orderNumber: "Pedido #",
    subtotal: "Subtotal",
    serviceFee: "Tarifa de servicio",
    totalPaid: "Total pagado",
    statusLabel: "Estado",
    orderNotFound: "Pedido no encontrado.",
    loadFailed: "No se pudo cargar el recibo.",
    foodSelection: "Comida",
    productOptions: "Opción",
    categories: {
      all: "Todo",
      chicken: "Pollo",
      tteokbokki: "Tteokbokki",
      pizza: "Pizza",
      noodles: "Fideos",
      jokbal: "K-BBQ",
      side: "Extras",
      dessert: "Postre",
    },
  },
};

export function getPageTranslations(
  language: GokwonPageLanguage,
): PageTranslation {
  return pageTranslations[language] ?? pageTranslations.en;
}
