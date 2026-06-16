export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="container-x py-12">
      <article className="mx-auto max-w-3xl space-y-6 prose-sm">
        <h1 className="font-serif text-4xl">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="font-serif text-2xl">Information we collect</h2>
        <p>
          We collect personal information you provide when creating an account, placing an order
          or contacting us — including name, email, shipping address, and payment information.
        </p>

        <h2 className="font-serif text-2xl">How we use your data</h2>
        <p>
          To process orders, deliver products, provide customer support and (with your consent)
          to send marketing communications.
        </p>

        <h2 className="font-serif text-2xl">Your rights</h2>
        <p>
          You may request access, correction or deletion of your data at any time by emailing
          support@Vailmora.com.
        </p>
      </article>
    </div>
  );
}
