// @vitest-environment node
import { afterAll, beforeAll, expect, it } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getHotels } from "@/features/hotels/api";
import { filterSchema } from "@/features/search/model";

const root = fileURLToPath(new URL("../", import.meta.url));
let fixture: string;
let entry: string;
let processHandle: ChildProcess | undefined;
let base: string;

async function start(args: string[], environment: Record<string, string>) {
  const port = await new Promise<number>((resolve, reject) => {
    const socket = createServer();
    socket.once("error", reject);
    socket.listen(0, "127.0.0.1", () => {
      const address = socket.address();
      if (!address || typeof address === "string")
        throw new Error("Porta indisponível");
      socket.close(() => resolve(address.port));
    });
  });
  const flags = args.length ? ["--port", String(port), ...args] : [];
  processHandle = spawn(process.execPath, [entry, ...flags], {
    cwd: tmpdir(),
    env: {
      ...process.env,
      ...environment,
      ...(args.length ? {} : { PORT: String(port) }),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const child = processHandle;
  await new Promise<void>((resolve, reject) => {
    let output = "";
    const timer = setTimeout(
      () => reject(new Error(`Servidor não iniciou: ${output}`)),
      10000
    );
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Servidor encerrou (${code}): ${output}`));
    });
    child.stderr?.on("data", (chunk) => {
      output += String(chunk);
    });
    child.stdout?.on("data", (chunk) => {
      output += String(chunk);
      if (output.includes("Mock API em")) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
  base = `http://127.0.0.1:${port}`;
}

async function stop() {
  const child = processHandle;
  if (!child || child.exitCode !== null) return;
  await new Promise<void>((resolve) => {
    child.once("exit", () => resolve());
    child.kill();
  });
  processHandle = undefined;
}

beforeAll(async () => {
  // A cópia executa o mesmo servidor, com dados isolados e resolução pela instalação raiz.
  const source = join(root, "scripts", "mock-api.mjs");
  await readFile(source);
  await mkdir(join(root, ".cache"), { recursive: true });
  fixture = await mkdtemp(join(root, ".cache", "mock-api-test-"));
  entry = join(fixture, "scripts", "mock-api.mjs");
  await mkdir(dirname(entry));
  await mkdir(join(fixture, "mock-api"));
  await copyFile(source, entry);
  await copyFile(
    join(root, "mock-api", "db.seed.json"),
    join(fixture, "mock-api", "db.seed.json")
  );
  await start(["--host", "127.0.0.1", "--delay", "0", "--fail-rate", "0"], {
    PORT: "9",
    HOST: "invalid.local",
    DELAY: "9999",
    FAIL_RATE: "1",
  });
}, 15000);

afterAll(async () => {
  await stop();
  if (fixture && dirname(fixture) === join(root, ".cache"))
    await rm(fixture, { recursive: true, force: true });
});

it("inicia fora do diretório do projeto e mantém autocomplete sem acentos, paginação e vínculos", async () => {
  const suggestions = await fetch(`${base}/suggestions?q=sao`).then(
    (response) => response.json()
  );
  expect(suggestions).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "São Paulo, SP" })])
  );
  const page = await fetch(
    `${base}/hotels?destination=${encodeURIComponent("São Paulo, SP")}&_page=1&_limit=10`
  );
  expect(page.headers.get("X-Total-Count")).toBe("14");
  expect(await page.json()).toHaveLength(10);
  const hotel = await fetch(`${base}/hotels/1`).then((response) =>
    response.json()
  );
  expect(hotel).toMatchObject({ id: 1, name: "Hotel Copacabana Palace" });
  const rooms = await fetch(`${base}/rooms?hotelId=1`).then((response) =>
    response.json()
  );
  expect(rooms.length).toBeGreaterThan(0);
  expect(rooms.every((room: { hotelId: number }) => room.hotelId === 1)).toBe(
    true
  );
  expect((await fetch(`${base}/hotels/99999`)).status).toBe(404);
});

it("preserva falha e atraso por requisição", async () => {
  const failure = await fetch(`${base}/hotels/1?_fail=1`);
  expect(failure.status).toBe(500);
  expect(await failure.json()).toEqual({
    error: "Falha simulada pela mock API",
  });
  const before = performance.now();
  expect((await fetch(`${base}/suggestions?_delay=100`)).status).toBe(200);
  expect(performance.now() - before).toBeGreaterThanOrEqual(90);
});

