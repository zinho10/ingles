/* ============================================================
   ENGLISH NOW — interações
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
     8. Validação e envio da solicitação (WhatsApp + e-mail)
     ============================================================ */
  const WHATSAPP_NUMBER = "5522981065343";
  const CONTACT_EMAIL = "nicki133029@email.com";

  /* ---------- Supabase (banco de dados) ---------- */
  const SUPABASE_CONFIG = window.ENGLISH_NOW_SUPABASE || {};
  const SUPABASE_TABLE = SUPABASE_CONFIG.table || "leads";

  const isPlaceholder = (value) => !value || /COLE_AQUI/i.test(String(value));

  const supabaseReady =
    !isPlaceholder(SUPABASE_CONFIG.url) &&
    !isPlaceholder(SUPABASE_CONFIG.anonKey) &&
    /^https?:\/\//i.test(SUPABASE_CONFIG.url) &&
    typeof window.supabase?.createClient === "function";

  const supabaseClient = supabaseReady
    ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
    : null;

  async function saveLead(data, message) {
    if (!supabaseClient) return { ok: false, reason: "not-configured" };

    const { error } = await supabaseClient.from(SUPABASE_TABLE).insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      level: data.level,
      level_label: data.levelLabel,
      message,
      source: "site",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });

    if (error) {
      console.warn("[Supabase] Não foi possível salvar a solicitação:", error.message);
      return { ok: false, reason: error.message };
    }

    return { ok: true };
  }

  const form = $("#signupForm");
  const successBox = $("#formSuccess");
  const submitBtn = $("#submitBtn");
  const emailRelay = $("#emailRelay");
  const waFallback = $("#waFallback");
  const emailFallback = $("#emailFallback");
  const emailStatus = $("#emailStatus");
  const saveStatus = $("#saveStatus");

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

    const allFilled = () =>
      fields.every((field) => String(field.value).trim() !== "");

    const updateSubmitState = () => {
      submitBtn.disabled = !allFilled();
    };

    const getData = () => ({
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      level: form.elements.level.value,
      levelLabel:
        form.elements.level.options[form.elements.level.selectedIndex]?.text ||
        "Não informado",
    });

    const buildMessage = (data) =>
      [
        "Olá, Professor Nicolas! Quero agendar uma aula de inglês.",
        "",
        `Nome: ${data.name}`,
        `E-mail: ${data.email}`,
        `WhatsApp: ${data.phone}`,
        `Nível: ${data.levelLabel}`,
        "",
        "Solicitação enviada pelo site ENGLISH NOW.",
      ].join("\n");

    const clearErrors = () => {
      fields.forEach((field) => setError(field, ""));
      $$(".field__error", form).forEach((el) => {
        el.textContent = "";
        el.classList.remove("is-active");
      });
    };

    // O botão só fica ativo quando todos os campos estão preenchidos.
    fields.forEach((field) => {
      field.addEventListener("input", updateSubmitState);
      field.addEventListener("change", updateSubmitState);

      field.addEventListener("blur", () => {
        if (field.value) validateField(field);
      });

      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });
    });

    // Revalida o estado em casos de autofill do navegador.
    form.addEventListener("focusin", updateSubmitState);
    window.addEventListener("load", updateSubmitState);
    setTimeout(updateSubmitState, 600);

    updateSubmitState();

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

      const data = getData();
      const message = buildMessage(data);
      const subject = `Nova solicitação de aula — ${data.name}`;

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        message
      )}`;
      const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(message)}`;

      // Links de segurança, caso o navegador bloqueie a abertura automática.
      waFallback.href = whatsappUrl;
      emailFallback.href = mailtoUrl;

      // 1) Abre o WhatsApp com todos os dados (precisa ser síncrono).
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      // 2) Envia a mesma solicitação por e-mail (FormSubmit, sem backend).
      let emailRequested = false;

      if (emailRelay) {
        const setRelay = (name, value) => {
          const input = emailRelay.querySelector(`[name="${name}"]`);
          if (input) input.value = value;
        };

        setRelay("_subject", subject);
        setRelay("_replyto", data.email);
        setRelay("Nome", data.name);
        setRelay("email", data.email);
        setRelay("WhatsApp", data.phone);
        setRelay("Nível", data.levelLabel);
        setRelay("Mensagem", message);

        try {
          emailRelay.submit();
          emailRequested = true;
        } catch (err) {
          // Se o envio automático falhar, o botão "Enviar por e-mail" continua disponível.
          if (emailStatus) {
            emailStatus.textContent =
              "Não foi possível enviar o e-mail automaticamente. Use o botão “Enviar por e-mail”.";
          }
        }
      }

      // 3) Salva a solicitação no Supabase (sem bloquear o WhatsApp).
      if (saveStatus) {
        if (!supabaseReady) {
          saveStatus.textContent =
            "Banco de dados não configurado. Veja o arquivo supabase-config.js.";
          saveStatus.dataset.state = "warn";
        } else {
          saveStatus.textContent = "Salvando solicitação no banco de dados...";
          saveStatus.dataset.state = "loading";

          saveLead(data, message).then((result) => {
            if (result.ok) {
              saveStatus.textContent = "Solicitação salva no banco de dados.";
              saveStatus.dataset.state = "ok";
            } else {
              saveStatus.textContent =
                "Não foi possível salvar no banco agora. Seus dados foram enviados pelo WhatsApp e e-mail.";
              saveStatus.dataset.state = "error";
            }
          });
        }
      }

      // 4) Feedback visual e limpeza do formulário.
      form.reset();
      clearErrors();
      updateSubmitState();

      if (emailStatus) {
        if (emailRequested) {
          emailStatus.textContent = `Cópia por e-mail solicitada para ${CONTACT_EMAIL}.`;
        } else if (!emailRelay) {
          emailStatus.textContent =
            "Envie também por e-mail usando o botão “Enviar por e-mail”.";
        }
      }

      successBox.hidden = false;
      successBox.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    });
  }

  /* ============================================================
     9. Ano atual no rodapé
     ============================================================ */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
