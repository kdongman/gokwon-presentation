export type CustomerSupportChannel = {
  id: "whatsapp" | "kakao" | "email";
  href: string;
  external: boolean;
};

const DEFAULT_SUPPORT_EMAIL = "admin@example.com";

export function getCustomerSupportChannels(): CustomerSupportChannel[] {
  const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() ?? "";
  const kakaoChannelUrl = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL?.trim() ?? "";
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;

  const channels: CustomerSupportChannel[] = [];

  if (whatsappUrl) {
    channels.push({
      id: "whatsapp",
      href: whatsappUrl,
      external: true,
    });
  }

  if (kakaoChannelUrl) {
    channels.push({
      id: "kakao",
      href: kakaoChannelUrl,
      external: true,
    });
  }

  channels.push({
    id: "email",
    href: `mailto:${supportEmail}`,
    external: false,
  });

  return channels;
}

export function getSupportEmail(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
}
