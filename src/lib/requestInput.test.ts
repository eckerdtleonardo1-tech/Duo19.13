import { describe, expect, it } from "vitest";
import { MAX_EMAIL_LENGTH, readEmail, readPassword, readText } from "@/lib/requestInput";

describe("readEmail", () => {
  it("acepta direcciones normales", () => {
    expect(readEmail("hola@gmail.com")).toBe("hola@gmail.com");
    expect(readEmail("nombre.apellido+etiqueta@sub.dominio.com.ar")).toBe(
      "nombre.apellido+etiqueta@sub.dominio.com.ar"
    );
  });

  it("normaliza espacios y mayúsculas", () => {
    expect(readEmail("  Hola@Gmail.COM  ")).toBe("hola@gmail.com");
  });

  // El caso real que dejaba entrar el registro: se creaba una cuenta que nunca
  // iba a poder recibir el mail del pedido ni recuperar la contraseña.
  it("rechaza texto que no es una dirección", () => {
    expect(readEmail("esto-no-es-un-mail")).toBeNull();
    expect(readEmail("sin-arroba.com")).toBeNull();
    expect(readEmail("@sindestinatario.com")).toBeNull();
    expect(readEmail("sindominio@")).toBeNull();
    expect(readEmail("sin@tld")).toBeNull();
    expect(readEmail("con espacio@gmail.com")).toBeNull();
    expect(readEmail("")).toBeNull();
    expect(readEmail("   ")).toBeNull();
  });

  // Con `body.email.trim()` directo, esto tiraba 500 en vez de contestar 400.
  it("rechaza cualquier cosa que no sea texto", () => {
    expect(readEmail(12345)).toBeNull();
    expect(readEmail({ email: "a@b.com" })).toBeNull();
    expect(readEmail(["a@b.com"])).toBeNull();
    expect(readEmail(null)).toBeNull();
    expect(readEmail(undefined)).toBeNull();
    expect(readEmail(true)).toBeNull();
  });

  it("rechaza direcciones más largas que el máximo del RFC", () => {
    const largo = "a".repeat(MAX_EMAIL_LENGTH) + "@gmail.com";
    expect(readEmail(largo)).toBeNull();
  });
});

describe("readText", () => {
  it("devuelve el texto recortado", () => {
    expect(readText("  Leonardo  ", 100)).toBe("Leonardo");
  });

  it("rechaza vacíos y espacios solos", () => {
    expect(readText("", 100)).toBeNull();
    expect(readText("     ", 100)).toBeNull();
  });

  it("rechaza lo que se pasa del tope", () => {
    expect(readText("a".repeat(101), 100)).toBeNull();
    expect(readText("a".repeat(100), 100)).toBe("a".repeat(100));
  });

  it("rechaza lo que no es texto", () => {
    expect(readText(42, 100)).toBeNull();
    expect(readText({}, 100)).toBeNull();
    expect(readText(null, 100)).toBeNull();
  });
});

describe("readPassword", () => {
  it("acepta una contraseña dentro del rango", () => {
    expect(readPassword("12345678", 8, 128)).toBe("12345678");
  });

  // A diferencia de readText, no recorta: los espacios son parte de la
  // contraseña y sacarlos cambiaría lo que el usuario escribió.
  it("no recorta espacios", () => {
    expect(readPassword("  con espacios  ", 8, 128)).toBe("  con espacios  ");
  });

  it("rechaza fuera de rango", () => {
    expect(readPassword("corta", 8, 128)).toBeNull();
    expect(readPassword("a".repeat(129), 8, 128)).toBeNull();
  });

  it("rechaza lo que no es texto", () => {
    expect(readPassword(12345678, 8, 128)).toBeNull();
    expect(readPassword(null, 8, 128)).toBeNull();
  });
});
