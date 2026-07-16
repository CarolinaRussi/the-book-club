import * as locationRepository from "../repositories/locationRepository";

export async function listStates() {
  return locationRepository.findAllStates();
}

export async function listCitiesByStateId(
  stateId: number,
  searchQuery?: string,
) {
  const stateRow = await locationRepository.findStateById(stateId);
  if (!stateRow) {
    return null;
  }
  return locationRepository.findCitiesByStateId(stateId, searchQuery);
}
