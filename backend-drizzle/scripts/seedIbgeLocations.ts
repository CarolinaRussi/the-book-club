import "dotenv/config";
import { sql } from "drizzle-orm";
import { db, pool } from "../db/client";
import { city, state } from "../db/schema";

const IBGE_STATES_URL =
  "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome";
const IBGE_CITIES_URL =
  "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome";
const MUNICIPALITY_COORDINATES_CSV_URL =
  "https://raw.githubusercontent.com/kelvins/Municipios-Brasileiros/main/csv/municipios.csv";

const CITY_INSERT_BATCH_SIZE = 500;

type CitySeedRow = { id: number; name: string; stateId: number };

type IbgeState = {
  id: number;
  sigla: string;
  nome: string;
};

type IbgeCity = {
  id: number;
  nome: string;
  microrregiao?: {
    mesorregiao?: {
      UF?: {
        id: number;
      };
    };
  } | null;
  "regiao-imediata"?: {
    "regiao-intermediaria"?: {
      UF?: {
        id: number;
      };
    };
  } | null;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Falha ao buscar IBGE (${response.status} ${response.statusText}): ${url}`,
    );
  }
  return (await response.json()) as T;
}

function resolveStateId(cityRow: IbgeCity): number | null {
  const fromMicro = cityRow.microrregiao?.mesorregiao?.UF?.id;
  if (typeof fromMicro === "number") {
    return fromMicro;
  }
  const fromImmediate = cityRow["regiao-imediata"]?.["regiao-intermediaria"]?.UF?.id;
  return typeof fromImmediate === "number" ? fromImmediate : null;
}

async function seedStates(ibgeStates: IbgeState[]) {
  const rows = ibgeStates.map((ibgeState) => ({
    id: ibgeState.id,
    code: ibgeState.sigla.toUpperCase(),
    name: ibgeState.nome,
  }));

  await db
    .insert(state)
    .values(rows)
    .onConflictDoUpdate({
      target: state.id,
      set: {
        code: sql`excluded.code`,
        name: sql`excluded.name`,
      },
    });

  console.log(`UFs: ${rows.length} upserted`);
}

async function seedCities(
  ibgeCities: IbgeCity[],
  validStateIds: Set<number>,
): Promise<CitySeedRow[]> {
  const rows: CitySeedRow[] = [];
  let skipped = 0;

  for (const ibgeCity of ibgeCities) {
    const stateId = resolveStateId(ibgeCity);
    if (stateId === null || !validStateIds.has(stateId)) {
      skipped += 1;
      continue;
    }
    rows.push({
      id: ibgeCity.id,
      name: ibgeCity.nome,
      stateId,
    });
  }

  for (let offset = 0; offset < rows.length; offset += CITY_INSERT_BATCH_SIZE) {
    const batch = rows.slice(offset, offset + CITY_INSERT_BATCH_SIZE);
    await db
      .insert(city)
      .values(batch)
      .onConflictDoUpdate({
        target: city.id,
        set: {
          name: sql`excluded.name`,
          stateId: sql`excluded.state_id`,
        },
      });
    console.log(
      `Municípios: ${Math.min(offset + batch.length, rows.length)}/${rows.length}`,
    );
  }

  if (skipped > 0) {
    console.warn(`Municípios ignorados (sem UF válida): ${skipped}`);
  }

  return rows;
}

function parseMunicipalityCoordinates(
  csv: string,
): Map<number, { latitude: number; longitude: number }> {
  const lines = csv.trim().split(/\r?\n/);
  const header = lines[0] ?? "";
  if (!header.includes("codigo_ibge") || !header.includes("latitude")) {
    throw new Error("CSV de coordenadas com cabeçalho inesperado");
  }

  const coordsById = new Map<number, { latitude: number; longitude: number }>();
  for (const line of lines.slice(1)) {
    const parts = line.split(",");
    if (parts.length < 4) {
      continue;
    }
    const id = Number(parts[0]);
    const latitude = Number(parts[2]);
    const longitude = Number(parts[3]);
    if (
      !Number.isInteger(id) ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      continue;
    }
    coordsById.set(id, { latitude, longitude });
  }
  return coordsById;
}

async function seedCityCoordinates(cityRows: CitySeedRow[]) {
  console.log("Baixando coordenadas dos municípios…");
  const csv = await fetchText(MUNICIPALITY_COORDINATES_CSV_URL);
  const coordsById = parseMunicipalityCoordinates(csv);

  const rowsWithCoords = [];
  let missing = 0;
  for (const cityRow of cityRows) {
    const coords = coordsById.get(cityRow.id);
    if (!coords) {
      missing += 1;
      continue;
    }
    rowsWithCoords.push({
      ...cityRow,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  }

  for (
    let offset = 0;
    offset < rowsWithCoords.length;
    offset += CITY_INSERT_BATCH_SIZE
  ) {
    const batch = rowsWithCoords.slice(offset, offset + CITY_INSERT_BATCH_SIZE);
    await db
      .insert(city)
      .values(batch)
      .onConflictDoUpdate({
        target: city.id,
        set: {
          latitude: sql`excluded.latitude`,
          longitude: sql`excluded.longitude`,
        },
      });
    console.log(
      `Coordenadas: ${Math.min(offset + batch.length, rowsWithCoords.length)}/${rowsWithCoords.length}`,
    );
  }

  if (missing > 0) {
    console.warn(`Municípios sem coordenada no CSV: ${missing}`);
  }
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Falha ao buscar coordenadas (${response.status} ${response.statusText}): ${url}`,
    );
  }
  return await response.text();
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL não definida no .env");
    process.exit(1);
  }

  console.log("Baixando UFs do IBGE…");
  const ibgeStates = await fetchJson<IbgeState[]>(IBGE_STATES_URL);
  await seedStates(ibgeStates);

  const validStateIds = new Set(ibgeStates.map((ibgeState) => ibgeState.id));

  console.log("Baixando municípios do IBGE…");
  const ibgeCities = await fetchJson<IbgeCity[]>(IBGE_CITIES_URL);
  const cityRows = await seedCities(ibgeCities, validStateIds);
  await seedCityCoordinates(cityRows);

  console.log("Seed IBGE concluído.");
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await pool.end();
    process.exit(1);
  });
