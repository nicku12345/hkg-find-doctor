export const HKG_DC_DISTRICTS_TC = [
    "中西區",
    "灣仔區",
    "東區",
    "南區",
    "油尖旺區",
    "深水埗區",
    "九龍城區",
    "黃大仙區",
    "觀塘區",
    "荃灣區",
    "屯門區",
    "元朗區",
    "北區",
    "大埔區",
    "西貢區",
    "沙田區",
    "葵青區",
    "離島區",
]

type MapLocationDesc = {
    buildingName?: string,

    blockDescriptor?: string,
    blockNo?: string,

    estateName?: string,
    estatePhaseName?: string,

    villageLocationName?: string,
    villageName?: string,
    villageBuildingNoFrom?: string,
    villageBuildingNoTo?: string,

    streetLocationName?: string,
    streetName?: string,
    streetBuildingNoFrom?: string,
    streetBuildingNoTo?: string,

    dcDistrict: string,
}

// specification follows https://www.als.gov.hk/docs/Data_Specification_for_ALS_GeoJSON_TC.pdf
export type MapLocationFull = {
    latitude: number,
    longitude: number,

    tc: MapLocationDesc,
    en: MapLocationDesc
}

export type MapLocation = {
    latitude: number,
    longitude: number,

    descTC: string,
    descEN: string,

    suppDescTC: string,
    suppDescEN: string,
}

const getBuildingDesc = (x: MapLocationDesc): string => {
    const block = [x.blockNo, x.blockDescriptor]
        .filter(x => x !== undefined)
        .join("")
        .trim()

    if (getEstateDesc(x) !== "" && x.buildingName !== undefined) {
        return [getEstateDesc(x), x.buildingName, block]
            .filter(x => x !== undefined)
            .join(" ")
            .trim()
    }

    return [x.buildingName ?? getEstateDesc(x), block]
        .filter(x => x !== undefined)
        .join(" ")
        .trim()
}

const getEstateDesc = (x: MapLocationDesc): string => {
    return [x.estateName, x.estatePhaseName]
        .filter(x => x !== undefined)
        .join(" ")
        .trim()
}

const getStreetDesc = (x: MapLocationDesc): string => {
    const streetName = x.streetName
    const streetBuildingNo = [x.streetBuildingNoFrom, x.streetBuildingNoTo].filter(x => x !== undefined).join(" - ")
    return [streetName, streetBuildingNo]
        .filter(x => x !== undefined)
        .join(" ")
        .trim()
}

const getVillageDesc = (x: MapLocationDesc): string => {
    const villageName = x.villageName
    const villageBuildingNo = [x.villageBuildingNoFrom, x.villageBuildingNoTo].filter(x => x !== undefined).join(" - ")
    return [villageName, villageBuildingNo]
        .filter(x => x !== undefined)
        .join(" ")
        .trim()
}

const getDistrictDesc = (x: MapLocationDesc): string => {
    return x.dcDistrict
}

const getMapLocation = (x: MapLocationFull): MapLocation => {

    let descTC;
    let descEN;
    if (getBuildingDesc(x.tc) !== "" && getBuildingDesc(x.en) !== "") {
        descTC = getBuildingDesc(x.tc)
        descEN = getBuildingDesc(x.en)
    } else if (getEstateDesc(x.tc) !== "" && getEstateDesc(x.en) !== "") {
        descTC = getEstateDesc(x.tc)
        descEN = getEstateDesc(x.en)
    } else if (getVillageDesc(x.tc) !== "" && getVillageDesc(x.en) !== "") {
        descTC = getVillageDesc(x.tc)
        descEN = getVillageDesc(x.en)
    } else if (getStreetDesc(x.tc) !== "" && getStreetDesc(x.en) !== "") {
        descTC = getStreetDesc(x.tc)
        descEN = getStreetDesc(x.en)
    } else {
        descTC = "UNKNOWN LOCATION"
        descEN = "UNKNOWN LOCATION"
    }

    return {
        latitude: x.latitude,
        longitude: x.longitude,

        descTC: descTC,
        descEN: descEN,

        suppDescTC: getDistrictDesc(x.tc),
        suppDescEN: getDistrictDesc(x.en),
    }
}

