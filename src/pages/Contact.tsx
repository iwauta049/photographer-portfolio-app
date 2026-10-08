import { getProfile } from "../data/store";

export default function Contact() {
  const profile = getProfile();

  return (
    <div
      key="contact-page-current"
      className="min-h-screen bg-background pt-32 px-8 md:px-16 pb-24"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
        {/* Left */}
        <div>
          <h1 className="font-['DM_Serif_Display'] text-5xl md:text-6xl text-foreground leading-tight mb-8">
            Contact
          </h1>
          <p className="text-secondary-foreground font-light leading-relaxed text-sm max-w-sm">
            Available for editorial commissions, fine art print orders, and exhibition inquiries. Response within two business days.
          </p>

          <div className="mt-12 space-y-8">
            <ContactItem
              label="Email"
              value="poojan.gohil@gmail.com"
              href="mailto:poojan.gohil@gmail.com"
            />
            <ContactItem
              label="Instagram"
              value="@poojan_gohil"
              href={profile.instagramUrl || undefined}
            />
            <ContactItem
              label="eBird"
              value="View eBird profile"
              href={profile.ebirdUrl || undefined}
            />
            <ContactItem
              label="Based in"
              value="Calgary, Alberta, Canada"
            />
          </div>
        </div>

        {/* Right — form */}
        <div className="md:mt-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for your message. I will be in touch shortly.");
              (e.target as HTMLFormElement).reset();
            }}
            className="space-y-6"
          >
            <FormField label="Name" id="name" placeholder="Your name" required />
            <FormField label="Email" id="email" type="email" placeholder="your@email.com" required />
            <FormField label="Subject" id="subject" placeholder="Commission, print inquiry, etc." />
            <div>
              <label htmlFor="message" className="block text-[10px] tracking-[0.2em] uppercase text-card-foreground mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                placeholder="Tell me about your project..."
                required
                className="w-full bg-card border border-border text-card-foreground placeholder:text-primary text-sm font-light px-4 py-3 focus:outline-none focus:border-border transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-3 hover:bg-foreground transition-colors font-medium"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

function ContactItem({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-secondary-foreground mb-1">{label}</p>
      {href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="text-sm text-foreground hover:text-primary transition-colors font-light"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-foreground font-light">{value}</p>
      )}
    </div>
  );
}

function FormField({
  label, id, type = "text", placeholder, required
}: {
  label: string; id: string; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] tracking-[0.2em] uppercase text-card-foreground mb-2">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full bg-card border border-border text-primary placeholder:text-muted-foreground text-sm font-light px-4 py-3 focus:outline-none focus:border-border transition-colors"
      />
    </div>
  );
}
