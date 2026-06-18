import type { MenuPageLanguage } from "@/lib/gokwon-bilingual-menu";

export const MENU_PAGE_UI: Record<
  MenuPageLanguage,
  {
    brandEyebrow: string;
    headerTitle: string;
    addressLabel: string;
    addressPlaceholder: string;
    restaurantPolicy: string;
    deliveryAvailabilityNotice: string;
    localPickBadge: string;
    addToOrder: string;
    addedToOrder: string;
    estimatedTotal: string;
    quantityLabel: string;
    orderButton: string;
    loadingMenus: string;
    emptyCategory: string;
    reviewsLabel: string;
  }
> = {
  en: {
    brandEyebrow: "GoKwon",
    headerTitle: "Locally Recommended by Real Koreans",
    addressLabel: "Delivery address",
    addressPlaceholder: "Enter Delivery Address (Hotel / Spot)",
    restaurantPolicy:
      "GoKwon analyzes your delivery location and places your order from the highest-rated, verified local restaurants nearby. The franchise logo on the box may vary, but the taste and quality will always match your selection.",
    deliveryAvailabilityNotice:
      "Delivery may not be available in some areas. If your location is outside our service zone, we will email you within 10 minutes of payment and immediately cancel your order with a 100% full refund.",
    localPickBadge: "K-Local Pick",
    addToOrder: "Add to order",
    addedToOrder: "Added to order",
    estimatedTotal: "Estimated total",
    quantityLabel: "Quantity",
    orderButton: "Continue to Checkout",
    loadingMenus: "Loading menus...",
    emptyCategory: "No menus in this category yet.",
    reviewsLabel: "reviews",
  },
  zh: {
    brandEyebrow: "GoKwon",
    headerTitle: "韩国人亲自推荐的 5大 本地外卖菜单",
    addressLabel: "送餐地址",
    addressPlaceholder: "请输入送餐地址 (酒店名称 / 房间号 / 汉江公园出入口)",
    restaurantPolicy:
      "GoKwon 会根据您的送餐地址，从附近评分最高、已验证的本地餐厅为您下单。外卖盒上的品牌标识可能不同，但口味与品质始终与您的选择一致。",
    deliveryAvailabilityNotice:
      "部分地区可能无法配送。若您的地址超出服务范围，我们将在付款完成后 10 分钟内通过邮件通知您，并立即取消订单且 100% 全额退款。",
    localPickBadge: "韩国人推荐",
    addToOrder: "加入订单",
    addedToOrder: "已加入订单",
    estimatedTotal: "预估总计",
    quantityLabel: "数量",
    orderButton: "继续结账",
    loadingMenus: "菜单加载中...",
    emptyCategory: "该分类暂无菜单。",
    reviewsLabel: "条评价",
  },
};

export function getMenuPageUi(language: MenuPageLanguage) {
  return MENU_PAGE_UI[language];
}
