import { whatsappLink, site } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink(`Hello ${site.name}, I would like to make an enquiry.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lift transition-transform hover:scale-105 active:scale-95"
    >
      <WhatsAppIcon className="size-5" />
      <span className="hidden sm:inline">WhatsApp us</span>
    </a>
  );
}
