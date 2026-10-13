import type { Team } from "./data"
import bodoGlimtLogo from "./imports/logos/bodo-glimt.svg"
import romaLogo from "./imports/logos/roma.svg"
import sportingLogo from "./imports/logos/sporting-cp.svg"
import sabahLogo from "./imports/logos/sabah.svg"
import galatasarayLogo from "./imports/logos/galatasaray.svg"
import ajaxLogo from "./imports/logos/ajax.svg"
import levanteLogo from "./imports/logos/levante.svg"
import elcheLogo from "./imports/logos/elche.svg"
import deportivoLogo from "./imports/logos/deportivo-la-coruna.svg"
import alavesLogo from "./imports/logos/alaves.svg"
import celtaLogo from "./imports/logos/celta-vigo.svg"
import espanyolLogo from "./imports/logos/espanyol.svg"
import athleticLogo from "./imports/logos/athletic-club.svg"
import sociedadLogo from "./imports/logos/real-sociedad.svg"
import betisLogo from "./imports/logos/real-betis.svg"
import valenciaLogo from "./imports/logos/valencia.svg"
import marseilleLogo from "./imports/logos/marseille.svg"
import lorientLogo from "./imports/logos/lorient.svg"
import lilleLogo from "./imports/logos/lille.svg"
import leMansLogo from "./imports/logos/le-mans.svg"
import lensLogo from "./imports/logos/lens.svg"
import leHavreLogo from "./imports/logos/le-havre.svg"
import brestLogo from "./imports/logos/brest.svg"
import auxerreLogo from "./imports/logos/auxerre.svg"
import angersLogo from "./imports/logos/angers.svg"
import strasbourgLogo from "./imports/logos/strasbourg.svg"
import rennesLogo from "./imports/logos/rennes.svg"
import parisFcLogo from "./imports/logos/paris-fc.svg"
import niceLogo from "./imports/logos/nice.svg"
import lyonLogo from "./imports/logos/lyon.svg"
import lecceLogo from "./imports/logos/lecce.svg"
import genoaLogo from "./imports/logos/genoa.svg"
import frosinoneLogo from "./imports/logos/frosinone.svg"
import comoLogo from "./imports/logos/como.svg"
import cagliariLogo from "./imports/logos/cagliari.svg"
import bolognaLogo from "./imports/logos/bologna.svg"
import atalantaLogo from "./imports/logos/atalanta.svg"
import fiorentinaLogo from "./imports/logos/fiorentina.svg"
import lazioLogo from "./imports/logos/lazio.svg"
import getafeLofo from "./imports/logos/getafe.svg"
import rayovalecanoLogo from "./imports/logos/rayo-vallecano.svg"
import malagoLogo from "./imports/logos/malaga.svg"
import osasunaLogo from "./imports/logos/osasuna.svg"
import monzaLogo from "./imports/logos/monza.svg"
import villarealLogo from "./imports/logos/villarreal.svg"
import parmaLogo from "./imports/logos/parma.svg"
import sasuoloLogo from "./imports/logos/sassuolo.svg"
import torinoLogo from "./imports/logos/torino.svg"
import udineseLogo from"./imports/logos/udinese.svg"
import rancingsantanderLogo from "./imports/logos/racing-santander.svg"
import veneziaLogo from "./imports/logos/venezia.svg"
import unionberlinLogo from "./imports/logos/union-berlin.svg"
import bayernlevLogo from "./imports/logos/bayer-leverkusen.svg"
import borussiamonLogo from "./imports/logos/borussia-monchengladbach.svg"
import augusburgLogo from "./imports/logos/augsburg.svg"
import hamburgLogo from "./imports/logos/hamburger-sv.svg"
import elversbergLogo from './imports/logos/sv-elversberg.svg'
import schakleLogo from './imports/logos/schalke-04.svg'
import hoffenheimLogo from './imports/logos/hoffenheim.svg'
import werderLogo from './imports/logos/werder-bremen.svg'
import brigmhamLogo from './imports/logos/birmingham.svg'
import blackburmLogo from './imports/logos/blackburn-rovers.svg'
import bristolLogo from './imports/logos/bristol-city.svg'
import boltonLogo from './imports/logos/bolton.svg'
import burnleyLogo from './imports/logos/burnley.svg'
import caddifLogo from './imports/logos/cardiff-city.svg'
import charltonLogo from './imports/logos/charlton.svg'
import derbycountyLogo from './imports/logos/derby-county.svg'
import lincolncityLogo from './imports/logos/lincoln-city.svg'
import middlesbrough from './imports/logos/middlesbrough.svg'
import millwallLogo from './imports/logos/millwall.svg'
import norwitchLogo from './imports/logos/norwich-city.svg'
import portsmouthLogo from './imports/logos/portsmouth.svg'
import quessparkrangersLogo from './imports/logos/queens-park-rangers.svg'
import sheffieldLogo from './imports/logos/sheffield-united.svg'
import southamptonLogo from './imports/logos/southampton.svg'
import aekathensLogo from './imports/logos/aek-athens.svg'
import clubbruggeLogo from './imports/logos/club-brugge.svg'
import fenerbahceLogo from './imports/logos/fenerbahce.svg'
import feynoordLogo from './imports/logos/feyenoord.svg'
import psvLogo from './imports/logos/psv.svg'
import slaviapragueLogo from './imports/logos/slavia-praha..svg'
import vikingLogo from './imports/logos/viking.svg'








