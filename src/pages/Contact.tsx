export default function Contact() {
  return (
    <div className="min-h-screen bg-[#0a0908] pt-32 px-8 md:px-16 pb-24">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
        {/* Left */}
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-[#c9a87c] mb-4">Contact</p>
          <h1 className="font-['DM_Serif_Display'] text-5xl md:text-6xl text-[#e8ddd0] leading-tight mb-8">
            Let's make<br />something.
          </h1>
          <p className="text-[#7a7062] font-light leading-relaxed text-sm max-w-sm">
            Available for editorial commissions, fine art print orders, and exhibition inquiries. Response within two business days.
          </p>

          <div className="mt-12 space-y-8">
            <ContactItem
              label="Email"
              value="marco@marcolevi.com"
              href="mailto:marco@marcolevi.com"
            />
            <ContactItem
              label="Instagram"
              value="@marcolevi.photo"
              href="https://instagram.com"
            />
            <ContactItem
              label="Based in"
              value="Milan, Italy — available to travel"
            />
            <ContactItem
              label="Represented by"
              value="Aperture Agency, London"
            />
          </div>
        </div>

        {/* Right — form */}
        <div>
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
              <label htmlFor="message" className="block text-[10px] tracking-[0.2em] uppercase text-[#5a5248] mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                placeholder="Tell me about your project..."
                required
                className="w-full bg-[#111009] border border-[#2a2620] text-[#e8ddd0] placeholder:text-[#3a3630] text-sm font-light px-4 py-3 focus:outline-none focus:border-[#c9a87c] transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="text-xs tracking-[0.2em] uppercase bg-[#c9a87c] text-[#0a0908] px-8 py-3 hover:bg-[#e8ddd0] transition-colors font-medium"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Print ordering note */}
      <div className="max-w-5xl mx-auto mt-24 pt-12 border-t border-[#2a2620] grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Fine Art Prints", body: "All prints are made on archival cotton rag or baryta paper, signed and numbered. Limited editions of 10." },
          { title: "Editorial", body: "Available for magazine features, book projects, and long-form documentary work. Rates on request." },
          { title: "Workshops", body: "Annual field workshops in Scotland, Patagonia, and Japan. Intimately sized — maximum six participants." },
        ].map((item) => (
          <div key={item.title}>
            <h3 className="font-['DM_Serif_Display'] text-xl text-[#e8ddd0] mb-3">{item.title}</h3>
            <p className="text-[#7a7062] text-sm font-light leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactItem({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-[#5a5248] mb-1">{label}</p>
      {href ? (
        <a href={href} className="text-sm text-[#c4b89e] hover:text-[#c9a87c] transition-colors font-light">{value}</a>
      ) : (
        <p className="text-sm text-[#c4b89e] font-light">{value}</p>
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
      <label htmlFor={id} className="block text-[10px] tracking-[0.2em] uppercase text-[#5a5248] mb-2">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full bg-[#111009] border border-[#2a2620] text-[#e8ddd0] placeholder:text-[#3a3630] text-sm font-light px-4 py-3 focus:outline-none focus:border-[#c9a87c] transition-colors"
      />
    </div>
  );
}
