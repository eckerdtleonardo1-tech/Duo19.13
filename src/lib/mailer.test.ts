import { describe, expect, it } from "vitest";
import {
  buildEmailVerificationEmail,
  buildNewOrderNotice,
  buildOrderConfirmationEmail,
  buildPasswordResetEmail,
} from "@/lib/mailer";

const NOMBRE_HOSTIL = '<img src=x onerror="alert(1)">Juan';

describe("escapado de HTML en los mails", () => {
  it("un nombre con etiquetas no se inyecta en el mail de recuperación", () => {
    const { html } = buildPasswordResetEmail(NOMBRE_HOSTIL, "https://x.test/r?token=abc");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img");
  });

  it("el nombre de un producto con etiquetas tampoco", () => {
    const { html } = buildOrderConfirmationEmail({
      orderId: 1,
      customerName: "Ana",
      items: [{ name: '<b>Teclado</b>', quantity: 1, subtotal: 1000 }],
      subtotal: 1000,
      shippingLabel: "Envío a domicilio",
      shippingCost: 500,
      shippingToArrange: false,
      total: 1500,
      deliveryLines: ["Calle 1"],
      whatsappUrl: "https://wa.me/1",
    });
    expect(html).not.toContain("<b>Teclado</b>");
    expect(html).toContain("&lt;b&gt;");
  });

  it("el aviso interno de venta también escapa el nombre del cliente", () => {
    const { html } = buildNewOrderNotice({
      orderId: 9,
      customerName: NOMBRE_HOSTIL,
      customerPhone: "3329000000",
      customerEmail: null,
      items: [{ name: "Mouse", quantity: 1, subtotal: 100 }],
      total: 100,
      shippingLabel: "Envío a domicilio",
      deliveryLines: ["Calle 1"],
      adminUrl: "https://x.test/admin/orders",
    });
    expect(html).not.toContain("<img src=x");
  });
});

describe("contenido de los mails", () => {
  it("el de recuperación lleva el link tal cual, para poder copiarlo", () => {
    const url = "https://x.test/reset-password?token=abc123";
    const { text, html } = buildPasswordResetEmail("Ana", url);
    expect(text).toContain(url);
    expect(html).toContain(url);
  });

  it("el de verificación avisa que vence", () => {
    const { text } = buildEmailVerificationEmail("Ana", "https://x.test/verify?token=z");
    expect(text).toContain("48 horas");
  });

  it("la confirmación con envío cotizado muestra el total a pagar", () => {
    const { text } = buildOrderConfirmationEmail({
      orderId: 1,
      customerName: "Ana",
      items: [{ name: "Teclado", quantity: 1, subtotal: 1000 }],
      subtotal: 1000,
      shippingLabel: "Envío a domicilio",
      shippingCost: 500,
      shippingToArrange: false,
      total: 1500,
      deliveryLines: ["Calle 1"],
      whatsappUrl: "https://wa.me/1",
    });
    expect(text).toContain("Total:");
    expect(text).not.toContain("a convenir");
  });

  it("con envío a convenir no dice 'sin cargo' ni promete un total cerrado", () => {
    const { text, html } = buildOrderConfirmationEmail({
      orderId: 1,
      customerName: "Ana",
      items: [{ name: "Silla", quantity: 1, subtotal: 350000 }],
      subtotal: 350000,
      shippingLabel: "Envío a domicilio",
      shippingCost: 0,
      shippingToArrange: true,
      total: 350000,
      deliveryLines: ["Calle 1"],
      whatsappUrl: "https://wa.me/1",
    });
    expect(text).toContain("a convenir");
    expect(text).toContain("Total sin envío");
    expect(text).not.toContain("sin cargo");
    expect(html).toContain("A convenir");
    expect(html).not.toContain("Sin cargo");
  });
});
