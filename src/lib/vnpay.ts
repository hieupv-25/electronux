import crypto from "crypto";

function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
}

function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
    }
  }
  return sorted;
}

export type BuildVNPayUrlParams = {
  orderId: string;
  amount: number;
  orderInfo?: string;
  ipAddr?: string;
  returnUrl?: string;
};

export function buildVNPayUrl({
  orderId,
  amount,
  orderInfo,
  ipAddr = "127.0.0.1",
  returnUrl,
}: BuildVNPayUrlParams): string {
  const tmnCode = process.env.VNP_TMNCODE || "CGXZ858Z";
  const secretKey = process.env.VNP_HASHSECRET || "RAHQAKRFRLFBVIZUQGGIYXZWKCYWWCZP";
  const vnpUrl = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const defaultReturnUrl =
    returnUrl ||
    process.env.VNP_RETURNURL ||
    "http://localhost:3000/api/checkout/vnpay-return";

  const date = new Date();
  const createDate = formatDate(date);

  // VNPay expects amount multiplied by 100
  const vnpAmount = Math.round(amount * 100);

  let vnp_Params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
    vnp_OrderType: "other",
    vnp_Amount: String(vnpAmount),
    vnp_ReturnUrl: defaultReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  vnp_Params = sortObject(vnp_Params);

  const signData = Object.entries(vnp_Params)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");

  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  vnp_Params["vnp_SecureHash"] = signed;

  const queryString = Object.entries(vnp_Params)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");

  return `${vnpUrl}?${queryString}`;
}

export function verifyVNPayResponse(queryParams: Record<string, string | string[] | undefined>): {
  isValid: boolean;
  orderId: string;
  responseCode: string;
  transactionNo: string;
  amount: number;
} {
  const secretKey = process.env.VNP_HASHSECRET || "RAHQAKRFRLFBVIZUQGGIYXZWKCYWWCZP";

  const secureHash = typeof queryParams["vnp_SecureHash"] === "string" ? queryParams["vnp_SecureHash"] : "";
  const orderId = typeof queryParams["vnp_TxnRef"] === "string" ? queryParams["vnp_TxnRef"] : "";
  const responseCode = typeof queryParams["vnp_ResponseCode"] === "string" ? queryParams["vnp_ResponseCode"] : "";
  const transactionNo = typeof queryParams["vnp_TransactionNo"] === "string" ? queryParams["vnp_TransactionNo"] : "";
  const amountRaw = typeof queryParams["vnp_Amount"] === "string" ? queryParams["vnp_Amount"] : "0";

  const vnp_Params: Record<string, string> = {};
  for (const [key, val] of Object.entries(queryParams)) {
    if (key.startsWith("vnp_") && key !== "vnp_SecureHash" && key !== "vnp_SecureHashType") {
      if (typeof val === "string") {
        vnp_Params[key] = val;
      }
    }
  }

  const sortedParams = sortObject(vnp_Params);
  const signData = Object.entries(sortedParams)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");

  const hmac = crypto.createHmac("sha512", secretKey);
  const checkHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  const isValid = checkHash.toLowerCase() === secureHash.toLowerCase();
  const amount = Number(amountRaw) / 100;

  return {
    isValid,
    orderId,
    responseCode,
    transactionNo,
    amount,
  };
}
