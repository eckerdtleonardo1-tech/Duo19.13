import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "duo_session";

function decodeJwt(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/** Manda al login recordando a dónde quería entrar el usuario. */
function redirectToLogin(request: NextRequest, clearCookie: boolean) {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);

  const response = NextResponse.redirect(url);
  if (clearCookie) {
    // Si la cookie está vencida o rota, borrarla evita que el header siga
    // mostrando al usuario como logueado mientras el servidor lo rechaza.
    response.cookies.delete(SESSION_COOKIE);
  }
  return response;
}

export default function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? decodeJwt(token) : null;

  if (!payload) {
    return redirectToLogin(request, Boolean(token));
  }

  // Este chequeo es optimista y no valida la firma (el Edge no tiene el secreto):
  // cada route handler vuelve a verificarla server-side. Pero mirar `exp` acá
  // evita dejar pasar una sesión vencida para que la página la rebote después.
  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return redirectToLogin(request, true);
  }

  if (request.nextUrl.pathname.startsWith("/admin") && !payload.isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Las dos formas: `/x/:path*` por sí sola no siempre matchea la ruta pelada.
  matcher: ["/admin", "/admin/:path*", "/my-orders", "/my-orders/:path*"],
};
