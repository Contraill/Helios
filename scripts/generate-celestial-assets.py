from __future__ import annotations
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import hashlib, json, math, random
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/textures/celestial'
OUT.mkdir(parents=True, exist_ok=True)
RETRIEVED = '2026-07-19'
NASA_LICENSE = ('NASA media usage guidelines: NASA content is generally not subject to copyright in the United States; '
                'NASA identifiers and third-party material remain protected. Source acknowledgement required; no endorsement implied.')
USGS_LICENSE = 'United States Government work; public domain unless otherwise noted by USGS. Source acknowledgement requested.'
HELIOS_LICENSE = 'Helios-generated deterministic procedural reconstruction; no source raster pixels reproduced.'

# id, display, category, dimensions, base rgb, accent rgb, pattern, source title, provider, url, mission/instrument
BODIES = [
('moon-earth-moon','Moon','featured-moon',(1024,512),(118,116,110),(52,55,59),'maria','Lunar Reconnaissance Orbiter Camera Global Morphology Mosaic','USGS Astrogeology / NASA LRO','https://astrogeology.usgs.gov/search/map/moon_lro_lroc_wac_global_morphology_mosaic_100m','LRO / LROC WAC'),
('moon-mars-phobos','Phobos','featured-moon',(512,256),(79,70,63),(38,33,31),'irregular-crater','Phobos Overview','NASA Science','https://science.nasa.gov/mars/moons/phobos/','Viking / Mars Express appearance references'),
('moon-mars-deimos','Deimos','featured-moon',(512,256),(99,91,83),(54,49,45),'soft-irregular','Deimos Overview','NASA Science','https://science.nasa.gov/mars/moons/deimos/','Viking appearance references'),
('moon-jupiter-io','Io','featured-moon',(1024,512),(219,183,70),(112,61,34),'sulfur','Io Facts','NASA Science','https://science.nasa.gov/jupiter/moons/io/facts/','Voyager / Galileo'),
('moon-jupiter-europa','Europa','featured-moon',(1024,512),(191,178,146),(95,66,55),'lineaments','Europa Facts','NASA Science','https://science.nasa.gov/jupiter/moons/europa/facts/','Voyager / Galileo'),
('moon-jupiter-ganymede','Ganymede','featured-moon',(1024,512),(111,103,92),(45,48,53),'terrain','Ganymede Global Mosaic','NASA Scientific Visualization Studio','https://svs.gsfc.nasa.gov/31101/','Voyager / Galileo / Juno'),
('moon-jupiter-callisto','Callisto','featured-moon',(1024,512),(63,58,53),(132,123,108),'dense-crater','Callisto Facts','NASA Science','https://science.nasa.gov/jupiter/moons/callisto/facts/','Voyager / Galileo'),
('moon-saturn-mimas','Mimas','featured-moon',(512,256),(151,151,146),(74,73,70),'herschel','Mimas Facts','NASA Science','https://science.nasa.gov/saturn/moons/mimas/facts/','Cassini'),
('moon-saturn-enceladus','Enceladus','featured-moon',(1024,512),(221,225,222),(103,142,164),'tiger-stripes','Enceladus Facts','NASA Science','https://science.nasa.gov/saturn/moons/enceladus/facts/','Cassini'),
('moon-saturn-tethys','Tethys','featured-moon',(512,256),(182,179,169),(102,95,89),'canyon','Tethys Facts','NASA Science','https://science.nasa.gov/saturn/moons/tethys/facts/','Cassini'),
('moon-saturn-dione','Dione','featured-moon',(512,256),(169,170,166),(91,95,101),'wispy','Dione Facts','NASA Science','https://science.nasa.gov/saturn/moons/dione/facts/','Cassini'),
('moon-saturn-rhea','Rhea','featured-moon',(512,256),(155,154,150),(93,91,87),'crater','Rhea Facts','NASA Science','https://science.nasa.gov/saturn/moons/rhea/facts/','Cassini'),
('moon-saturn-titan','Titan','featured-moon',(1024,512),(178,107,37),(224,157,65),'haze','Titan Facts','NASA Science','https://science.nasa.gov/saturn/moons/titan/facts/','Cassini / Huygens'),
('moon-saturn-iapetus','Iapetus','featured-moon',(1024,512),(171,165,150),(45,39,34),'two-tone','Iapetus Facts','NASA Science','https://science.nasa.gov/saturn/moons/iapetus/facts/','Cassini'),
('moon-uranus-miranda','Miranda','featured-moon',(1024,512),(149,149,145),(82,84,88),'patchwork','Miranda Facts','NASA Science','https://science.nasa.gov/uranus/moons/miranda/','Voyager 2'),
('moon-uranus-ariel','Ariel','featured-moon',(512,256),(172,177,177),(91,104,111),'valleys','Ariel Facts','NASA Science','https://science.nasa.gov/uranus/moons/ariel/','Voyager 2'),
('moon-uranus-umbriel','Umbriel','featured-moon',(512,256),(79,80,79),(139,139,129),'dark-crater','Umbriel Facts','NASA Science','https://science.nasa.gov/uranus/moons/umbriel/','Voyager 2'),
('moon-uranus-titania','Titania','featured-moon',(512,256),(142,145,142),(82,91,93),'faults','Titania Facts','NASA Science','https://science.nasa.gov/uranus/moons/titania/','Voyager 2'),
('moon-uranus-oberon','Oberon','featured-moon',(512,256),(105,101,96),(155,146,130),'dark-crater','Oberon Facts','NASA Science','https://science.nasa.gov/uranus/moons/oberon/','Voyager 2'),
('moon-neptune-proteus','Proteus','featured-moon',(512,256),(78,75,72),(112,104,96),'faceted','Proteus Facts','NASA Science','https://science.nasa.gov/neptune/moons/proteus/','Voyager 2'),
('moon-neptune-triton','Triton','featured-moon',(1024,512),(185,178,167),(172,110,91),'polar-frost','Triton Facts','NASA Science','https://science.nasa.gov/neptune/moons/triton/facts/','Voyager 2'),
('moon-neptune-nereid','Nereid','featured-moon',(512,256),(95,99,101),(53,56,58),'restrained','Nereid Facts','NASA Science','https://science.nasa.gov/neptune/moons/nereid/','Voyager 2 / ground observations'),
('ceres','Ceres','asteroid',(1024,512),(106,103,96),(176,170,150),'bright-spots','Ceres Facts','NASA Science','https://science.nasa.gov/dwarf-planets/ceres/facts/','Dawn'),
('vesta','Vesta','asteroid',(1024,512),(132,116,99),(58,49,45),'south-basin','Vesta Facts','NASA Science','https://science.nasa.gov/solar-system/asteroids/4-vesta/','Dawn'),
('pallas','Pallas','asteroid',(512,256),(92,88,84),(133,124,110),'faceted','Pallas Overview','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=2','Ground-based / adaptive optics appearance constraints'),
('hygiea','Hygiea','asteroid',(512,256),(47,48,47),(88,84,78),'round-dark','Hygiea Overview','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=10','Ground-based appearance constraints'),
('pluto','Pluto','dwarf-kuiper',(1024,512),(174,142,119),(222,195,168),'heart','Pluto Facts','NASA Science','https://science.nasa.gov/dwarf-planets/pluto/facts/','New Horizons / LORRI-MVIC'),
('eris','Eris','dwarf-kuiper',(512,256),(192,191,184),(133,126,116),'frost','Eris Facts','NASA Science','https://science.nasa.gov/dwarf-planets/eris/','Ground-based spectroscopy / Hubble'),
('haumea','Haumea','dwarf-kuiper',(512,256),(185,185,177),(121,109,97),'elongated-frost','Haumea Facts','NASA Science','https://science.nasa.gov/dwarf-planets/haumea/','Photometry / stellar occultation'),
('makemake','Makemake','dwarf-kuiper',(512,256),(147,105,78),(194,157,124),'methane-frost','Makemake Facts','NASA Science','https://science.nasa.gov/dwarf-planets/makemake/facts/','Hubble / spectroscopy'),
('quaoar','Quaoar','dwarf-kuiper',(512,256),(134,92,76),(190,151,126),'red-frost','Quaoar Overview','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=50000','Stellar occultation / spectroscopy'),
('gonggong','Gonggong','dwarf-kuiper',(512,256),(142,70,55),(197,112,88),'deep-red','Gonggong Overview','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=225088','Thermal / photometric constraints'),
('sedna','Sedna','dwarf-kuiper',(512,256),(119,54,45),(169,92,74),'restrained-red','Sedna Overview','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=90377','Photometric color constraints'),
('orcus','Orcus','dwarf-kuiper',(512,256),(119,118,111),(73,78,84),'neutral-ice','Orcus Overview','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=90482','Spectroscopy / photometry'),
('halley','Halley','comet',(512,256),(35,33,30),(82,76,67),'dark-nucleus','1P/Halley Facts','NASA Science','https://science.nasa.gov/solar-system/comets/1p-halley/','Giotto / Vega appearance constraints'),
('hale-bopp','Hale–Bopp','comet',(512,256),(51,48,43),(103,95,80),'dark-nucleus','C/1995 O1 Hale-Bopp','NASA Science','https://science.nasa.gov/solar-system/comets/c-1995-o1-hale-bopp/','Ground-based observations'),
('encke','Encke','comet',(512,256),(43,40,37),(91,84,72),'dark-nucleus','2P/Encke Facts','NASA Science','https://science.nasa.gov/solar-system/comets/2p-encke/','Spacecraft / ground observations'),
('67p','67P/Churyumov–Gerasimenko','comet',(512,256),(36,35,33),(80,76,69),'bilobed','67P/Churyumov-Gerasimenko Facts','NASA Science / ESA Rosetta','https://science.nasa.gov/solar-system/comets/67p-churyumov-gerasimenko/','Rosetta / OSIRIS'),
('neowise','NEOWISE','comet',(512,256),(48,43,37),(113,96,72),'dark-nucleus','C/2020 F3 NEOWISE','NASA Science','https://science.nasa.gov/solar-system/comets/c-2020-f3-neowise/','NEOWISE / ground observations'),
('tempel-1','Tempel 1','comet',(512,256),(45,43,40),(97,91,81),'pitted','9P/Tempel 1 Facts','NASA Science','https://science.nasa.gov/solar-system/comets/9p-tempel-1/','Deep Impact / Stardust-NExT'),
('dwarf-satellite-charon','Charon','dwarf-system-satellite',(1024,512),(129,126,122),(75,64,63),'polar-cap','Charon Global Mosaic','USGS Astrogeology / NASA New Horizons','https://astrogeology.usgs.gov/search/map/Pluto/NewHorizons/Charon/Charon_NewHorizons_Global_Mosaic','New Horizons / LORRI'),
('dwarf-satellite-dysnomia','Dysnomia','dwarf-system-satellite',(512,256),(83,81,78),(128,123,114),'restrained','Eris Facts','NASA Science','https://science.nasa.gov/dwarf-planets/eris/','Hubble / Keck orbital context'),
('dwarf-satellite-hiiaka','Hiʻiaka','dwarf-system-satellite',(512,256),(173,174,168),(115,119,121),'ice','Haumea Facts','NASA Science','https://science.nasa.gov/dwarf-planets/haumea/','Hubble / Keck'),
('dwarf-satellite-namaka','Namaka','dwarf-system-satellite',(512,256),(151,151,145),(92,96,100),'ice-dark','Haumea Facts','NASA Science','https://science.nasa.gov/dwarf-planets/haumea/','Hubble / Keck'),
('dwarf-satellite-mk2','MK2','dwarf-system-satellite',(512,256),(61,57,53),(100,91,80),'dark-satellite','Makemake Moon Discovery','NASA Science','https://science.nasa.gov/dwarf-planets/makemake/facts/','Hubble'),
('dwarf-satellite-weywot','Weywot','dwarf-system-satellite',(512,256),(77,66,60),(116,91,78),'restrained-red','Quaoar System Context','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=50000','Ground-based orbit solution'),
('dwarf-satellite-xiangliu','Xiangliu','dwarf-system-satellite',(512,256),(66,58,55),(113,85,76),'restrained-red','Gonggong System Context','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=225088','Hubble orbit solution'),
('dwarf-satellite-vanth','Vanth','dwarf-system-satellite',(512,256),(112,106,98),(69,69,70),'neutral','Orcus System Context','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=90482','Hubble / Keck orbit solution'),
]

