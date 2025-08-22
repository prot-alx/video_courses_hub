"use client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactInfoGrid from "@/components/contacts/ContactInfoGrid";
import ContactForm from "@/components/contacts/ContactForm";
import FAQSection from "@/components/contacts/FAQSection";
import SocialMediaLinks from "@/components/contacts/SocialMediaLinks";
import ContactMap from "@/components/contacts/ContactMap";

export default function ContactsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold mb-6"
            style={{ color: "var(--color-text-primary)" }}
          >
            Свяжитесь с нами
          </h1>
          <p
            className="text-lg max-w-3xl mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Мы всегда рады помочь! Свяжитесь с нами любым удобным способом или
            оставьте сообщение через форму обратной связи.
          </p>
        </div>

        <ContactInfoGrid />

        <div className="grid lg:grid-cols-2 gap-12">
          <ContactForm />

          <div>
            <FAQSection />
            <SocialMediaLinks />
          </div>
        </div>

        <ContactMap />
      </main>

      <Footer />
    </div>
  );
}
