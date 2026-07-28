import type {
  DwarfSatelliteId,
  MoonId,
} from "@/features/solar-system/types/celestial-body";

export interface BodyEditorialCopy {
  readonly tagline: string;
  readonly overview: string;
  readonly focusTitle: string;
  readonly focusBody: string;
}

export const MOON_EDITORIAL_COPY = {
  "moon-earth-moon": {
    tagline: "A familiar companion that makes Earth a two-body story.",
    overview:
      "The Moon is the nearest world beyond Earth and the reference point for almost every human-scale idea of spaceflight. Its synchronous rotation keeps one hemisphere broadly facing Earth while its changing geometry drives the familiar cycle of phases.",
    focusTitle: "The system seen from home",
    focusBody:
      "This page treats the Moon as an orbiting world rather than a decorative light. Its distance, period and reference plane are shown beside the limits of the mean-element model used in Explore.",
  },
  "moon-mars-phobos": {
    tagline: "A dark, fast moon skimming close above Mars.",
    overview:
      "Phobos circles Mars in less than a Martian day, so it would appear to move quickly across the sky from west to east. Its irregular form and close orbit make it feel less like a distant moon and more like a captured fragment passing overhead.",
    focusTitle: "A moon on an inward path",
    focusBody:
      "Phobos occupies a compact orbit inside synchronous altitude. The page keeps that orbital scale visible without presenting the representative visual motion as navigation-grade prediction.",
  },
  "moon-mars-deimos": {
    tagline: "Mars’s smaller outer moon, distant and restrained.",
    overview:
      "Deimos follows a wider and slower orbit than Phobos. Its low gravity and softened surface appearance contrast with the sharper, more dramatic profile of its inner sibling.",
    focusTitle: "The quieter Martian companion",
    focusBody:
      "The contrast between the two Martian moons is primarily one of scale and orbit: Deimos is smaller, farther out and slower across the sky.",
  },
  "moon-jupiter-io": {
    tagline: "A world remade by tides and relentless volcanism.",
    overview:
      "Io is locked in a gravitational rhythm with Jupiter and neighboring moons. Repeated tidal flexing supplies heat to an intensely active surface, making it one of the most geologically energetic places in the Solar System.",
    focusTitle: "Energy from orbital resonance",
    focusBody:
      "Io’s story is not simply proximity to Jupiter. Its orbit participates in a resonance that keeps tidal heating active, linking orbital mechanics directly to surface change.",
  },
  "moon-jupiter-europa": {
    tagline: "An ice-covered ocean world shaped by Jupiter’s tides.",
    overview:
      "Europa’s bright fractured shell hides a deeper story. Evidence supports a global salty ocean beneath the ice, while tidal flexing provides an energy source that keeps the interior from becoming a completely frozen relic.",
    focusTitle: "A surface that records motion below",
    focusBody:
      "Ridges, bands and disrupted terrain make Europa’s surface a map of stress. Helios keeps the visual representation distinct from the orbital model and its stated precision.",
  },
  "moon-jupiter-ganymede": {
    tagline: "The largest moon, with a magnetic identity of its own.",
    overview:
      "Ganymede is larger than Mercury and is the only moon known to generate an intrinsic magnetic field. Dark ancient terrain and brighter grooved regions record a long geological history.",
    focusTitle: "A moon operating at planetary scale",
    focusBody:
      "Its size, internal differentiation and magnetic environment make Ganymede more than a satellite footnote. The body page keeps those planetary qualities in view while preserving its place in Jupiter’s resonant moon system.",
  },
  "moon-jupiter-callisto": {
    tagline:
      "An ancient, cratered archive at the edge of Jupiter’s major moons.",
    overview:
      "Callisto’s surface preserves impact history on a vast scale. It orbits beyond the strongest part of Jupiter’s radiation environment experienced by the inner Galilean moons and shows less evidence of recent resurfacing.",
    focusTitle: "A record written in impacts",
    focusBody:
      "Where Io and Europa are continually transformed, Callisto appears comparatively old and stable. Its heavily cratered face becomes the central visual and scientific contrast.",
  },
  "moon-saturn-mimas": {
    tagline: "A small icy moon defined by one enormous scar.",
    overview:
      "Mimas is dominated visually by the Herschel impact basin, a crater so large relative to the moon that it reshapes the entire silhouette. Its compact orbit places it deep inside Saturn’s intricate ring-and-moon system.",
    focusTitle: "Scale revealed by a single crater",
    focusBody:
      "The impact basin is not decorative shorthand; it is the clearest way to understand how small Mimas is and how close the collision came to disrupting it.",
  },
  "moon-saturn-enceladus": {
    tagline: "A bright ice world venting an ocean into space.",
    overview:
      "Enceladus reflects sunlight from a remarkably fresh icy surface. Near its south pole, fractures feed plumes of water-rich material that connect a subsurface ocean to Saturn’s E ring.",
    focusTitle: "An ocean sampled without landing",
    focusBody:
      "Material escaping through the south-polar fractures lets spacecraft investigate an interior ocean from orbit. The page separates that scientific story from the representative scene geometry.",
  },
  "moon-saturn-tethys": {
    tagline: "An icy world crossed by a canyon on a global scale.",
    overview:
      "Tethys is a low-density moon dominated by water ice. The vast Ithaca Chasma and the Odysseus impact basin reveal stresses and collisions that affected a large fraction of the body.",
    focusTitle: "A small moon with planet-wide structure",
    focusBody:
      "On Tethys, a canyon system can be interpreted only in relation to the moon’s full circumference. The body page makes that whole-world scale the main comparison.",
  },
  "moon-saturn-dione": {
    tagline: "Bright fractures cut across an older cratered surface.",
    overview:
      "Dione combines heavily cratered terrain with long bright tectonic fractures. Those wispy-looking markings are steep scarps and canyon systems rather than deposits painted onto an unchanged surface.",
    focusTitle: "A surface pulled apart",
    focusBody:
      "Dione’s visual identity comes from tectonic contrast: old impacts remain, but broad fractures show that the icy crust has also been reshaped from within.",
  },
  "moon-saturn-rhea": {
    tagline: "A large, quiet ice world carrying a long impact record.",
    overview:
      "Rhea is Saturn’s second-largest moon and presents a restrained landscape of ice, craters and tectonic markings. Its low density points to an interior dominated by water ice with a smaller rocky component.",
    focusTitle: "Quiet does not mean featureless",
    focusBody:
      "Rhea’s value is comparative. Its subdued geology makes the active surfaces of Enceladus and Titan more legible within the same Saturnian system.",
  },
  "moon-saturn-titan": {
    tagline: "A moon with weather, rivers and seas made from hydrocarbons.",
    overview:
      "Titan carries a dense nitrogen-rich atmosphere and a methane cycle that shapes clouds, rain, channels and lakes. Beneath the haze is a world where familiar landscape processes operate with unfamiliar materials.",
    focusTitle: "Earth-like processes, alien chemistry",
    focusBody:
      "Titan is best understood through process rather than appearance: evaporation, precipitation and erosion occur, but water ice behaves like bedrock while methane and ethane fill the active cycle.",
  },
  "moon-saturn-iapetus": {
    tagline: "A two-toned moon with a ridge tracing its equator.",
    overview:
      "Iapetus presents one of the Solar System’s strongest hemispheric contrasts. A dark leading side, bright trailing terrain and a remarkable equatorial ridge give the distant moon a sharply asymmetric identity.",
    focusTitle: "A world divided by light and terrain",
    focusBody:
      "The brightness contrast is reinforced by thermal feedback: darker areas absorb more sunlight and help maintain the separation between dark and bright terrain.",
  },
  "moon-uranus-miranda": {
    tagline:
      "A patchwork moon assembled from cliffs, grooves and broken terrain.",
    overview:
      "Miranda’s surface looks unusually varied for such a small body. Large coronae, ridges and fault scarps suggest a complicated history of internal activity and resurfacing.",
    focusTitle: "Geology out of proportion to size",
    focusBody:
      "Miranda demonstrates why radius alone does not predict visual complexity. Its compact body preserves some of the most dramatic tectonic relief seen among the classical moons.",
  },
  "moon-uranus-ariel": {
    tagline: "A bright Uranian moon cut by valleys and fault systems.",
    overview:
      "Ariel has one of the youngest-looking surfaces among Uranus’s major moons. Long canyons and smoother plains indicate that tectonic and cryovolcanic processes altered older cratered terrain.",
    focusTitle: "A surface renewed after impact history",
    focusBody:
      "Ariel’s brightness and fractured landscape provide a counterpoint to darker Umbriel, even though both orbit within the same tilted planetary system.",
  },
  "moon-uranus-umbriel": {
    tagline: "A dark, ancient moon with change kept mostly out of sight.",
    overview:
      "Umbriel is the darkest of Uranus’s large moons and retains a heavily cratered surface. Its subdued reflectivity and limited signs of resurfacing give it a distinctly old appearance.",
    focusTitle: "Age expressed through restraint",
    focusBody:
      "Umbriel’s page avoids inventing activity where the visible record is quiet. Its value lies in the contrast between preserved impacts and the more disrupted surfaces of neighboring moons.",
  },
  "moon-uranus-titania": {
    tagline: "Uranus’s largest moon, fractured across an icy crust.",
    overview:
      "Titania combines broad canyons, fault valleys and impact scars on the largest satellite in the Uranian system. The tectonic features indicate that the interior expanded and broke the surface after much of the crater record had formed.",
    focusTitle: "A large moon under extension",
    focusBody:
      "Titania’s long faults are read as structural evidence. They make the moon’s internal evolution visible without requiring a claim of present-day activity.",
  },
  "moon-uranus-oberon": {
    tagline:
      "A distant, cratered moon at the edge of Uranus’s classical system.",
    overview:
      "Oberon is the outermost of Uranus’s five major moons. Its dark, impact-marked surface includes bright material exposed on some crater walls and floors.",
    focusTitle: "The outer boundary of a tilted family",
    focusBody:
      "Oberon’s orbit and preserved terrain make it a natural endpoint for reading the major Uranian moons from the inside out.",
  },
  "moon-neptune-proteus": {
    tagline: "A large irregular moon that never became fully round.",
    overview:
      "Proteus is among the largest irregularly shaped bodies known. Its gravity was not sufficient to erase its angular outline, while large impacts left a heavily modified surface.",
    focusTitle: "A body near the threshold of roundness",
    focusBody:
      "Proteus makes shape itself a scientific metric. Its irregular geometry is preserved in the visual profile rather than hidden behind a perfect sphere.",
  },
  "moon-neptune-triton": {
    tagline: "A captured world moving backward around Neptune.",
    overview:
      "Triton follows a retrograde orbit, strong evidence that it formed elsewhere and was captured by Neptune. Its young icy surface, thin atmosphere and active plumes make it one of the most distinctive outer-system worlds.",
    focusTitle: "Capture rewrote an entire system",
    focusBody:
      "Triton’s arrival likely disturbed Neptune’s earlier satellite family. Its orbital direction is therefore not a minor parameter but the key to the moon’s origin story.",
  },
  "moon-neptune-nereid": {
    tagline: "A small outer moon tracing an unusually stretched orbit.",
    overview:
      "Nereid travels on a highly eccentric orbit, changing its distance from Neptune dramatically over each revolution. That path distinguishes it from the more regular inner satellite system.",
    focusTitle: "Distance that changes by design",
    focusBody:
      "Nereid is a reminder that a single semi-major axis cannot describe the experience of an eccentric orbit. The page keeps eccentricity beside period and reference frame.",
  },
} as const satisfies Record<MoonId, BodyEditorialCopy>;

