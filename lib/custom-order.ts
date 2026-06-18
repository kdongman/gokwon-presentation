function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getCustomOrderTemplate(
  foodName: string,
  requests: string,
  customerEmail: string,
  deliveryAddress: string,
): string {
  const safeFoodName = escapeHtml(foodName);
  const safeRequests = escapeHtml(requests || "No special requests provided.");
  const safeCustomerEmail = escapeHtml(customerEmail);
  const safeDeliveryAddress = escapeHtml(deliveryAddress);

  return `
<!DOCTYPE html>
<html lang="ko">
  <body style="margin:0;padding:24px;background:#f1f5f9;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;">
      <tr>
        <td style="padding:0 0 16px;">
          <span style="display:inline-block;padding:7px 12px;border-radius:999px;background:#ede9fe;color:#6d28d9;font-size:12px;font-weight:800;">$0 Free Quote Request</span>
          <h1 style="margin:14px 0 0;font-size:24px;line-height:1.35;color:#0f172a;">새로운 커스텀 주문 견적 요청</h1>
          <p style="margin:7px 0 0;font-size:14px;line-height:1.7;color:#64748b;">아직 결제되지 않은 무료 견적 요청입니다.</p>
        </td>
      </tr>
      <tr>
        <td>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
            <tr>
              <th align="left" colspan="2" style="padding:15px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">Quote Request Details</th>
            </tr>
            <tr>
              <td style="width:35%;padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#475569;vertical-align:top;">음식 / 제품 이름</td>
              <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:15px;font-weight:700;color:#0f172a;vertical-align:top;">${safeFoodName}</td>
            </tr>
            <tr>
              <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#475569;vertical-align:top;">배달 주소</td>
              <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:15px;font-weight:700;color:#0f172a;vertical-align:top;">${safeDeliveryAddress}</td>
            </tr>
            <tr>
              <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#475569;vertical-align:top;">고객 이메일</td>
              <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:15px;font-weight:700;color:#4f46e5;vertical-align:top;">${safeCustomerEmail}</td>
            </tr>
            <tr>
              <td style="padding:14px 18px;font-size:13px;font-weight:700;color:#475569;vertical-align:top;">요청 사항</td>
              <td style="padding:14px 18px;font-size:14px;line-height:1.8;color:#334155;white-space:pre-wrap;vertical-align:top;">${safeRequests}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 18px;margin-top:16px;border-radius:12px;background:#fffbeb;border:1px solid #fde68a;font-size:13px;font-weight:700;line-height:1.7;color:#92400e;">
          &#128161; 답장 버튼을 눌러 손님에게 PayPal 결제 링크와 견적 금액을 발송하세요!
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
}

export function getKofiOrderTemplate(
  name: string,
  email: string,
  amount: string,
  message: string,
): string {
  const safeName = escapeHtml(name || "Ko-fi customer");
  const safeEmail = escapeHtml(email);
  const safeAmount = escapeHtml(amount);
  const safeMessage = escapeHtml(message || "No order details provided.");

  return `
<!DOCTYPE html>
<html lang="ko">
  <body style="margin:0;padding:24px;background:#f1f5f9;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;">
      <tr>
        <td style="padding:0 0 16px;">
          <span style="display:inline-block;padding:7px 12px;border-radius:999px;background:#dcfce7;color:#166534;font-size:12px;font-weight:800;letter-spacing:0.04em;">
            &#128994; Payment Verified via Ko-fi
          </span>
          <h1 style="margin:14px 0 0;font-size:24px;line-height:1.35;color:#0f172a;">결제 완료 및 새로운 주문 요청</h1>
          <p style="margin:7px 0 0;font-size:14px;line-height:1.7;color:#64748b;">Ko-fi에서 결제가 확인된 안전한 주문입니다.</p>
        </td>
      </tr>
      <tr>
        <td>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
            <tr>
              <th align="left" colspan="2" style="padding:15px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">Paid Order Details</th>
            </tr>
            <tr>
              <td style="width:35%;padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#475569;vertical-align:top;">고객 이름</td>
              <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:15px;font-weight:700;color:#0f172a;vertical-align:top;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#475569;vertical-align:top;">고객 이메일</td>
              <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:15px;font-weight:700;color:#4f46e5;vertical-align:top;">${safeEmail}</td>
            </tr>
            <tr>
              <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#475569;vertical-align:top;">결제 금액</td>
              <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:18px;font-weight:900;color:#15803d;vertical-align:top;">${safeAmount}</td>
            </tr>
            <tr>
              <td style="padding:14px 18px;font-size:13px;font-weight:700;color:#475569;vertical-align:top;">주문 요청 사항</td>
              <td style="padding:14px 18px;font-size:14px;line-height:1.8;color:#334155;white-space:pre-wrap;vertical-align:top;">${safeMessage}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 4px 0;font-size:12px;line-height:1.6;color:#64748b;">
          Gmail에서 이 메일에 답장하면 고객 이메일로 바로 전달됩니다.
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
}
