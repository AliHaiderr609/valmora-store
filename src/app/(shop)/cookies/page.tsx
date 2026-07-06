export const metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <div className="container-x py-12">
      <article className="mx-auto max-w-3xl space-y-6">
        <h1 className="font-serif text-4xl">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="font-serif text-2xl">What are cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit our website. They help
          us remember your preferences, keep you signed in, and understand how you use Vailmora so
          we can improve your shopping experience.
        </p>

        <h2 className="font-serif text-2xl">Cookies we use</h2>
        <p>
          <strong className="text-foreground">Essential cookies</strong> — required for the site to
          function, including your shopping cart, checkout, and account sign-in.
        </p>
        <p>
          <strong className="text-foreground">Preference cookies</strong> — remember choices such as
          your theme (light/dark mode) and display settings.
        </p>
        <p>
          <strong className="text-foreground">Analytics cookies</strong> — help us understand how
          visitors browse our store so we can improve pages and product discovery.
        </p>

        <h2 className="font-serif text-2xl">Managing cookies</h2>
        <p>
          You can control or delete cookies through your browser settings. Disabling essential
          cookies may prevent some features — such as adding items to your cart or signing in —
          from working correctly.
        </p>

        <h2 className="font-serif text-2xl">Contact us</h2>
        <p>
          If you have questions about our use of cookies, email us at support@Vailmora.com.
        </p>
      </article>
    </div>
  );
}
