import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Account settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      passwordHash: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) return null;

  const isOAuthOnly = !user.passwordHash && user.accounts.length > 0;

  return (
    <SettingsClient
      user={{
        name: user.name ?? "",
        email: user.email,
        phone: user.phone ?? "",
        image: user.image ?? "",
      }}
      isOAuthOnly={isOAuthOnly}
    />
  );
}
