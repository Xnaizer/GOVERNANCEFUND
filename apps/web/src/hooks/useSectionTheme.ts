import { useEffect, useState } from "react";

/**
 * Mengembalikan tema section yang sedang berada di bawah navbar ("light" | "dark"),
 * dibaca dari atribut `data-theme` pada elemen `<section data-nav-theme="dark">`.
 * Dipakai LandingNav untuk membalik warna teks di atas section gelap.
 */
export function useSectionTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-theme]"));
    if (sections.length === 0) return;

    // Garis pemicu tepat di bawah navbar (~72px).
    const LINE = 72;
    const compute = () => {
      let current: "light" | "dark" = "light";
      for (const el of sections) {
        const r = el.getBoundingClientRect();
        if (r.top <= LINE && r.bottom > LINE) {
          current = (el.dataset.navTheme as "light" | "dark") ?? "light";
        }
      }
      setTheme((prev) => (prev === current ? prev : current));
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  return theme;
}
