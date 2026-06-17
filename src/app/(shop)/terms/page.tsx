export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="container-x py-12">
      <article className="mx-auto max-w-3xl space-y-6">
        <h1 className="font-serif text-4xl">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="font-serif text-2xl">Use of our service</h2>
        <p>By accessing Vailmora, you agree to these terms. You must be at least 18 years old to make a purchase.</p>

        <h2 className="font-serif text-2xl">Orders and payment</h2>
        <p>All prices are shown in your selected currency. Orders are subject to availability and verification.</p>

        <h2 className="font-serif text-2xl">Returns</h2>
        <p>We offer 30-day returns on unworn items in original packaging. See our shipping page for details.</p>
      </article>
    </div>
  );
}
