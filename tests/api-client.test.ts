import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { request, ApiError } from "@/lib/api/client";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("contratos e erros da API", () => {
  it("não considera resposta incompleta um sucesso", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ wrong: true }), { status: 200 }),
        ),
    );
    await expect(
      request("/hotel/1", z.object({ name: z.string() })),
    ).rejects.toThrow("incompletos ou inválidos");
  });
  it("preserva status 404 para distinguir ausência de falha transitória", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 404 })),
    );
    await expect(
      request("/bookings/999", z.object({ id: z.number() })),
    ).rejects.toMatchObject({ status: 404 });
  });
  it("marca envio sem resposta como incerto e não repete a requisição", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
    const fetch = vi.fn().mockRejectedValue(new TypeError("Network error"));
    vi.stubGlobal("fetch", fetch);
    await expect(
      request("/bookings", z.object({ id: z.number() }), { method: "POST" }),
    ).rejects.toMatchObject({ uncertain: true });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("recusa total ausente ou inválido em uma consulta paginada", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("[]", { status: 200 })),
    );
    await expect(
      request("/hotels?_page=1&_limit=10", z.array(z.unknown())),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