export const DWARF_SATELLITE_EDITORIAL_COPY = {
  "dwarf-satellite-charon": {
    tagline:
      "A companion so large that Pluto and Charon orbit a shared point in space.",
    overview:
      "Charon is roughly half Pluto’s diameter, giving the pair an unusually balanced relationship. Both bodies are tidally locked, so the same hemispheres continually face one another.",
    focusTitle: "A binary-like dwarf-planet system",
    focusBody:
      "The Pluto–Charon barycentre lies outside Pluto. Helios therefore treats the pair as a coupled system rather than placing a tiny decorative moon around a fixed primary.",
  },
  "dwarf-satellite-dysnomia": {
    tagline: "Eris’s distant moon and a key to measuring the system’s mass.",
    overview:
      "Dysnomia provides the orbital clock needed to estimate the mass of the Eris system. Its surface and exact shape remain less constrained than those of the major planetary moons.",
    focusTitle: "What an orbit can reveal",
    focusBody:
      "Even when imagery is limited, period and separation carry physical information. The page makes the sourced measurements visible while leaving unresolved orientation explicit.",
  },
  "dwarf-satellite-hiiaka": {
    tagline: "Haumea’s larger outer moon in a fast-spinning, elongated system.",
    overview:
      "Hiʻiaka orbits beyond Namaka and contributes to one of the most dynamically unusual dwarf-planet systems. Its brighter icy surface stands apart from the dark background of the Kuiper belt.",
    focusTitle: "The outer member of a complex family",
    focusBody:
      "Hiʻiaka’s period, separation and inclination are shown in the parent-equatorial context used by the scene, without inventing missing angular elements.",
  },
  "dwarf-satellite-namaka": {
    tagline: "Haumea’s inner moon on a more eccentric, inclined path.",
    overview:
      "Namaka is smaller and closer to Haumea than Hiʻiaka. Its orbit is both more eccentric and more inclined, making the compact system dynamically richer than a set of nested circular tracks.",
    focusTitle: "A small moon with a complicated orbit",
    focusBody:
      "The contrast with Hiʻiaka is carried by actual orbital parameters. Helios keeps the unresolved node and periapsis orientation representative rather than random.",
  },
  "dwarf-satellite-mk2": {
    tagline: "A faint companion revealing that Makemake is not alone.",
    overview:
      "MK2 is a small, dark satellite detected close to bright Makemake. Its discovery opened a way to constrain the dwarf planet’s mass once the orbit is sufficiently measured.",
    focusTitle: "A discovery defined by contrast",
    focusBody:
      "The body remains poorly resolved. The page therefore emphasizes the measured system context and labels the visual surface as a restrained reconstruction.",
  },
  "dwarf-satellite-weywot": {
    tagline: "Quaoar’s moon following a compact, noticeably eccentric orbit.",
    overview:
      "Weywot gives the Quaoar system an orbital reference beyond the dwarf planet’s ring context. Its path is not treated as a perfect circle, and unresolved orientation remains part of the scientific record.",
    focusTitle: "A moon beside an unusual ring system",
    focusBody:
      "Quaoar demonstrates that small outer-system bodies can host both satellites and rings. Weywot’s page isolates the moon’s own measured orbit from the broader system story.",
  },
  "dwarf-satellite-xiangliu": {
    tagline: "Gonggong’s small companion on an elongated orbit.",
    overview:
      "Xiangliu is faint and distant, but its orbit helps constrain the total mass of the Gonggong system. The available source set supports a representative eccentric path rather than a complete pole solution.",
    focusTitle: "Useful measurements at the edge of visibility",
    focusBody:
      "The page is deliberately honest about what is known: mean scale, period and eccentricity are useful, while the full three-dimensional orientation is not asserted.",
  },
  "dwarf-satellite-vanth": {
    tagline: "A comparatively large moon paired with Orcus.",
    overview:
      "Vanth is substantial relative to Orcus, making the pair another important example of a tightly coupled trans-Neptunian system. Its mean orbit is close to circular in the reference model.",
    focusTitle: "A partnership beyond Neptune",
    focusBody:
      "Vanth’s size makes the Orcus system more balanced than a conventional primary-and-tiny-moon picture. The visual composition reflects that relationship without claiming a navigation-grade orientation.",
  },
} as const satisfies Record<DwarfSatelliteId, BodyEditorialCopy>;