it("combina comodidades exatas e propriedades antes de ordenar, contar e paginar", async () => {
  const previous = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = base;
  try {
    const all = await fetch(
      `${base}/hotels?destination=${encodeURIComponent("São Paulo, SP")}`
    ).then((r) => r.json());
    const expected = all
      .filter(
        (h: {
          amenities: string[];
          propertyType: string;
          pricePerNight: number;
          rating: number;
        }) =>
          h.amenities.includes("wifi") &&
          h.amenities.includes("pool") &&
          ["hotel", "pousada"].includes(h.propertyType) &&
          h.pricePerNight >= 200 &&
          h.rating >= 3
      )
      .sort(
        (a: { pricePerNight: number }, b: { pricePerNight: number }) =>
          a.pricePerNight - b.pricePerNight
      );
    expect(expected.length).toBeGreaterThan(0);
    const result = await getHotels(
      {
        destination: "São Paulo, SP",
        checkIn: "2099-01-01",
        checkOut: "2099-01-03",
        adults: 2,
        children: 0,
        rooms: 1,
      },
      filterSchema.parse({
        amenities: ["wifi", "pool"],
        propertyTypes: ["hotel", "pousada"],
        minPrice: 200,
        rating: 3,
      })
    );
    expect(result.total).toBe(expected.length);
    expect(result.data.map((h) => h.id)).toEqual(
      expected.slice(0, 10).map((h: { id: number }) => h.id)
    );
    const noAircon = await getHotels(
      {
        destination: "São Paulo, SP",
        checkIn: "2099-01-01",
        checkOut: "2099-01-03",
        adults: 2,
        children: 0,
        rooms: 1,
      },
      filterSchema.parse({ amenities: ["aircon"] })
    );
    expect(noAircon.total).toBe(0);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = previous;
  }
});

it("não aceita correspondência parcial de comodidade e mantém o total na segunda página", async () => {
  const previous = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = base;
  const search = {
    destination: "São Paulo, SP",
    checkIn: "2099-01-01",
    checkOut: "2099-01-03",
    adults: 2,
    children: 0,
    rooms: 1,
  };
  const all = await fetch(
    `${base}/hotels?destination=${encodeURIComponent(search.destination)}`
  ).then((r) => r.json());
  const fixtureId = 10001;
  try {
    const created = await fetch(`${base}/hotels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...all[0],
        id: fixtureId,
        amenities: ["wifi_extra", "pool"],
        pricePerNight: 1,
      }),
    });
    expect(created.status).toBe(201);
    const exact = await getHotels(
      search,
      filterSchema.parse({ amenities: ["wifi", "pool"] })
    );
    expect(exact.data.some((h) => h.id === fixtureId)).toBe(false);
    const expected = all
      .filter((h: { amenities: string[] }) => h.amenities.includes("wifi"))
      .sort(
        (a: { pricePerNight: number }, b: { pricePerNight: number }) =>
          a.pricePerNight - b.pricePerNight
      );
    const second = await getHotels(
      search,
      filterSchema.parse({
        amenities: ["wifi"],
        propertyTypes: ["hotel", "pousada", "resort"],
        page: 2,
      })
    );
    expect(expected.length).toBeGreaterThan(10);
    expect(second.total).toBe(expected.length);
    expect(second.data.map((h) => h.id)).toEqual(
      expected.slice(10, 20).map((h: { id: number }) => h.id)
    );
  } finally {
    await fetch(`${base}/hotels/${fixtureId}`, { method: "DELETE" });
    if (previous === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = previous;
  }
});

it("cria e consulta reservas, aceita configuração por ambiente e restaura dados ao reiniciar", async () => {
  const response = await fetch(`${base}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      hotelId: 1,
      roomId: 1,
      checkIn: "2099-01-01",
      checkOut: "2099-01-04",
      rooms: 1,
      adults: 2,
      children: 0,
      guests: [],
      totalPrice: 3600,
    }),
  });
  expect(response.status).toBe(201);
  const booking = await response.json();
  expect(
    await fetch(`${base}/bookings/${booking.id}`).then((result) =>
      result.json()
    )
  ).toMatchObject(booking);
  await stop();
  await start([], { HOST: "127.0.0.1", DELAY: "0", FAIL_RATE: "0" });
  expect(
    await fetch(`${base}/bookings`).then((result) => result.json())
  ).toEqual([]);
  await stop();
  await start([], { HOST: "127.0.0.1", DELAY: "0", FAIL_RATE: "1" });
  expect((await fetch(`${base}/hotels`)).status).toBe(500);
}, 15000);
