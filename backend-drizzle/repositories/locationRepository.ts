import { and, asc, eq, ilike } from "drizzle-orm";
import { db } from "../db/client";
import { city, state } from "../db/schema";

export async function findAllStates() {
  return db
    .select({
      id: state.id,
      code: state.code,
      name: state.name,
    })
    .from(state)
    .orderBy(asc(state.name));
}

export async function findStateById(stateId: number) {
  const [row] = await db
    .select({
      id: state.id,
      code: state.code,
      name: state.name,
    })
    .from(state)
    .where(eq(state.id, stateId))
    .limit(1);
  return row ?? null;
}

export async function findCityById(cityId: number) {
  const [row] = await db
    .select({
      id: city.id,
      name: city.name,
      stateId: city.stateId,
      latitude: city.latitude,
      longitude: city.longitude,
    })
    .from(city)
    .where(eq(city.id, cityId))
    .limit(1);
  return row ?? null;
}

export async function findCitiesByStateId(
  stateId: number,
  searchQuery?: string,
  limit = 1000,
) {
  const filters = [eq(city.stateId, stateId)];
  const trimmedQuery = searchQuery?.trim();
  if (trimmedQuery) {
    filters.push(ilike(city.name, `%${trimmedQuery}%`));
  }

  return db
    .select({
      id: city.id,
      name: city.name,
      stateId: city.stateId,
      latitude: city.latitude,
      longitude: city.longitude,
    })
    .from(city)
    .where(and(...filters))
    .orderBy(asc(city.name))
    .limit(limit);
}
