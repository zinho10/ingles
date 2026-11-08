
/* ============================================================
   ENGLISH NOW — script.js completo corrigido
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) =>
    Array.from(ctx.querySelectorAll(sel));

  // 1. Cabeçalho, progresso e voltar ao topo
  const header = $("#header");
  const scrollBar = $("#scrollBar");
  const toTop = $("#toTop");

  function onScroll() {
    const y = window.scrollY ||
      document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      window.innerHeight;
    const progress = height > 0 ? (y / height) * 100 : 0;

    if (header) header.classList.toggle("is-scrolled", y > 24);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
    if (scrollBar) scrollBar.style.width = progress + "%";
  }

  window.addEventListener("scroll", onScroll, {
    passive: true
  });
  onScroll();

  // 2. Menu mobile
  const nav = $("#nav");
  const navToggle = $("#navToggle");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("nav-open");
  }

  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute(
        "aria-label",
        open ? "Fechar menu" : "Abrir menu"
      );
      document.body.classList.toggle("nav-open", open);
    });

    $$(".nav a").forEach(link => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" &&
          nav.classList.contains("is-open")) {
        closeNav();
        navToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeNav();
    });
  }

  // 3. Animações de entrada
  const revealEls = $$(".reveal");

  if (reduceMotion ||
      !("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    });

    revealEls.forEach(el => observer.observe(el));
  }

  // 4. Contadores animados
  const counters = $$(".count");
  const numberFmt = new Intl.NumberFormat("pt-BR");

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count || "0");
    const decimals = parseInt(
      el.dataset.decimals || "0", 10
    );
    const suffix = el.dataset.suffix || "";
    const duration = 1600;

    function format(value) {
      if (decimals > 0) {
        return value.toFixed(decimals).replace(".", ",");
      }
      return numberFmt.format(Math.round(value));
    }

    if (reduceMotion) {
      el.textContent = format(target) + suffix;
      return;
    }

    const start = performance.now();

    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(target * eased) + suffix;

      if (t < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
    } else {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });

      counters.forEach(el => observer.observe(el));
    }
  }

  // 5. Links ativos do menu
  const navLinks = $$(".nav__link");

  const sections = navLinks
    .map(link => {
      const id = link.getAttribute("href");
      return id && id.startsWith("#") ? $(id) : null;
    })
    .filter(Boolean);

  if (sections.length &&
      "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = "#" + entry.target.id;

        navLinks.forEach(link => {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === id
          );
        });
      });
    }, {
      rootMargin: "-45% 0px -50% 0px",
      threshold: 0
    });

    sections.forEach(section => observer.observe(section));
  }

  // 6. FAQ
  const faqItems = $$(".faq__item");

  faqItems.forEach(item => {
    const button = $(".faq__question", item);
    const answer = $(".faq__answer", item);
    if (!button || !answer) return;

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      faqItems.forEach(other => {
        if (other === item) return;
        other.classList.remove("is-open");

        const otherButton = $(".faq__question", other);
        const otherAnswer = $(".faq__answer", other);

        if (otherButton) {
          otherButton.setAttribute("aria-expanded", "false");
        }
        if (otherAnswer) {
          otherAnswer.setAttribute("inert", "");
        }
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

  $$(".faq__answer").forEach(el => {
    el.setAttribute("inert", "");
  });

  // 7. Máscara de WhatsApp
  const phoneInput = $("#phone");

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      const digits = phoneInput.value
        .replace(/\D/g, "")
        .slice(0, 11);

      if (digits.length > 6) {
        const split = digits.length > 10 ? 7 : 6;
        phoneInput.value =
          "(" + digits.slice(0, 2) + ") " +
          digits.slice(2, split) + "-" +
          digits.slice(split);
      } else if (digits.length > 2) {
        phoneInput.value =
          "(" + digits.slice(0, 2) + ") " +
          digits.slice(2);
      } else {
        phoneInput.value = digits.length
          ? "(" + digits
          : "";
      }
    });
  }

  // 8. Integração WhatsApp, e-mail e Google Sheets
  const WHATSAPP_NUMBER = "5522981065343";
  const CONTACT_EMAIL = "nicki133029@email.com";

  const SHEETS_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbzxhgS_hDO0V64Pgn1mnWXQLS_K0oW_2PBGMMN3MXbC5SEXGXMBX7StbpnLAbBx_GrS/exec";

  async function saveLead(data) {
    try {
      await fetch(SHEETS_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          nome: data.name,
          email: data.email,
          whatsapp: data.phone,
          nivel: data.levelLabel,
          origem: "Site ENGLISH NOW"
        })
      });

      // no-cors não permite confirmar gravação.
      return { sent: true };

    } catch (error) {
      console.warn(
        "[Google Sheets] Falha no envio:",
        error
      );
      return { sent: false };
    }
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
      if (value.trim().length < 3) {
        return "O nome precisa ter pelo menos 3 letras.";
      }
      return "";
    },

    email(value) {
      if (!value.trim()) return "Informe seu e-mail.";
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(
        value.trim()
      )) {
        return "Digite um e-mail válido.";
      }
      return "";
    },

    phone(value) {
      const digits = value.replace(/\D/g, "");
      if (!digits) return "Informe seu WhatsApp.";
      if (digits.length < 10) {
        return "Digite o número com DDD.";
      }
      return "";
    },

    level(value) {
      return value ? "" : "Selecione seu nível.";
    }
  };

  function setError(field, message) {
    const errorEl = $(
      `[data-error-for="${field.name}"]`
    );
    if (!errorEl) return;

    if (message) {
      errorEl.textContent = message;
      errorEl.classList.add("is-active");
      field.setAttribute("aria-invalid", "true");
      field.setAttribute(
        "aria-describedby",
        `err-${field.name}`
      );
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

  if (form && submitBtn) {
    const fields = [
      "name", "email", "phone", "level"
    ].map(name => form.elements[name]).filter(Boolean);

    const allFilled = () =>
      fields.every(field =>
        String(field.value).trim() !== ""
      );

    function updateSubmitState() {
      submitBtn.disabled =
        form.dataset.submitting === "true" || !allFilled();
    }

    function getData() {
      return {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim(),
        level: form.elements.level.value,
        levelLabel:
          form.elements.level.options[
            form.elements.level.selectedIndex
          ]?.text || "Não informado"
      };
    }

    function buildMessage(data) {
      return [
        "Olá, Professor Nicolas! Quero agendar uma aula de inglês.",
        "",
        `Nome: ${data.name}`,
        `E-mail: ${data.email}`,
        `WhatsApp: ${data.phone}`,
        `Nível: ${data.levelLabel}`,
        "",
        "Solicitação enviada pelo site ENGLISH NOW."
      ].join("\n");
    }

    function clearErrors() {
      fields.forEach(field => setError(field, ""));

      $$(".field__error", form).forEach(el => {
        el.textContent = "";
        el.classList.remove("is-active");
      });
    }

    fields.forEach(field => {
      field.addEventListener("input", updateSubmitState);
      field.addEventListener("change", updateSubmitState);

      field.addEventListener("blur", () => {
        if (field.value) validateField(field);
      });

      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") {
          validateField(field);
        }
      });
    });

    form.addEventListener("focusin", updateSubmitState);
    window.addEventListener("load", updateSubmitState);
    setTimeout(updateSubmitState, 600);
    updateSubmitState();

    form.addEventListener("submit", async e => {
      e.preventDefault();

      if (form.dataset.submitting === "true") return;

      let firstInvalid = null;

      fields.forEach(field => {
        if (!validateField(field) && !firstInvalid) {
          firstInvalid = field;
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      form.dataset.submitting = "true";
      updateSubmitState();

      const data = getData();
      const message = buildMessage(data);
      const subject =
        `Nova solicitação de aula — ${data.name}`;

      const whatsappUrl =
        `https://wa.me/${WHATSAPP_NUMBER}?text=` +
        encodeURIComponent(message);

      const mailtoUrl =
        `mailto:${CONTACT_EMAIL}?subject=` +
        encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(message);

      if (waFallback) waFallback.href = whatsappUrl;
      if (emailFallback) emailFallback.href = mailtoUrl;

      // Abre WhatsApp
      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      );

      // Primeiro: envia para Google Sheets
      if (saveStatus) {
        saveStatus.textContent =
          "Enviando cadastro para a planilha...";
        saveStatus.dataset.state = "loading";
      }

      const result = await saveLead(data);

      if (saveStatus) {
        saveStatus.textContent = result.sent
          ? "Cadastro enviado. Confira a planilha para confirmar."
          : "Não foi possível enviar o cadastro à planilha.";
        saveStatus.dataset.state =
          result.sent ? "warn" : "error";
      }

      // Depois: solicita envio por e-mail
      let emailRequested = false;

      if (emailRelay) {
        const setRelay = (name, value) => {
          const input = emailRelay.querySelector(
            `[name="${name}"]`
          );
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
          if (emailStatus) {
            emailStatus.textContent =
              "Não foi possível solicitar o envio do e-mail.";
          }
        }
      }

      form.reset();
      clearErrors();
      form.dataset.submitting = "false";
      updateSubmitState();

      if (emailStatus) {
        if (emailRequested) {
          emailStatus.textContent =
            `Envio por e-mail solicitado para ${CONTACT_EMAIL}.`;
        } else if (!emailRelay) {
          emailStatus.textContent =
            "Use o botão Enviar por e-mail, se necessário.";
        }
      }

      if (successBox) {
        successBox.hidden = false;
        successBox.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center"
        });
      }
    });
  }

  // 9. Ano atual no rodapé
  const yearEl = $("#year");

  if (yearEl) {
    yearEl.textContent =
      String(new Date().getFullYear());
  }
})();