// Current club lists and brand colors sourced from ESPN league team endpoints.
// Clubs without uploaded artwork use the generated fallback crest.
export const additionalTeams: Team[] = [
  // La Liga
  { id: "esp-96", name: "Alavés", short: "ALA", city: "Alavés", league: "La Liga", color: "#0000ff", color2: "#FFC0CB", logo: alavesLogo },
  { id: "esp-93", name: "Athletic Club", short: "ATH", city: "Athletic Club", league: "La Liga", color: "#C8142F", color2: "#000000", logo: athleticLogo },
  { id: "esp-85", name: "Celta Vigo", short: "CEL", city: "Celta Vigo", league: "La Liga", color: "#6cace4", color2: "#004996", logo: celtaLogo },
  { id: "esp-90", name: "Deportivo", short: "DEP", city: "A Coruña", league: "La Liga", color: "#3366CC", color2: "#000000", logo: deportivoLogo },
  { id: "esp-3751", name: "Elche", short: "ELC", city: "Elche", league: "La Liga", color: "#288A00", color2: "#4B2B67", logo: elcheLogo },
  { id: "esp-88", name: "Espanyol", short: "ESP", city: "Barcelona", league: "La Liga", color: "#3366CC", color2: "#C8142F", logo: espanyolLogo },
  { id: "esp-2922", name: "Getafe", short: "GET", city: "Getafe", league: "La Liga", color: "#0000ff", color2: "#7F1734",logo:getafeLofo},
  { id: "esp-1538", name: "Levante", short: "LEV", city: "Valencia", league: "La Liga", color: "#C8142F", color2: "#000000", logo: levanteLogo },
  { id: "esp-99", name: "Málaga", short: "MCF", city: "Málaga", league: "La Liga", color: "#b9e8f0", color2: "#D19CA4",logo:malagoLogo },
  { id: "esp-97", name: "Osasuna", short: "OSA", city: "Osasuna", league: "La Liga", color: "#cd0000", color2: "#ffffff",logo:osasunaLogo },
  { id: "esp-87", name: "Racing Santander", short: "RAC", city: "Racing Santander", league: "La Liga", color: "#ffffff", color2: "#3B6C1A",logo:rancingsantanderLogo },
  { id: "esp-101", name: "Rayo Vallecano", short: "RAY", city: "Rayo Vallecano", league: "La Liga", color: "#ffffff", color2: "#cd0000" ,logo:rayovalecanoLogo},
  { id: "esp-244", name: "Real Betis", short: "BET", city: "Seville", league: "La Liga", color: "#288A00", color2: "#0A422D", logo: betisLogo },
  { id: "esp-89", name: "Real Sociedad", short: "RSO", city: "San Sebastián", league: "La Liga", color: "#3366CC", color2: "#000000", logo: sociedadLogo },
  { id: "esp-94", name: "Valencia", short: "VAL", city: "Valencia", league: "La Liga", color: "#ffffff", color2: "#FF6F00", logo: valenciaLogo },
  { id: "esp-102", name: "Villarreal", short: "VIL", city: "Villarreal", league: "La Liga", color: "#ffff00", color2: "#6cace4",logo:villarealLogo },

  // Serie A
  { id: "ita-104", name: "AS Roma", short: "ROM", city: "AS Roma", league: "Serie A", color: "#990a2c", color2: "#F5F3E5", logo: romaLogo },
  { id: "ita-105", name: "Atalanta", short: "ATA", city: "Bergamo", league: "Serie A", color: "#1157bf", color2: "#ffffff", logo: atalantaLogo },
  { id: "ita-107", name: "Bologna", short: "BOL", city: "Bologna", league: "Serie A", color: "#04043d", color2: "#ffffff", logo: bolognaLogo },
  { id: "ita-2925", name: "Cagliari", short: "CAG", city: "Cagliari", league: "Serie A", color: "#282846", color2: "#ffffff", logo: cagliariLogo },
  { id: "ita-2572", name: "Como", short: "COM", city: "Como", league: "Serie A", color: "#4169E1", color2: "#FFFFFF", logo: comoLogo },
  { id: "ita-109", name: "Fiorentina", short: "FIO", city: "Florence", league: "Serie A", color: "#4c1d84", color2: "#ffffff", logo: fiorentinaLogo },
  { id: "ita-4057", name: "Frosinone", short: "FRO", city: "Frosinone", league: "Serie A", color: "#FACF08", color2: "#ffffff", logo: frosinoneLogo },
  { id: "ita-3263", name: "Genoa", short: "GEN", city: "Genoa", league: "Serie A", color: "#08305d", color2: "#ffffff", logo: genoaLogo },
  { id: "ita-112", name: "Lazio", short: "LAZ", city: "Rome", league: "Serie A", color: "#74bde7", color2: "#FFFFFF", logo: lazioLogo },
  { id: "ita-113", name: "Lecce", short: "LEC", city: "Lecce", league: "Serie A", color: "#FCED0B", color2: "#08305d", logo: lecceLogo },
  { id: "ita-4007", name: "Monza", short: "MON", city: "Monza", league: "Serie A", color: "#C8142F", color2: "#ffffff" ,logo:monzaLogo},
  { id: "ita-115", name: "Parma", short: "PAR", city: "Parma", league: "Serie A", color: "#19161D", color2: "#ffdd30" ,logo:parmaLogo},
  { id: "ita-3997", name: "Sassuolo", short: "SAS", city: "Sassuolo", league: "Serie A", color: "#0fa653", color2: "#ADAEB0" ,logo:sasuoloLogo},
  { id: "ita-239", name: "Torino", short: "TOR", city: "Torino", league: "Serie A", color: "#9f0000", color2: "#ffffff" ,logo:torinoLogo},
  { id: "ita-118", name: "Udinese", short: "UDI", city: "Udinese", league: "Serie A", color: "#19161D", color2: "#0F1C3F" ,logo:udineseLogo},
  { id: "ita-17530", name: "Venezia", short: "VEN", city: "Venezia", league: "Serie A", color: "#000000", color2: "#ffffff" ,logo:veneziaLogo},

  // Bundesliga
  { id: "ger-598", name: "1. FC Union Berlin", short: "FCU", city: "1. FC Union Berlin", league: "Bundesliga", color: "#DA0308", color2: "#d4d4d4" ,logo:unionberlinLogo },
  { id: "ger-131", name: "Bayer Leverkusen", short: "B04", city: "Bayer Leverkusen", league: "Bundesliga", color: "#DA0308", color2: "#f9fbfc" ,logo:bayernlevLogo},
  { id: "ger-268", name: "Borussia Mönchengladbach", short: "BMG", city: "Borussia Mönchengladbach", league: "Bundesliga", color: "#ffffff", color2: "#03915c" ,logo:borussiamonLogo},
  { id: "ger-125", name: "Eintracht Frankfurt", short: "SGE", city: "Eintracht Frankfurt", league: "Bundesliga", color: "#ffffff", color2: "#272726"},
  { id: "ger-3841", name: "FC Augsburg", short: "FCA", city: "FC Augsburg", league: "Bundesliga", color: "#ffffff", color2: "#03915c" ,logo:augusburgLogo},
  { id: "ger-122", name: "FC Cologne", short: "KOE", city: "FC Cologne", league: "Bundesliga", color: "#ffffff", color2: "#DA0308" },
  { id: "ger-127", name: "Hamburg SV", short: "HSV", city: "Hamburg SV", league: "Bundesliga", color: "#1a26af", color2: "#1a1a1a" ,logo:hamburgLogo},
  { id: "ger-2950", name: "Mainz", short: "M05", city: "Mainz", league: "Bundesliga", color: "#DA0308", color2: "#000055", },
  { id: "ger-11420", name: "RB Leipzig", short: "RBL", city: "RB Leipzig", league: "Bundesliga", color: "#ffffff", color2: "#740c14" ,},
  { id: "ger-126", name: "SC Freiburg", short: "SCF", city: "SC Freiburg", league: "Bundesliga", color: "#DA0308", color2: "#ffffff" ,},
  { id: "ger-3307", name: "SC Paderborn 07", short: "SCP", city: "SC Paderborn 07", league: "Bundesliga", color: "#0000dd", color2: "#ffffff" ,},
  { id: "ger-10388", name: "SV Elversberg", short: "ELV", city: "SV Elversberg", league: "Bundesliga", color: "#000000", color2: "#FFFFFF",logo:elversbergLogo },
  { id: "ger-133", name: "Schalke 04", short: "S04", city: "Schalke 04", league: "Bundesliga", color: "#0000dd", color2: "#ffffff" ,logo:schakleLogo},
  { id: "ger-7911", name: "TSG Hoffenheim", short: "TSG", city: "TSG Hoffenheim", league: "Bundesliga", color: "#003399", color2: "#000055",logo:hoffenheimLogo },
  { id: "ger-134", name: "VfB Stuttgart", short: "VFB", city: "VfB Stuttgart", league: "Bundesliga", color: "#ffffff", color2: "#DA0308" ,},
  { id: "ger-137", name: "Werder Bremen", short: "SVW", city: "Werder Bremen", league: "Bundesliga", color: "#03915c", color2: "#ffffff" ,logo:werderLogo},

  // Ligue 1
  { id: "fra-172", name: "AJ Auxerre", short: "AUX", city: "Auxerre", league: "Ligue 1", color: "#ffffff", color2: "#1a1a1a", logo: auxerreLogo },
  { id: "fra-7868", name: "Angers", short: "ANG", city: "Angers", league: "Ligue 1", color: "#1a1a1a", color2: "#ffffff", logo: angersLogo },
  { id: "fra-6997", name: "Brest", short: "BRE", city: "Brest", league: "Ligue 1", color: "#ef2f24", color2: "#ffffff", logo: brestLogo },
  { id: "fra-3236", name: "Le Havre AC", short: "HAC", city: "Le Havre", league: "Ligue 1", color: "#011F68", color2: "#ededed", logo: leHavreLogo },
  { id: "fra-2697", name: "Le Mans", short: "MNS", city: "Le Mans", league: "Ligue 1", color: "#d62b11", color2: "#d62b11", logo: leMansLogo },
  { id: "fra-175", name: "Lens", short: "RCL", city: "Lens", league: "Ligue 1", color: "#E91514", color2: "#004c37", logo: lensLogo },
  { id: "fra-166", name: "Lille", short: "LIL", city: "Lille", league: "Ligue 1", color: "#c2051b", color2: "#e2d3d7", logo: lilleLogo },
  { id: "fra-273", name: "Lorient", short: "LOR", city: "Lorient", league: "Ligue 1", color: "#f46100", color2: "#1a1a1a", logo: lorientLogo },
  { id: "fra-167", name: "Lyon", short: "LYO", city: "Lyon", league: "Ligue 1", color: "#ffffff", color2: "#1a1a1a", logo: lyonLogo },
  { id: "fra-176", name: "Marseille", short: "OLM", city: "Marseille", league: "Ligue 1", color: "#ffffff", color2: "#011F68", logo: marseilleLogo },
  { id: "fra-2502", name: "Nice", short: "NIC", city: "Nice", league: "Ligue 1", color: "#ef2f24", color2: "#e2d3d7", logo: niceLogo },
  { id: "fra-6851", name: "Paris FC", short: "PAR", city: "Paris", league: "Ligue 1", color: "#000000", color2: "#000000", logo: parisFcLogo },
  { id: "fra-169", name: "Stade Rennais", short: "REN", city: "Rennes", league: "Ligue 1", color: "#ef2f24", color2: "#ffffff", logo: rennesLogo },
  { id: "fra-180", name: "Strasbourg", short: "STR", city: "Strasbourg", league: "Ligue 1", color: "#0000bf", color2: "#ffffff", logo: strasbourgLogo },
  { id: "fra-179", name: "Toulouse", short: "TOU", city: "Toulouse", league: "Ligue 1", color: "#560080", color2: "#ffff00" },
  { id: "fra-170", name: "Troyes", short: "TRY", city: "Troyes", league: "Ligue 1", color: "#0000bf", color2: "#fafafc" },

  // EFL Championship
  { id: "eng-392", name: "Birmingham City", short: "BIR", city: "Birmingham City", league: "EFL Championship", color: "#0000fa", color2: "#fe5442",logo:brigmhamLogo },
  { id: "eng-365", name: "Blackburn Rovers", short: "BLK", city: "Blackburn Rovers", league: "EFL Championship", color: "#0000fa", color2: "#1a1a1a",logo:blackburmLogo },
  { id: "eng-358", name: "Bolton Wanderers", short: "BOL", city: "Bolton Wanderers", league: "EFL Championship", color: "#ffffff", color2: "#1a1a1a" ,logo:boltonLogo},
  { id: "eng-333", name: "Bristol City", short: "BRC", city: "Bristol City", league: "EFL Championship", color: "#f42727", color2: "#ffffff",logo:bristolLogo },
  { id: "eng-379", name: "Burnley", short: "BUR", city: "Burnley", league: "EFL Championship", color: "#6C1D45", color2: "#00FFFF" ,logo:burnleyLogo },
  { id: "eng-347", name: "Cardiff City", short: "CAR", city: "Cardiff City", league: "EFL Championship", color: "#0000fa", color2: "#c6d4db" ,logo:caddifLogo},
  { id: "eng-372", name: "Charlton Athletic", short: "CHA", city: "Charlton Athletic", league: "EFL Championship", color: "#C8142F", color2: "#020202" ,logo:charltonLogo},
  { id: "eng-374", name: "Derby County", short: "DER", city: "Derby County", league: "EFL Championship", color: "#ffffff", color2: "#abebc5",logo:derbycountyLogo },
  { id: "eng-314", name: "Lincoln City", short: "LCN", city: "Lincoln City", league: "EFL Championship", color: "#C8142F", color2: "#c6d4db",logo:lincolncityLogo },
  { id: "eng-369", name: "Middlesbrough", short: "MID", city: "Middlesbrough", league: "EFL Championship", color: "#f42727", color2: "#87cced" ,logo:middlesbrough},
  { id: "eng-391", name: "Millwall", short: "MIL", city: "Millwall", league: "EFL Championship", color: "#091453", color2: "#007066",logo:millwallLogo },
  { id: "eng-381", name: "Norwich City", short: "NOR", city: "Norwich City", league: "EFL Championship", color: "#ffff00", color2: "#1D428A" ,logo:norwitchLogo},
  { id: "eng-385", name: "Portsmouth", short: "POR", city: "Portsmouth", league: "EFL Championship", color: "#0000fa", color2: "#1a1a1a",logo:portsmouthLogo },
  { id: "eng-394", name: "Preston North End", short: "PNE", city: "Preston North End", league: "EFL Championship", color: "#ffffff", color2: "#87cced" },
  { id: "eng-334", name: "Queens Park Rangers", short: "QPR", city: "Queens Park Rangers", league: "EFL Championship", color: "#0000d4", color2: "#1a1a1a",logo:quessparkrangersLogo },
  { id: "eng-398", name: "Sheffield United", short: "SHU", city: "Sheffield United", league: "EFL Championship", color: "#f42727", color2: "#1D428A",logo:sheffieldLogo },
  { id: "eng-376", name: "Southampton", short: "SOU", city: "Southampton", league: "EFL Championship", color: "#ED1A3B", color2: "#f1ee13" ,logo:southamptonLogo},
  { id: "eng-336", name: "Stoke City", short: "STK", city: "Stoke City", league: "EFL Championship", color: "#f42727", color2: "#1a1a1a" },
  { id: "eng-318", name: "Swansea City", short: "SWA", city: "Swansea City", league: "EFL Championship", color: "#ffffff", color2: "#1D428A" },
  { id: "eng-395", name: "Watford", short: "WAT", city: "Watford", league: "EFL Championship", color: "#ffff00", color2: "#1D428A" },
  { id: "eng-383", name: "West Bromwich Albion", short: "WBA", city: "West Bromwich Albion", league: "EFL Championship", color: "#091453", color2: "#ffff00" },
  { id: "eng-371", name: "West Ham United", short: "WHU", city: "West Ham United", league: "EFL Championship", color: "#7c2c3b", color2: "#F1E7E0" },
  { id: "eng-380", name: "Wolverhampton Wanderers", short: "WOL", city: "Wolverhampton Wanderers", league: "EFL Championship", color: "#fdb913", color2: "#32A8DD" },
  { id: "eng-352", name: "Wrexham", short: "WXM", city: "Wrexham", league: "EFL Championship", color: "#C8142F", color2: "#ffffff" },

  // UEFA Champions League
  { id: "ucl-887", name: "AEK Athens", short: "AEK", city: "AEK Athens", league: "UEFA Champions League", color: "#ffff00", color2: "#000000" ,logo:aekathensLogo},
  { id: "ucl-2980", name: "Bodo/Glimt", short: "BOD", city: "Bodo/Glimt", league: "UEFA Champions League", color: "#FCEE33", color2: "#ffffff", logo: bodoGlimtLogo },
  { id: "ucl-570", name: "Club Brugge", short: "BRU", city: "Club Brugge", league: "UEFA Champions League", color: "#0081ff", color2: "#ffffff" ,logo:clubbruggeLogo},
  { id: "ucl-437", name: "FC Porto", short: "FCP", city: "FC Porto", league: "UEFA Champions League", color: "#0000dd", color2: "#ffa000", },
  { id: "ucl-436", name: "Fenerbahce", short: "FEN", city: "Fenerbahce", league: "UEFA Champions League", color: "#ffff00", color2: "#ffffff" ,logo:fenerbahceLogo},
  { id: "ucl-142", name: "Feyenoord Rotterdam", short: "FEY", city: "Feyenoord Rotterdam", league: "UEFA Champions League", color: "#ef2f24", color2: "#000000" ,logo:feynoordLogo},
  { id: "ucl-432", name: "Galatasaray", short: "GAL", city: "Galatasaray", league: "UEFA Champions League", color: "#aa0031", color2: "#ffffff", logo: galatasarayLogo },
  { id: "ucl-4411", name: "LASK Linz", short: "LAS", city: "LASK Linz", league: "UEFA Champions League", color: "#ffffff", color2: "#000000" },
  { id: "ucl-148", name: "PSV Eindhoven", short: "PSV", city: "PSV Eindhoven", league: "UEFA Champions League", color: "#ef2f24", color2: "#000000",logo:psvLogo },
  { id: "ucl-21922", name: "Sabah FK", short: "SAB", city: "Sabah FK", league: "UEFA Champions League", color: "#000000", color2: "#FF1493", logo: sabahLogo },
  { id: "ucl-493", name: "Shakhtar Donetsk", short: "SHK", city: "Shakhtar Donetsk", league: "UEFA Champions League", color: "#ff5900", color2: "#1a1a1a" },
  { id: "ucl-494", name: "Slavia Prague", short: "SLP", city: "Slavia Prague", league: "UEFA Champions League", color: "#dc1f26", color2: "#81c0ff",logo:slaviapragueLogo },
  { id: "ucl-521", name: "Slovan Bratislava", short: "SLB", city: "Slovan Bratislava", league: "UEFA Champions League", color: "#81c0ff", color2: "#1a1a1a" },
  { id: "ucl-2250", name: "Sporting CP", short: "SCP", city: "Sporting CP", league: "UEFA Champions League", color: "#008127", color2: "#ffffff", logo: sportingLogo },
  { id: "ned-ajax", name: "Ajax", short: "AJA", city: "Amsterdam", league: "Eredivisie", color: "#D2122E", color2: "#ffffff", logo: ajaxLogo },
  { id: "ucl-510", name: "Viking FK", short: "VIK", city: "Viking FK", league: "UEFA Champions League", color: "#000080", color2: "#ffffff" ,logo:vikingLogo},

]
