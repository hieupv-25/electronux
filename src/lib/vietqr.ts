export interface VietQRConfig {
  bankId: string;
  accountNo: string;
  accountName: string;
  template?: "compact2" | "compact" | "qr_only" | "print";
}

export interface BankInfo {
  id: string;
  code: string;
  name: string;
  shortName: string;
}

export const POPULAR_BANKS: BankInfo[] = [
  { id: "MB", code: "MBBank", name: "Ngân hàng TMCP Quân Đội", shortName: "MB Bank" },
  { id: "VCB", code: "Vietcombank", name: "Ngân hàng TMCP Ngoại Thương Việt Nam", shortName: "Vietcombank" },
  { id: "TCB", code: "Techcombank", name: "Ngân hàng TMCP Kỹ Thương Việt Nam", shortName: "Techcombank" },
  { id: "ICB", code: "VietinBank", name: "Ngân hàng TMCP Công Thương Việt Nam", shortName: "VietinBank" },
  { id: "BIDV", code: "BIDV", name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam", shortName: "BIDV" },
  { id: "ACB", code: "ACB", name: "Ngân hàng TMCP Á Châu", shortName: "ACB" },
  { id: "TPB", code: "TPBank", name: "Ngân hàng TMCP Tiên Phong", shortName: "TPBank" },
  { id: "VPB", code: "VPBank", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng", shortName: "VPBank" },
];

export function getVietQRConfig(): VietQRConfig {
  return {
    bankId: process.env.VIETQR_BANK_ID || "MB",
    accountNo: process.env.VIETQR_ACCOUNT_NO || "0388889999",
    accountName: process.env.VIETQR_ACCOUNT_NAME || "ELECTROLUX VIETNAM",
    template: (process.env.VIETQR_TEMPLATE as any) || "compact2",
  };
}

export function buildVietQRUrl({
  bankId,
  accountNo,
  accountName,
  template = "compact2",
  amount,
  addInfo,
}: {
  bankId?: string;
  accountNo?: string;
  accountName?: string;
  template?: string;
  amount: number;
  addInfo: string;
}): string {
  const config = getVietQRConfig();
  const bank = bankId || config.bankId;
  const accNo = accountNo || config.accountNo;
  const accName = accountName || config.accountName;
  const tpl = template || config.template || "compact2";

  // VietQR Quick Link format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<INFO>&accountName=<NAME>
  const encodedName = encodeURIComponent(accName);
  const encodedInfo = encodeURIComponent(addInfo);

  return `https://img.vietqr.io/image/${bank}-${accNo}-${tpl}.png?amount=${Math.round(amount)}&addInfo=${encodedInfo}&accountName=${encodedName}`;
}
