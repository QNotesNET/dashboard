import crypto from "crypto";
import bcrypt from "bcryptjs";

export function generateBackupCodes(count = 10) {
  const plainCodes: string[] = [];
  const hashedCodes: { hash: string; used: boolean }[] = [];

  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString("hex"); // z.B. a3f9c2e1
    const formatted = code.match(/.{1,4}/g)!.join("-"); // a3f9-c2e1

    const hash = bcrypt.hashSync(formatted, 10);

    plainCodes.push(formatted);
    hashedCodes.push({ hash, used: false });
  }

  return {
    plainCodes,
    hashedCodes,
  };
}