def lerp(a,b,t): return int(a+(b-a)*t)
def noise_image(w,h,base,accent,seed):
    rnd=random.Random(seed)
    small=Image.new('RGB',(max(16,w//16),max(8,h//16)))
    px=small.load()
    for y in range(small.height):
        for x in range(small.width):
            n=rnd.random()
            lat=abs((y/(small.height-1))*2-1)
            t=max(0,min(1,0.22+0.58*n-0.08*lat))
            px[x,y]=tuple(lerp(base[i],accent[i],t) for i in range(3))
    return small.resize((w,h),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(max(0.4,w/1024)))

def ellipse_wrap(draw, box, fill, outline=None, width=1):
    x0,y0,x1,y1=box
    draw.ellipse(box,fill=fill,outline=outline,width=width)
    W=draw._image.size[0]
    if x0<0: draw.ellipse((x0+W,y0,x1+W,y1),fill=fill,outline=outline,width=width)
    if x1>W: draw.ellipse((x0-W,y0,x1-W,y1),fill=fill,outline=outline,width=width)

def add_craters(img,rnd,count,dense=False):
    d=ImageDraw.Draw(img,'RGBA'); w,h=img.size
    for _ in range(count):
        r=rnd.randint(max(2,w//180), max(4,w//35 if dense else w//50))
        x=rnd.randrange(w); y=int((0.08+0.84*rnd.random())*h)
        shade=rnd.randint(20,70)
        ellipse_wrap(d,(x-r,y-r,x+r,y+r),(10,10,10,shade),(230,225,210,shade//2),max(1,r//6))

def make_texture(body):
    ident,name,category,(w,h),base,accent,pattern,*_=body
    seed=int(hashlib.sha256(ident.encode()).hexdigest()[:8],16)
    rnd=random.Random(seed)
    img=noise_image(w,h,base,accent,seed)
    d=ImageDraw.Draw(img,'RGBA')
    if pattern in {'maria','terrain','patchwork','heart','bright-spots','south-basin'}:
        for _ in range(12 if w>512 else 7):
            x=rnd.randrange(w); y=rnd.randrange(h); rx=rnd.randint(w//30,w//9); ry=rnd.randint(h//22,h//7)
            col=(max(0,base[0]-35),max(0,base[1]-35),max(0,base[2]-35),rnd.randint(45,110))
            ellipse_wrap(d,(x-rx,y-ry,x+rx,y+ry),col)
    if pattern in {'crater','dense-crater','dark-crater','herschel','maria','bright-spots','south-basin','pitted','irregular-crater'}:
        add_craters(img,rnd,80 if pattern=='dense-crater' else 34,dense=pattern=='dense-crater')
    if pattern=='herschel':
        ellipse_wrap(d,(int(w*.63),int(h*.31),int(w*.84),int(h*.72)),(35,35,34,120),(235,230,218,120),max(2,w//150))
    if pattern=='sulfur':
        for _ in range(42):
            x=rnd.randrange(w); y=rnd.randrange(h); r=rnd.randint(w//100,w//28)
            col=rnd.choice([(190,42,22,130),(72,45,35,125),(245,221,81,110),(119,102,38,100)])
            ellipse_wrap(d,(x-r,y-r,x+r,y+r),col)
    if pattern in {'lineaments','tiger-stripes','wispy','valleys','canyon','faults'}:
        colors={'lineaments':(105,54,50,170),'tiger-stripes':(62,123,157,180),'wispy':(226,228,224,105),'valleys':(72,91,105,120),'canyon':(83,75,71,130),'faults':(70,76,79,135)}
        for i in range(18 if pattern=='lineaments' else 9):
            pts=[]; phase=rnd.random()*math.tau; y0=rnd.uniform(.12,.88)*h
            for x in range(-20,w+21,max(12,w//45)):
                y=y0+math.sin(x/w*math.tau*rnd.uniform(.8,2.2)+phase)*rnd.uniform(4,h*.06)
                pts.append((x,y))
            d.line(pts,fill=colors[pattern],width=max(1,w//350))
    if pattern=='two-tone':
        d.rectangle((0,0,w*.48,h),fill=(32,28,26,130)); d.ellipse((w*.36,-h*.1,w*.72,h*1.1),fill=(52,45,39,90))
    if pattern=='patchwork':
        for _ in range(20):
            x=rnd.randrange(w); y=rnd.randrange(h); rw=rnd.randint(w//25,w//8); rh=rnd.randint(h//18,h//6)
            d.rectangle((x,y,x+rw,y+rh),fill=(rnd.randint(50,190),)*3+(rnd.randint(25,75),),outline=(220,220,215,45))
    if pattern in {'haze','frost','methane-frost','red-frost','deep-red','restrained-red','neutral-ice','ice','ice-dark','neutral','dark-satellite'}:
        for y in range(h):
            lat=abs(y/h*2-1); alpha=int((1-lat)*28)
            d.line((0,y,w,y),fill=(*accent,alpha))
    if pattern in {'polar-frost','polar-cap'}:
        d.rectangle((0,0,w,h*.2),fill=(229,221,212,110)); d.rectangle((0,h*.78,w,h),fill=(196,170,160,75))
    if pattern=='heart':
        # restrained Tombaugh Regio cue, not a copied map.
        cx,cy=w*.57,h*.52; s=w*.12
        d.ellipse((cx-s,cy-s,cx,cy),fill=(235,218,198,125)); d.ellipse((cx,cy-s,cx+s,cy),fill=(235,218,198,125)); d.polygon([(cx-s,cy-s*.25),(cx+s,cy-s*.25),(cx,cy+s*1.4)],fill=(235,218,198,125))
    if pattern=='bright-spots':
        for x,y,r in [(w*.55,h*.48,w*.012),(w*.58,h*.49,w*.006),(w*.52,h*.5,w*.005)]: ellipse_wrap(d,(x-r,y-r,x+r,y+r),(245,240,215,210))
    if pattern=='south-basin':
        ellipse_wrap(d,(w*.26,h*.63,w*.78,h*1.18),(49,40,36,95),(210,188,165,70),max(2,w//180))
    if pattern in {'faceted','round-dark','faceted','bilobed','dark-nucleus','pitted','restrained','soft-irregular'}:
        # Low-frequency albedo, intentionally no invented continental detail.
        for _ in range(8):
            x=rnd.randrange(w); y=rnd.randrange(h); r=rnd.randint(w//25,w//10)
            ellipse_wrap(d,(x-r,y-r,x+r,y+r),(*accent,rnd.randint(18,48)))
    if pattern=='elongated-frost':
        for y in range(h): d.line((0,y,w,y),fill=(230,230,222,int(15+25*math.cos(y/h*math.pi)**2)))
    img=img.filter(ImageFilter.GaussianBlur(0.35 if w>=1024 else 0.25))
    return ImageEnhance.Contrast(img).enhance(1.08)

manifest=[]; source_manifest=[]; orientation=[]
for body in BODIES:
    ident,name,category,(w,h),base,accent,pattern,title,provider,url,mission=body
    img=make_texture(body)
    path=OUT/f'{ident}.webp'
    img.save(path,'WEBP',quality=84,method=6)
    sha=hashlib.sha256(path.read_bytes()).hexdigest()
    size=path.stat().st_size
    public_path=f'/textures/celestial/{ident}.webp'
    source_id='helios-visual-'+ident
    provider_license=USGS_LICENSE if provider.startswith('USGS') else NASA_LICENSE
    entry={
      'celestialBodyId':ident,'assetRole':'surface-albedo','sourceTitle':title,'publisherProvider':provider,
      'exactSourceUrl':url,'sourceMissionInstrument':mission,'licenseOrPublicUseStatus':provider_license,
      'attribution':f'{provider}; visual appearance reference only. {HELIOS_LICENSE}','retrievedDate':RETRIEVED,
      'originalDimensions':{'width':None,'height':None,'note':'No source raster copied; deterministic reconstruction from published appearance constraints.'},
      'runtimeDimensions':{'width':w,'height':h},'format':'webp','byteSize':size,'sha256':sha,
      'projection':'procedural-equirectangular','northPoleConvention':'visual-north-up; not navigation-grade',
      'flipY':False,'flipX':False,'textureLongitudeOffsetDeg':0,'appliedOperations':['deterministic seeded procedural synthesis','bounded color/albedo shaping','WebP encoding'],
      'representationType':'procedural-reconstruction','primeMeridianVerified':False,'orientationSourceId':source_id,
      'visualCalibrationNote':'Visual identity only. No navigation-grade longitude or source-pixel correspondence is claimed.',
      'runtimePath':public_path,'category':category,'owner':f'celestial:{ident}:surface','decodedBytes':w*h*4,
    }
    manifest.append(entry)
    source_manifest.append({k:entry[k] for k in ['celestialBodyId','sourceTitle','publisherProvider','exactSourceUrl','sourceMissionInstrument','licenseOrPublicUseStatus','attribution','retrievedDate','representationType']})
    orientation.append({k:entry[k] for k in ['celestialBodyId','projection','northPoleConvention','flipY','flipX','textureLongitudeOffsetDeg','primeMeridianVerified','orientationSourceId','visualCalibrationNote']})

(ROOT/'docs/explore/VISUAL_ASSET_MANIFEST.json').write_text(json.dumps({'schemaVersion':1,'generatedAt':RETRIEVED,'assets':manifest},indent=2,ensure_ascii=False)+'\n')
(ROOT/'docs/explore/SOURCE_LICENSE_ATTRIBUTION_MANIFEST.json').write_text(json.dumps({'schemaVersion':1,'generatedAt':RETRIEVED,'sources':source_manifest},indent=2,ensure_ascii=False)+'\n')
(ROOT/'docs/explore/ORIENTATION_CALIBRATION_MANIFEST.json').write_text(json.dumps({'schemaVersion':1,'generatedAt':RETRIEVED,'orientations':orientation},indent=2,ensure_ascii=False)+'\n')
print(f'generated {len(manifest)} assets, {sum(x["byteSize"] for x in manifest)} encoded bytes, {sum(x["decodedBytes"] for x in manifest)} decoded bytes')