export const getSuggestedMapLocations = async (query: string): Promise<MapLocation[]> => {
    if (query === "") {
        return []
    }

    const api = `https://www.als.gov.hk/lookup?q=${query}&n=20`

    // refer to the doc https://www.als.gov.hk/docs/Data_Dictionary_for_ALS_TC-v3.2.pdf
    const res = await fetch(api, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en,zh-Hant',
        }
    })
    const locations = await res.json()

    // schema follows https://www.als.gov.hk/lookup?q=Kwai%20Chung&n=20
    const uniqueDescTC = new Set() // use descTC as key to dedup
    return locations
        .SuggestedAddress
        ?.map((x: typeof locations.SuggestedAddress): MapLocationFull => {
            return {
                latitude: x.Address.PremisesAddress.GeospatialInformation.Latitude,
                longitude: x.Address.PremisesAddress.GeospatialInformation.Longitude,

                // CHINESE
                tc: {
                    buildingName: x.Address.PremisesAddress.ChiPremisesAddress.BuildingName,
    
                    blockDescriptor: x.Address.PremisesAddress.ChiPremisesAddress.ChiBlock?.BlockDescriptor,
                    blockNo: x.Address.PremisesAddress.ChiPremisesAddress.ChiBlock?.BlockNo,
    
                    estateName: x.Address.PremisesAddress.ChiPremisesAddress.ChiEstate?.EstateName,
                    estatePhaseName: x.Address.PremisesAddress.ChiPremisesAddress.ChiEstate?.ChiPhase?.PhaseName,
    
                    villageLocationName: x.Address.PremisesAddress.ChiPremisesAddress.ChiVillage?.LocationName,
                    villageName: x.Address.PremisesAddress.ChiPremisesAddress.ChiVillage?.VillageName,
                    villageBuildingNoFrom: x.Address.PremisesAddress.ChiPremisesAddress.ChiVillage?.BuildingNoFrom,
                    villageBuildingNoTo: x.Address.PremisesAddress.ChiPremisesAddress.ChiVillage?.BuildingNoTo,
    
                    streetLocationName: x.Address.PremisesAddress.ChiPremisesAddress.ChiStreet?.LocationName,
                    streetName: x.Address.PremisesAddress.ChiPremisesAddress.ChiStreet?.StreetName,
                    streetBuildingNoFrom: x.Address.PremisesAddress.ChiPremisesAddress.ChiStreet?.BuildingNoFrom,
                    streetBuildingNoTo: x.Address.PremisesAddress.ChiPremisesAddress.ChiStreet?.BuildingNoTo,
    
                    dcDistrict: x.Address.PremisesAddress.ChiPremisesAddress.ChiDistrict?.DcDistrict,
                },

                // ENGLISH
                en: {
                    buildingName: x.Address.PremisesAddress.EngPremisesAddress.BuildingName,

                    blockDescriptor: x.Address.PremisesAddress.EngPremisesAddress.EngBlock?.BlockDescriptor,
                    blockNo: x.Address.PremisesAddress.EngPremisesAddress.EngBlock?.BlockNo,

                    estateName: x.Address.PremisesAddress.EngPremisesAddress.EngEstate?.EstateName,
                    estatePhaseName: x.Address.PremisesAddress.EngPremisesAddress.EngEstate?.EngPhase?.PhaseName,

                    villageLocationName: x.Address.PremisesAddress.EngPremisesAddress.EngVillage?.LocationName,
                    villageName: x.Address.PremisesAddress.EngPremisesAddress.EngVillage?.VillageName,
                    villageBuildingNoFrom: x.Address.PremisesAddress.EngPremisesAddress.EngVillage?.BuildingNoFrom,
                    villageBuildingNoTo: x.Address.PremisesAddress.EngPremisesAddress.EngVillage?.BuildingNoTo,

                    streetLocationName: x.Address.PremisesAddress.EngPremisesAddress.EngStreet?.LocationName,
                    streetName: x.Address.PremisesAddress.EngPremisesAddress.EngStreet?.StreetName,
                    streetBuildingNoFrom: x.Address.PremisesAddress.EngPremisesAddress.EngStreet?.BuildingNoFrom,
                    streetBuildingNoTo: x.Address.PremisesAddress.EngPremisesAddress.EngStreet?.BuildingNoTo,

                    dcDistrict: x.Address.PremisesAddress.EngPremisesAddress.EngDistrict?.DcDistrict,
                }
            }
        })
        .map(getMapLocation)
        .filter(({ descTC }: MapLocation) => {
            if (uniqueDescTC.has(descTC))
                return false

            uniqueDescTC.add(descTC)
            return true
        })
        ?? []
}