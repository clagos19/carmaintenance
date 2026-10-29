import type { BodyType } from '../types'

/**
 * Model names sold in Canada from roughly 2000 onward, including discontinued ones.
 * Models with a full spec sheet live in vehicles.ts; the rest get specs from the brand and body style.
 * A ":body" suffix sets the body style where the name alone doesn't make it obvious.
 */
const RAW: Record<string, string> = {
  Acura: 'CL:sedan,CSX:sedan,EL:sedan,ILX:sedan,Integra:hatchback,MDX:suv,NSX:sedan,RDX:suv,RL:sedan,RLX:sedan,RSX:sedan,TL:sedan,TLX:sedan,TSX:sedan,ZDX:suv',
  'Alfa Romeo': 'Giulia:sedan,Stelvio:suv,Tonale:suv,4C:sedan',
  Audi: 'A3:sedan,A4:sedan,A4 Allroad:hatchback,A5:sedan,A6:sedan,A6 Allroad:hatchback,A7:sedan,A8:sedan,e-tron:suv,Q3:suv,Q4 e-tron:suv,Q5:suv,Q7:suv,Q8:suv,R8:sedan,RS 3:sedan,RS 5:sedan,S3:sedan,S4:sedan,S5:sedan,SQ5:suv,TT:sedan',
  BMW: '1 Series:sedan,2 Series:sedan,3 Series:sedan,4 Series:sedan,5 Series:sedan,7 Series:sedan,8 Series:sedan,i3:hatchback,i4:sedan,i5:sedan,i7:sedan,iX:suv,M2:sedan,M3:sedan,M4:sedan,M5:sedan,X1:suv,X2:suv,X3:suv,X4:suv,X5:suv,X6:suv,X7:suv,XM:suv,Z4:sedan',
  Buick: 'Allure:sedan,Cascada:sedan,Enclave:suv,Encore:suv,Encore GX:suv,Envision:suv,Envista:suv,LaCrosse:sedan,Lucerne:sedan,Regal:sedan,Rendezvous:suv,Verano:sedan',
  Cadillac: 'ATS:sedan,CT4:sedan,CT5:sedan,CT6:sedan,CTS:sedan,DTS:sedan,Escalade:suv,Lyriq:suv,SRX:suv,STS:sedan,XT4:suv,XT5:suv,XT6:suv,XTS:sedan',
  Chevrolet: 'Avalanche:truck,Aveo:hatchback,Blazer:suv,Blazer EV:suv,Bolt EUV:hatchback,Bolt EV:hatchback,Camaro:sedan,Captiva:suv,Cobalt:sedan,Colorado:truck,Corvette:sedan,Cruze:sedan,Equinox:suv,Equinox EV:suv,Express:suv,Impala:sedan,Malibu:sedan,Orlando:suv,Silverado 1500:truck,Silverado 2500HD:truck,Silverado 3500HD:truck,Silverado EV:truck,Sonic:hatchback,Spark:hatchback,Suburban:suv,Tahoe:suv,Tracker:suv,Trailblazer:suv,Traverse:suv,Trax:suv,Uplander:suv,Volt:hatchback',
  Chrysler: '200:sedan,300:sedan,Grand Caravan:suv,Pacifica:suv,Pacifica Hybrid:suv,PT Cruiser:hatchback,Sebring:sedan,Town & Country:suv,Voyager:suv',
  Dodge: 'Avenger:sedan,Caliber:hatchback,Challenger:sedan,Charger:sedan,Dakota:truck,Dart:sedan,Durango:suv,Grand Caravan:suv,Hornet:suv,Journey:suv,Nitro:suv,Viper:sedan',
  Fiat: '500:hatchback,500e:hatchback,500L:hatchback,500X:suv',
  Ford: 'Bronco:suv,Bronco Sport:suv,C-Max:hatchback,E-Series:suv,Ecosport:suv,Edge:suv,Escape:suv,Expedition:suv,Explorer:suv,F-150:truck,F-150 Lightning:truck,F-250 Super Duty:truck,F-350 Super Duty:truck,Fiesta:hatchback,Flex:suv,Focus:hatchback,Fusion:sedan,Maverick:truck,Mustang:sedan,Mustang Mach-E:suv,Ranger:truck,Taurus:sedan,Transit:suv,Transit Connect:suv',
  Genesis: 'G70:sedan,G80:sedan,G90:sedan,GV60:suv,GV70:suv,GV80:suv',
  GMC: 'Acadia:suv,Canyon:truck,Envoy:suv,Hummer EV:truck,Savana:suv,Sierra 1500:truck,Sierra 2500HD:truck,Sierra 3500HD:truck,Terrain:suv,Yukon:suv,Yukon XL:suv',
  Honda: 'Accord:sedan,Civic:sedan,Civic Hatchback:hatchback,Civic Type R:hatchback,CR-V:suv,CR-V Hybrid:suv,CR-Z:hatchback,Crosstour:hatchback,Element:suv,Fit:hatchback,HR-V:suv,Insight:sedan,Odyssey:suv,Passport:suv,Pilot:suv,Prologue:suv,Ridgeline:truck,S2000:sedan',
  Hyundai: 'Accent:sedan,Elantra:sedan,Elantra GT:hatchback,Elantra N:sedan,Entourage:suv,Genesis:sedan,Ioniq:hatchback,Ioniq 5:suv,Ioniq 6:sedan,Kona:suv,Kona Electric:suv,Nexo:suv,Palisade:suv,Santa Cruz:truck,Santa Fe:suv,Santa Fe XL:suv,Sonata:sedan,Tiburon:sedan,Tucson:suv,Veloster:hatchback,Venue:suv,Veracruz:suv',
  Infiniti: 'EX35:suv,FX35:suv,G35:sedan,G37:sedan,JX35:suv,Q50:sedan,Q60:sedan,QX30:suv,QX50:suv,QX55:suv,QX60:suv,QX80:suv',
  Jaguar: 'E-Pace:suv,F-Pace:suv,F-Type:sedan,I-Pace:suv,XE:sedan,XF:sedan,XJ:sedan',
  Jeep: 'Cherokee:suv,Commander:suv,Compass:suv,Gladiator:truck,Grand Cherokee:suv,Grand Cherokee L:suv,Grand Cherokee 4xe:suv,Grand Wagoneer:suv,Liberty:suv,Patriot:suv,Renegade:suv,Wagoneer:suv,Wrangler:suv,Wrangler 4xe:suv,Wrangler Unlimited:suv',
  Kia: 'Borrego:suv,Carnival:suv,EV6:suv,EV9:suv,Forte:sedan,Forte5:hatchback,K5:sedan,K900:sedan,Magentis:sedan,Niro:suv,Niro EV:suv,Optima:sedan,Rio:sedan,Rondo:suv,Sedona:suv,Seltos:suv,Sorento:suv,Soul:hatchback,Soul EV:hatchback,Spectra:sedan,Sportage:suv,Stinger:sedan,Telluride:suv',
  'Land Rover': 'Defender:suv,Discovery:suv,Discovery Sport:suv,LR2:suv,LR4:suv,Range Rover:suv,Range Rover Evoque:suv,Range Rover Sport:suv,Range Rover Velar:suv',
  Lexus: 'CT:hatchback,ES:sedan,GS:sedan,GX:suv,IS:sedan,LC:sedan,LS:sedan,LX:suv,NX:suv,RC:sedan,RX:suv,RZ:suv,TX:suv,UX:suv',
  Lincoln: 'Aviator:suv,Continental:sedan,Corsair:suv,MKC:suv,MKS:sedan,MKT:suv,MKX:suv,MKZ:sedan,Nautilus:suv,Navigator:suv,Town Car:sedan',
  Lucid: 'Air:sedan,Gravity:suv',
  Mazda: 'CX-3:suv,CX-30:suv,CX-5:suv,CX-50:suv,CX-7:suv,CX-70:suv,CX-9:suv,CX-90:suv,Mazda2:hatchback,Mazda3:sedan,Mazda3 Sport:hatchback,Mazda5:suv,Mazda6:sedan,MX-30:suv,MX-5 Miata:sedan,RX-8:sedan,Tribute:suv',
  'Mercedes-Benz': 'A-Class:sedan,B-Class:hatchback,C-Class:sedan,CLA:sedan,CLS:sedan,E-Class:sedan,EQB:suv,EQE:sedan,EQS:sedan,G-Class:suv,GL-Class:suv,GLA:suv,GLB:suv,GLC:suv,GLE:suv,GLK:suv,GLS:suv,M-Class:suv,S-Class:sedan,SL:sedan,Sprinter:suv',
  Mini: 'Clubman:hatchback,Cooper:hatchback,Countryman:suv,Paceman:hatchback',
  Mitsubishi: 'Eclipse:sedan,Eclipse Cross:suv,Endeavor:suv,Galant:sedan,Lancer:sedan,Mirage:hatchback,Outlander:suv,Outlander PHEV:suv,RVR:suv',
  Nissan: '350Z:sedan,370Z:sedan,Altima:sedan,Ariya:suv,Armada:suv,Cube:hatchback,Frontier:truck,GT-R:sedan,Juke:suv,Kicks:suv,Leaf:hatchback,Maxima:sedan,Micra:hatchback,Murano:suv,NV200:suv,Pathfinder:suv,Qashqai:suv,Rogue:suv,Sentra:sedan,Titan:truck,Versa:sedan,Xterra:suv,Z:sedan',
  Polestar: 'Polestar 2:sedan,Polestar 3:suv',
  Pontiac: 'G5:sedan,G6:sedan,G8:sedan,Grand Prix:sedan,Montana:suv,Pursuit:sedan,Torrent:suv,Vibe:hatchback,Wave:sedan',
  Porsche: '911:sedan,Boxster:sedan,Cayenne:suv,Cayman:sedan,Macan:suv,Panamera:sedan,Taycan:sedan',
  Ram: '1500:truck,1500 Classic:truck,2500:truck,3500:truck,ProMaster:suv,ProMaster City:suv',
  Rivian: 'R1S:suv,R1T:truck',
  Saturn: 'Astra:hatchback,Aura:sedan,Ion:sedan,Outlook:suv,Sky:sedan,Vue:suv',
  Smart: 'Fortwo:hatchback',
  Subaru: 'Ascent:suv,BRZ:sedan,Crosstrek:suv,Forester:suv,Impreza:hatchback,Legacy:sedan,Outback:suv,Solterra:suv,Tribeca:suv,WRX:sedan',
  Suzuki: 'Grand Vitara:suv,Kizashi:sedan,SX4:hatchback,Swift:hatchback',
  Tesla: 'Cybertruck:truck,Model 3:sedan,Model S:sedan,Model X:suv,Model Y:suv',
  Toyota: '4Runner:suv,86:sedan,Avalon:sedan,bZ4X:suv,C-HR:suv,Camry:sedan,Camry Hybrid:sedan,Corolla:sedan,Corolla Cross:suv,Corolla Hatchback:hatchback,Crown:sedan,Echo:sedan,FJ Cruiser:suv,GR86:sedan,GR Corolla:hatchback,GR Supra:sedan,Grand Highlander:suv,Highlander:suv,Highlander Hybrid:suv,Land Cruiser:suv,Matrix:hatchback,Mirai:sedan,Prius:hatchback,Prius C:hatchback,Prius Prime:hatchback,Prius V:hatchback,RAV4:suv,RAV4 Hybrid:suv,RAV4 Prime:suv,Sequoia:suv,Sienna:suv,Tacoma:truck,Tundra:truck,Venza:suv,Yaris:hatchback',
  Volkswagen: 'Arteon:sedan,Atlas:suv,Atlas Cross Sport:suv,Beetle:hatchback,CC:sedan,Eos:sedan,Golf:hatchback,Golf GTI:hatchback,Golf R:hatchback,Golf SportWagen:hatchback,ID.4:suv,Jetta:sedan,Passat:sedan,Rabbit:hatchback,Taos:suv,Tiguan:suv,Touareg:suv',
  Volvo: 'C30:hatchback,C40 Recharge:suv,EX30:suv,EX90:suv,S40:sedan,S60:sedan,S80:sedan,S90:sedan,V60:hatchback,V60 Cross Country:hatchback,V90 Cross Country:hatchback,XC40:suv,XC60:suv,XC70:hatchback,XC90:suv',
}

