/* ============================================================
   INGLISH NOW — interações
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ============================================================
     1. Header fixo + barra de progresso + botão "voltar ao topo"
     ============================================================ */
  const header = $("#header");
  const scrollBar = $("#scrollBar");
  const toTop = $("#toTop");

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = height > 0 ? (y / height) * 100 : 0;

    header.classList.toggle("is-scrolled", y > 24);
    toTop.classList.toggle("is-visible", y > 600);
    scrollBar.style.width = progress + "%";
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ============================================================
     2. Menu mobile
     ============================================================ */
  const nav = $("#nav");
  const navToggle = $("#navToggle");

  function closeNav() {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("nav-open");
  }

  function toggleNav() {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("nav-open", open);
  }

  navToggle.addEventListener("click", toggleNav);

  $$(".nav a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      closeNav();
      navToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeNav();
  });

  /* ============================================================
     3. Reveal on scroll
     ============================================================ */
  const revealEls = $$(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ============================================================
     4. Contadores animados
     ============================================================ */
  const counters = $$(".count");
  const numberFmt = new Intl.NumberFormat("pt-BR");

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;

    if (reduceMotion) {
      el.textContent = format(target) + suffix;
      return;
    }

    const start = performance.now();

    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = target * eased;
      el.textContent = format(value) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }

    function format(value) {
      if (decimals > 0) {
        return value.toFixed(decimals).replace(".", ",");
      }
      return numberFmt.format(Math.round(value));
    }

    requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
    } else {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => counterObserver.observe(el));
    }
  }

  /* ============================================================
     5. Link ativo no menu conforme a seção visível
     ============================================================ */
  const navLinks = $$(".nav__link");
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      return id && id.startsWith("#") ? $(id) : null;
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === id
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ============================================================
     6. FAQ (acordeão acessível)
     ============================================================ */
  const faqItems = $$(".faq__item");

  faqItems.forEach((item) => {
    const button = $(".faq__question", item);
    const answer = $(".faq__answer", item);

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // fecha os demais
      faqItems.forEach((other) => {
        if (other === item) return;
        other.classList.remove("is-open");
        $(".faq__question", other).setAttribute("aria-expanded", "false");
        $(".faq__answer", other).setAttribute("inert", "");
      });

      item.classList.toggle("is-open", !isOpen);
      button.setAttribute("aria-expanded", String(!isOpen));

      if (isOpen) {
        answer.setAttribute("inert", "");
      } else {
        answer.removeAttribute("inert");
      }
    });
  });

  // Respostas fechadas ficam inertes (fora da navegação por teclado e leitores de tela)
  $$(".faq__answer").forEach((el) => el.setAttribute("inert", ""));

  /* ============================================================
     7. Máscara de WhatsApp
     ============================================================ */
  const phoneInput = $("#phone");

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      let digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);

      if (digits.length > 6) {
        phoneInput.value =
          "(" +
          digits.slice(0, 2) +
          ") " +
          digits.slice(2, digits.length > 10 ? 7 : 6) +
          "-" +
          digits.slice(digits.length > 10 ? 7 : 6);
      } else if (digits.length > 2) {
        phoneInput.value = "(" + digits.slice(0, 2) + ") " + digits.slice(2);
      } else if (digits.length > 0) {
        phoneInput.value = "(" + digits;
      } else {
        phoneInput.value = "";
      }
    });
  }

  /* ============================================================
     8. Validação do formulário
     ============================================================ */
  const form = $("#signupForm");
  const successBox = $("#formSuccess");

  const validators = {
    name(value) {
      if (!value.trim()) return "Informe seu nome.";
      if (value.trim().length < 3) return "O nome precisa ter pelo menos 3 letras.";
      return "";
    },
    email(value) {
      if (!value.trim()) return "Informe seu e-mail.";
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim()))
        return "Digite um e-mail válido.";
      return "";
    },
    phone(value) {
      const digits = value.replace(/\D/g, "");
      if (!digits) return "Informe seu WhatsApp.";
      if (digits.length < 10) return "Digite o número com DDD.";
      return "";
    },
    level(value) {
      if (!value) return "Selecione seu nível.";
      return "";
    },
  };

  function setError(field, message) {
    const errorEl = $(`[data-error-for="${field.name}"]`);

    if (message) {
      errorEl.textContent = message;
      errorEl.classList.add("is-active");
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", `err-${field.name}`);
      errorEl.id = `err-${field.name}`;
    } else {
      errorEl.textContent = "";
      errorEl.classList.remove("is-active");
      field.removeAttribute("aria-invalid");
    }
  }

  function validateField(field) {
    const validator = validators[field.name];
    if (!validator) return true;
    const message = validator(field.value);
    setError(field, message);
    return !message;
  }

  if (form) {
    const fields = ["name", "email", "phone", "level"]
      .map((name) => form.elements[name])
      .filter(Boolean);

    // valida ao sair do campo (depois de já ter sido tocado)
    fields.forEach((field) => {
      field.addEventListener("blur", () => {
        if (field.value) validateField(field);
      });
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      let firstInvalid = null;

      fields.forEach((field) => {
        const ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      // Simulação de envio (aqui você conectaria a um backend/Formspree)
      const submitBtn = $('button[type="submit"]', form);
      const original = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;

        form.reset();
        fields.forEach((field) => setError(field, ""));
        $$(".field__error", form).forEach((el) => {
          el.textContent = "";
          el.classList.remove("is-active");
        });

        successBox.hidden = false;
        successBox.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
        });
      }, 900);
    });
  }

  /* ============================================================
     9. Ano atual no rodapé
     ============================================================ */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
