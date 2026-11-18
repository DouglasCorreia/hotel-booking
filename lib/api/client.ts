import { z } from "zod";

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
    public uncertain = false,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestInit = {},
): Promise<{ data: T; total: number }> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base)
    throw new ApiError(
      "A conexão com o catálogo não foi configurada. Consulte as instruções de execução.",
    );
  const isCreation = options.method === "POST";
  let response: Response;
  try {
    response = await fetch(`${base.replace(/\/$/, "")}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      cache: "no-store",
      signal: options.signal
        ? AbortSignal.any([options.signal, AbortSignal.timeout(12000)])
        : AbortSignal.timeout(12000),
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    console.warn(
      JSON.stringify({
        event: "api_connection_failed",
        method: options.method ?? "GET",
        resource: path.split("?")[0],
      }),
    );
    throw new ApiError(
      isCreation
        ? "Não foi possível confirmar o resultado do envio. Repetir a operação pode criar outra reserva."
        : "Não conseguimos conectar ao catálogo. Verifique se a API está disponível e tente novamente.",
      0,
      isCreation,
    );
  }
  if (!response.ok)
    throw new ApiError(
      response.status === 404
        ? "Registro não encontrado."
        : "O serviço está indisponível no momento. Tente novamente.",
      response.status,
      isCreation && response.status >= 500,
    );
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(
      "O serviço retornou uma resposta inválida.",
      502,
      isCreation,
    );
  }
  const result = schema.safeParse(body);
  if (!result.success)
    throw new ApiError(
      "O serviço retornou dados incompletos ou inválidos.",
      502,
      isCreation,
    );
  const totalHeader = response.headers.get("X-Total-Count");
  const total = Number(totalHeader ?? 0);
  if (
    new URLSearchParams(path.split("?")[1]).has("_page") &&
    (totalHeader === null || !Number.isSafeInteger(total) || total < 0)
  )
    throw new ApiError("O serviço retornou uma paginação inválida.", 502);
  return { data: result.data, total };
}
