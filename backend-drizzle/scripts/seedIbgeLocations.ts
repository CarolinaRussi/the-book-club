import "dotenv/config";
import { sql } from "drizzle-orm";
import { db, pool } from "../db/client";
import { city, state } from "../db/schema";

const IBGE_STATES_URL =
  "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome";
const IBGE_CITIES_URL =
  "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome";

const CITY_INSERT_BATCH_SIZE = 500;

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

async function seedCities(ibgeCities: IbgeCity[], validStateIds: Set<number>) {
  const rows: { id: number; name: string; stateId: number }[] = [];
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
  await seedCities(ibgeCities, validStateIds);

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