/** Brands and their model names, each with a body style. */
export const CATALOG: Record<string, { name: string; body: BodyType }[]> = Object.fromEntries(
  Object.entries(RAW).map(([make, list]) => [
    make,
    list.split(',').map((entry) => {
      const [name, body] = entry.split(':')
      return { name, body: body as BodyType }
    }),
  ]),
)

/** Electric models in the catalog, so they don't get oil changes. */
export const EV_MODELS = new Set([
  'Audi e-tron', 'Audi Q4 e-tron', 'BMW i3', 'BMW i4', 'BMW i5', 'BMW i7', 'BMW iX', 'Cadillac Lyriq', 'Chevrolet Blazer EV',
  'Chevrolet Bolt EUV', 'Chevrolet Bolt EV', 'Chevrolet Equinox EV', 'Chevrolet Silverado EV', 'Fiat 500e', 'Ford F-150 Lightning',
  'Ford Mustang Mach-E', 'Genesis GV60', 'GMC Hummer EV', 'Honda Prologue', 'Hyundai Ioniq 5', 'Hyundai Ioniq 6', 'Hyundai Kona Electric',
  'Jaguar I-Pace', 'Kia EV6', 'Kia EV9', 'Kia Niro EV', 'Kia Soul EV', 'Lexus RZ', 'Lucid Air', 'Lucid Gravity', 'Mazda MX-30',
  'Mercedes-Benz EQB', 'Mercedes-Benz EQE', 'Mercedes-Benz EQS', 'Nissan Ariya', 'Nissan Leaf', 'Polestar Polestar 2', 'Polestar Polestar 3',
  'Porsche Taycan', 'Rivian R1S', 'Rivian R1T', 'Subaru Solterra', 'Tesla Cybertruck', 'Tesla Model 3', 'Tesla Model S', 'Tesla Model X',
  'Tesla Model Y', 'Toyota bZ4X', 'Volkswagen ID.4', 'Volvo C40 Recharge', 'Volvo EX30', 'Volvo EX90',
])

export function catalogBody(make: string, model: string): BodyType | undefined {
  const list = Object.entries(CATALOG).find(([m]) => m.toLowerCase() === make.trim().toLowerCase())?.[1]
  return list?.find((m) => m.name.toLowerCase() === model.trim().toLowerCase())?.body
}

export function isCatalogEv(make: string, model: string) {
  return EV_MODELS.has(`${make} ${model}`)
}
