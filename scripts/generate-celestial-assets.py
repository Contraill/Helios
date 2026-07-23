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
ESA_LICENSE = 'ESA material used as a scientific appearance or shape reference only; individual media reuse terms remain governed by ESA. No source raster pixels are reproduced.'
HELIOS_LICENSE = 'Helios-generated deterministic procedural reconstruction; no source raster pixels reproduced.'

# id, display, category, dimensions, base rgb, accent rgb, pattern, source title, provider, url, mission/instrument
BODIES = [
('moon-earth-moon','Moon','featured-moon',(1024,512),(118,116,110),(52,55,59),'maria','Lunar Reconnaissance Orbiter Camera Global Morphology Mosaic','USGS Astrogeology / NASA LRO','https://astrogeology.usgs.gov/search/map/moon_lro_lroc_wac_global_morphology_mosaic_100m','LRO / LROC WAC'),
('moon-mars-phobos','Phobos','featured-moon',(512,256),(79,70,63),(38,33,31),'irregular-crater','Phobos Viking Global Mosaic 5m','USGS Astrogeology / NASA PDS','https://astrogeology.usgs.gov/search/map/phobos_viking_global_mosaic_5m','Viking global mosaic appearance reference'),
('moon-mars-deimos','Deimos','featured-moon',(512,256),(99,91,83),(54,49,45),'soft-irregular','Deimos Overview','NASA Science','https://science.nasa.gov/mars/moons/deimos/','Viking appearance references'),
('moon-jupiter-io','Io','featured-moon',(1024,512),(219,183,70),(112,61,34),'sulfur','Io Voyager - Galileo SSI Global Mosaic 1km','USGS Astrogeology / NASA PDS','https://astrogeology.usgs.gov/search/map/io_voyager_galileo_ssi_global_mosaic_1km','Voyager / Galileo SSI'),
('moon-jupiter-europa','Europa','featured-moon',(1024,512),(191,178,146),(95,66,55),'lineaments','Europa Voyager - Galileo SSI Global Mosaic 500m','USGS Astrogeology / NASA PDS','https://astrogeology.usgs.gov/search/map/europa_voyager_galileo_ssi_global_mosaic_500m','Voyager / Galileo SSI'),
('moon-jupiter-ganymede','Ganymede','featured-moon',(1024,512),(111,103,92),(45,48,53),'terrain','Ganymede Voyager - Galileo SSI Color Global Mosaic 1.4km','USGS Astrogeology / NASA PDS','https://astrogeology.usgs.gov/search/map/ganymede_voyager_galileo_ssi_color_global_mosaic_1_4km','Voyager / Galileo SSI'),
('moon-jupiter-callisto','Callisto','featured-moon',(1024,512),(63,58,53),(132,123,108),'dense-crater','Callisto Galileo/Voyager Global Mosaic 1km','USGS Astrogeology / NASA PDS','https://astrogeology.usgs.gov/search/map/callisto_galileo_voyager_global_mosaic_1km','Voyager / Galileo SSI'),
('moon-saturn-mimas','Mimas','featured-moon',(512,256),(151,151,146),(74,73,70),'herschel','Mimas Facts','NASA Science','https://science.nasa.gov/saturn/moons/mimas/facts/','Cassini'),
('moon-saturn-enceladus','Enceladus','featured-moon',(1024,512),(221,225,222),(103,142,164),'tiger-stripes','Enceladus Cassini Global Mosaic 100m Schenk','USGS Astrogeology / NASA Cassini','https://astrogeology.usgs.gov/search/map/enceladus-cassini-global-mosaic-100m-schenk','Cassini ISS'),
('moon-saturn-tethys','Tethys','featured-moon',(512,256),(182,179,169),(102,95,89),'canyon','Tethys Facts','NASA Science','https://science.nasa.gov/saturn/moons/tethys/facts/','Cassini'),
('moon-saturn-dione','Dione','featured-moon',(512,256),(169,170,166),(91,95,101),'wispy','Dione Facts','NASA Science','https://science.nasa.gov/saturn/moons/dione/facts/','Cassini'),
('moon-saturn-rhea','Rhea','featured-moon',(512,256),(155,154,150),(93,91,87),'crater','Rhea Facts','NASA Science','https://science.nasa.gov/saturn/moons/rhea/facts/','Cassini'),
('moon-saturn-titan','Titan','featured-moon',(1024,512),(178,107,37),(224,157,65),'haze','Titan Cassini ISS Global Mosaic 4005m','USGS Astrogeology / NASA Cassini','https://astrogeology.usgs.gov/search/map/titan_cassini_iss_global_mosaic_4005m','Cassini ISS / Huygens context'),
('moon-saturn-iapetus','Iapetus','featured-moon',(1024,512),(171,165,150),(45,39,34),'two-tone','Iapetus Cassini - Voyager Global Mosaic 803m','USGS Astrogeology / NASA Cassini','https://astrogeology.usgs.gov/search/map/iapetus_cassini_voyager_global_mosaic_803m','Cassini ISS / Voyager'),
('moon-uranus-miranda','Miranda','featured-moon',(1024,512),(149,149,145),(82,84,88),'patchwork','Miranda Facts','NASA Science','https://science.nasa.gov/uranus/moons/miranda/','Voyager 2'),
('moon-uranus-ariel','Ariel','featured-moon',(512,256),(172,177,177),(91,104,111),'valleys','Ariel Facts','NASA Science','https://science.nasa.gov/uranus/moons/ariel/','Voyager 2'),
('moon-uranus-umbriel','Umbriel','featured-moon',(512,256),(79,80,79),(139,139,129),'dark-crater','Umbriel Facts','NASA Science','https://science.nasa.gov/uranus/moons/umbriel/','Voyager 2'),
('moon-uranus-titania','Titania','featured-moon',(512,256),(142,145,142),(82,91,93),'faults','Titania Facts','NASA Science','https://science.nasa.gov/uranus/moons/titania/','Voyager 2'),
('moon-uranus-oberon','Oberon','featured-moon',(512,256),(105,101,96),(155,146,130),'dark-crater','Oberon Facts','NASA Science','https://science.nasa.gov/uranus/moons/oberon/','Voyager 2'),
('moon-neptune-proteus','Proteus','featured-moon',(512,256),(78,75,72),(112,104,96),'faceted','Proteus Facts','NASA Science','https://science.nasa.gov/neptune/moons/proteus/','Voyager 2'),
('moon-neptune-triton','Triton','featured-moon',(1024,512),(185,178,167),(172,110,91),'polar-frost','Triton Voyager 2 Global Color Mosaic 600m','USGS Astrogeology / NASA Voyager','https://astrogeology.usgs.gov/search/map/triton_voyager_2_global_color_mosaic_600m','Voyager 2 ISS'),
('moon-neptune-nereid','Nereid','featured-moon',(512,256),(95,99,101),(53,56,58),'restrained','Nereid Facts','NASA Science','https://science.nasa.gov/neptune/moons/nereid/','Voyager 2 / ground observations'),
('ceres','Ceres','asteroid',(1024,512),(106,103,96),(176,170,150),'bright-spots','Ceres Dawn FC Global Mosaic 140m','USGS Astrogeology / NASA Dawn','https://astrogeology.usgs.gov/search/map/ceres_dawn_fc_global_mosaic_140m','Dawn Framing Camera'),
('vesta','Vesta','asteroid',(1024,512),(132,116,99),(58,49,45),'south-basin','Vesta Dawn FC HAMO Global Mosaic 60m','USGS Astrogeology / NASA Dawn','https://astrogeology.usgs.gov/search/map/vesta_dawn_fc_hamo_global_mosaic_60m','Dawn Framing Camera'),
('pallas','Pallas','asteroid',(512,256),(92,88,84),(133,124,110),'faceted','Pallas Overview','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=2','Ground-based / adaptive optics appearance constraints'),
('hygiea','Hygiea','asteroid',(512,256),(47,48,47),(88,84,78),'round-dark','Hygiea Overview','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=10','Ground-based appearance constraints'),
('pluto','Pluto','dwarf-kuiper',(1024,512),(174,142,119),(222,195,168),'heart','Pluto New Horizons LORRI - MVIC Global Mosaic 300m','USGS Astrogeology / NASA New Horizons','https://astrogeology.usgs.gov/search/map/pluto_new_horizons_lorri_mvic_global_mosaic_300m','New Horizons LORRI / MVIC'),
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
('67p','67P/Churyumov–Gerasimenko','comet',(512,256),(36,35,33),(80,76,69),'bilobed','Shape model of comet 67P/C-G','ESA Rosetta','https://sci.esa.int/web/rosetta/-/54389-shape-model-of-comet','Rosetta / OSIRIS shape reference'),
('neowise','NEOWISE','comet',(512,256),(48,43,37),(113,96,72),'dark-nucleus','C/2020 F3 NEOWISE','NASA Science','https://science.nasa.gov/solar-system/comets/c-2020-f3-neowise/','NEOWISE / ground observations'),
('tempel-1','Tempel 1','comet',(512,256),(45,43,40),(97,91,81),'pitted','9P/Tempel 1 Facts','NASA Science','https://science.nasa.gov/solar-system/comets/9p-tempel-1/','Deep Impact / Stardust-NExT'),
('dwarf-satellite-charon','Charon','dwarf-system-satellite',(1024,512),(129,126,122),(75,64,63),'polar-cap','Charon New Horizons LORRI MVIC Global Mosaic 300m','USGS Astrogeology / NASA New Horizons','https://astrogeology.usgs.gov/search/map/charon_new_horizons_lorri_mvic_global_mosaic_300m','New Horizons LORRI / MVIC'),
('dwarf-satellite-dysnomia','Dysnomia','dwarf-system-satellite',(512,256),(83,81,78),(128,123,114),'restrained','Eris Facts','NASA Science','https://science.nasa.gov/dwarf-planets/eris/','Hubble / Keck orbital context'),
('dwarf-satellite-hiiaka','Hiʻiaka','dwarf-system-satellite',(512,256),(173,174,168),(115,119,121),'ice','Haumea Facts','NASA Science','https://science.nasa.gov/dwarf-planets/haumea/','Hubble / Keck'),
('dwarf-satellite-namaka','Namaka','dwarf-system-satellite',(512,256),(151,151,145),(92,96,100),'ice-dark','Haumea Facts','NASA Science','https://science.nasa.gov/dwarf-planets/haumea/','Hubble / Keck'),
('dwarf-satellite-mk2','MK2','dwarf-system-satellite',(512,256),(61,57,53),(100,91,80),'dark-satellite','Makemake Moon Discovery','NASA Science','https://science.nasa.gov/dwarf-planets/makemake/facts/','Hubble'),
('dwarf-satellite-weywot','Weywot','dwarf-system-satellite',(512,256),(77,66,60),(116,91,78),'restrained-red','Quaoar System Context','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=50000','Ground-based orbit solution'),
('dwarf-satellite-xiangliu','Xiangliu','dwarf-system-satellite',(512,256),(66,58,55),(113,85,76),'restrained-red','Gonggong System Context','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=225088','Hubble orbit solution'),
('dwarf-satellite-vanth','Vanth','dwarf-system-satellite',(512,256),(112,106,98),(69,69,70),'neutral','Orcus System Context','NASA/JPL Solar System Dynamics','https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=90482','Hubble / Keck orbit solution'),
]

def lerp(a,b,t): return int(a+(b-a)*t)

def wrap_x(x, width):
    return int(x) % width

def fractal_surface(w, h, base, accent, seed):
    """Body-seeded, seam-safe multi-octave albedo field.

    Every octave is generated with a duplicated first column so bicubic
    upscaling remains continuous at the equirectangular longitude seam.
    """
    layers=[]
    for octave, cells in enumerate((12, 24, 48, 96)):
        rnd=random.Random(seed ^ (0x9E3779B9 * (octave + 1)))
        gh=max(6, cells//2)
        grid=Image.new('L',(cells+1,gh))
        px=grid.load()
        for y in range(gh):
            latitude=abs((y/max(1,gh-1))*2-1)
            for x in range(cells):
                value=int(max(0,min(255,128+rnd.gauss(0,42)*(1-latitude*.16))))
                px[x,y]=value
            px[cells,y]=px[0,y]
        layer=grid.resize((w+max(1,w//cells),h),Image.Resampling.BICUBIC).crop((0,0,w,h))
        layers.append(layer)
    weights=(0.52,0.27,0.14,0.07)
    field=Image.new('L',(w,h),128)
    for layer, weight in zip(layers,weights):
        field=Image.blend(field,layer,weight)
    field=ImageEnhance.Contrast(field).enhance(1.55)
    color=Image.new('RGB',(w,h)); src=field.load(); dst=color.load()
    for y in range(h):
        latitude=abs((y/max(1,h-1))*2-1)
        polar=0.07*latitude
        for x in range(w):
            t=max(0,min(1,(src[x,y]/255)*.86+.07-polar))
            dst[x,y]=tuple(lerp(base[i],accent[i],t) for i in range(3))
    return color

def ellipse_wrap(draw, box, fill, outline=None, width=1):
    x0,y0,x1,y1=box
    draw.ellipse(box,fill=fill,outline=outline,width=width)
    W=draw._image.size[0]
    if x0<0: draw.ellipse((x0+W,y0,x1+W,y1),fill=fill,outline=outline,width=width)
    if x1>W: draw.ellipse((x0-W,y0,x1-W,y1),fill=fill,outline=outline,width=width)

def dimensional_crater(draw, w, h, x, y, radius, strength=1.0, central_peak=False):
    shadow=(9,9,10,int(82*strength)); rim=(236,230,216,int(72*strength))
    ellipse_wrap(draw,(x-radius,y-radius,x+radius,y+radius),shadow)
    inset=max(1,radius*.13)
    ellipse_wrap(draw,(x-radius+inset,y-radius+inset,x+radius+inset*.3,y+radius+inset*.3),(44,43,42,int(58*strength)),rim,max(1,int(radius/7)))
    if central_peak and radius>7:
        peak=max(1,radius*.12)
        ellipse_wrap(draw,(x-peak,y-peak,x+peak,y+peak),(224,218,204,int(80*strength)))

def add_craters(img,rnd,count,dense=False,large_bias=False):
    d=ImageDraw.Draw(img,'RGBA'); w,h=img.size
    for index in range(count):
        upper=w//25 if dense else w//38
        if large_bias and index < max(2,count//8): upper=w//14
        r=rnd.randint(max(2,w//220),max(4,upper))
        x=rnd.randrange(w); y=int((0.06+0.88*rnd.random())*h)
        dimensional_crater(d,w,h,x,y,r,rnd.uniform(.55,1.05),rnd.random()<.12)

def curved_fault(draw,w,h,rnd,color,width,vertical_bias=False,count=8):
    for index in range(count):
        pts=[]
        phase=rnd.random()*math.tau
        amplitude=rnd.uniform(h*.012,h*.065)
        frequency=rnd.uniform(.55,2.35)
        if vertical_bias:
            x0=rnd.uniform(.08,.92)*w
            for y in range(-12,h+13,max(7,h//34)):
                x=x0+math.sin(y/h*math.tau*frequency+phase)*amplitude*1.7
                pts.append((x,y))
        else:
            y0=rnd.uniform(.08,.92)*h
            for x in range(-16,w+17,max(8,w//60)):
                y=y0+math.sin(x/w*math.tau*frequency+phase)*amplitude
                pts.append((x,y))
        draw.line(pts,fill=color,width=width)
        if index%3==0:
            offset=[(x+width*1.5,y+width) for x,y in pts]
            draw.line(offset,fill=(245,242,231,max(18,color[3]//3)),width=max(1,width//2))

def add_body_signature(img, pattern, rnd, base, accent):
    d=ImageDraw.Draw(img,'RGBA'); w,h=img.size
    if pattern=='maria':
        for x,y,rx,ry in [(.31,.43,.17,.12),(.48,.38,.12,.09),(.60,.55,.11,.10),(.22,.61,.09,.07)]:
            ellipse_wrap(d,((x-rx)*w,(y-ry)*h,(x+rx)*w,(y+ry)*h),(24,27,31,115))
        add_craters(img,rnd,92,dense=True,large_bias=True)
    elif pattern=='irregular-crater':
        add_craters(img,rnd,58,dense=True,large_bias=True)
        dimensional_crater(d,w,h,w*.73,h*.45,w*.115,1.25,True)
        curved_fault(d,w,h,rnd,(36,31,29,140),max(1,w//300),False,7)
    elif pattern=='soft-irregular':
        add_craters(img,rnd,24,dense=False,large_bias=True)
        for _ in range(7):
            x=rnd.randrange(w); y=rnd.randrange(h); rx=rnd.randint(w//20,w//8)
            ellipse_wrap(d,(x-rx,y-rx*.5,x+rx,y+rx*.5),(*accent,rnd.randint(18,42)))
    elif pattern=='sulfur':
        for _ in range(70):
            x=rnd.randrange(w); y=rnd.randrange(h); r=rnd.randint(w//130,w//24)
            col=rnd.choice([(166,30,18,155),(67,42,34,150),(247,221,69,125),(109,92,31,120),(239,243,177,100)])
            ellipse_wrap(d,(x-r,y-r*.72,x+r,y+r*.72),col)
        curved_fault(d,w,h,rnd,(82,50,34,85),max(1,w//420),False,11)
    elif pattern=='lineaments':
        curved_fault(d,w,h,rnd,(101,50,45,185),max(1,w//300),False,27)
        curved_fault(d,w,h,rnd,(157,107,82,120),max(1,w//500),True,9)
        for _ in range(9):
            x=rnd.randrange(w); y=rnd.randrange(h); r=rnd.randint(w//80,w//35)
            ellipse_wrap(d,(x-r,y-r,x+r,y+r),(110,75,65,45))
    elif pattern=='terrain':
        for _ in range(15):
            x=rnd.randrange(w); y=rnd.randrange(h); rx=rnd.randint(w//28,w//9); ry=rnd.randint(h//18,h//7)
            ellipse_wrap(d,(x-rx,y-ry,x+rx,y+ry),rnd.choice([(39,42,46,85),(176,168,148,62),(88,75,64,70)]))
        curved_fault(d,w,h,rnd,(205,198,180,80),max(1,w//420),False,15)
        add_craters(img,rnd,42,dense=False)
    elif pattern=='dense-crater':
        add_craters(img,rnd,170,dense=True,large_bias=True)
        for _ in range(8):
            x=rnd.randrange(w); y=rnd.randrange(h); r=rnd.randint(w//70,w//28)
            ellipse_wrap(d,(x-r,y-r,x+r,y+r),(235,230,212,120))
    elif pattern=='herschel':
        add_craters(img,rnd,42,dense=False)
        dimensional_crater(d,w,h,w*.71,h*.51,w*.105,1.5,True)
    elif pattern=='tiger-stripes':
        add_craters(img,rnd,28,dense=False)
        for offset in (-.065,-.025,.018,.061):
            pts=[]
            for x in range(int(w*.52),int(w*.94),max(7,w//70)):
                y=h*(.76+offset)+math.sin(x/w*math.tau*1.4)*h*.018
                pts.append((x,y))
            d.line(pts,fill=(48,117,157,205),width=max(2,w//260))
    elif pattern=='canyon':
        add_craters(img,rnd,44,dense=False)
        curved_fault(d,w,h,rnd,(66,61,58,160),max(2,w//220),True,3)
    elif pattern=='wispy':
        add_craters(img,rnd,45,dense=False)
        curved_fault(d,w,h,rnd,(238,239,235,155),max(1,w//280),True,18)
    elif pattern=='crater':
        add_craters(img,rnd,82,dense=True,large_bias=True)
    elif pattern=='haze':
        for y in range(h):
            lat=abs(y/h*2-1); d.line((0,y,w,y),fill=(232,151,58,int(22+40*(1-lat))))
        for _ in range(10):
            x=rnd.randrange(w); y=rnd.randrange(h); rx=rnd.randint(w//20,w//8)
            ellipse_wrap(d,(x-rx,y-rx*.4,x+rx,y+rx*.4),(65,47,35,rnd.randint(25,60)))
    elif pattern=='two-tone':
        d.rectangle((0,0,w*.47,h),fill=(25,22,21,155))
        d.ellipse((w*.30,-h*.18,w*.68,h*1.18),fill=(48,41,35,92))
        add_craters(img,rnd,62,dense=True,large_bias=True)
        d.line((0,h*.47,w,h*.42),fill=(223,215,196,75),width=max(2,w//190))
    elif pattern=='patchwork':
        for _ in range(24):
            x=rnd.randrange(w); y=rnd.randrange(h); rw=rnd.randint(w//28,w//8); rh=rnd.randint(h//20,h//6)
            tone=rnd.randint(60,182)
            d.polygon([(x,y),(x+rw,y-rh*.18),(x+rw*.84,y+rh),(x-rw*.12,y+rh*.78)],fill=(tone,tone,tone,rnd.randint(35,78)),outline=(218,218,211,55))
        curved_fault(d,w,h,rnd,(54,58,63,135),max(1,w//330),True,10)
    elif pattern=='valleys':
        add_craters(img,rnd,36,dense=False)
        curved_fault(d,w,h,rnd,(58,79,93,150),max(2,w//250),False,8)
    elif pattern=='dark-crater':
        add_craters(img,rnd,64,dense=True,large_bias=True)
        ellipse_wrap(d,(w*.74,h*.22,w*.83,h*.38),(218,211,181,140))
    elif pattern=='faults':
        add_craters(img,rnd,48,dense=False)
        curved_fault(d,w,h,rnd,(56,63,67,150),max(1,w//280),True,14)
    elif pattern=='faceted':
        for _ in range(18):
            x=rnd.randrange(w); y=rnd.randrange(h); rw=rnd.randint(w//20,w//7); rh=rnd.randint(h//18,h//7)
            tone=rnd.randint(-22,24); col=tuple(max(0,min(255,c+tone)) for c in base)+(rnd.randint(30,72),)
            d.polygon([(x-rw,y),(x-rw*.25,y-rh),(x+rw,y-rh*.25),(x+rw*.55,y+rh),(x-rw*.45,y+rh*.65)],fill=col)
        add_craters(img,rnd,20,dense=False)
    elif pattern=='polar-frost':
        d.rectangle((0,0,w,h*.24),fill=(229,220,211,130)); d.rectangle((0,h*.75,w,h),fill=(204,164,145,80))
        curved_fault(d,w,h,rnd,(99,75,71,110),max(1,w//350),False,12)
    elif pattern=='restrained':
        for _ in range(12):
            x=rnd.randrange(w); y=rnd.randrange(h); r=rnd.randint(w//30,w//9)
            ellipse_wrap(d,(x-r,y-r*.6,x+r,y+r*.6),(*accent,rnd.randint(22,55)))
        add_craters(img,rnd,18,dense=False)
    elif pattern=='bright-spots':
        add_craters(img,rnd,92,dense=True,large_bias=True)
        for x,y,r in [(w*.55,h*.48,w*.014),(w*.58,h*.49,w*.007),(w*.52,h*.50,w*.006)]:
            ellipse_wrap(d,(x-r,y-r,x+r,y+r),(249,245,221,230))
    elif pattern=='south-basin':
        add_craters(img,rnd,76,dense=True,large_bias=True)
        ellipse_wrap(d,(w*.22,h*.56,w*.82,h*1.22),(40,34,31,125),(211,190,169,90),max(2,w//170))
        curved_fault(d,w,h,rnd,(222,208,187,80),max(1,w//330),False,10)
    elif pattern=='round-dark':
        add_craters(img,rnd,34,dense=False,large_bias=True)
        for _ in range(6):
            x=rnd.randrange(w); y=rnd.randrange(h); r=rnd.randint(w//16,w//8)
            ellipse_wrap(d,(x-r,y-r*.55,x+r,y+r*.55),(*accent,rnd.randint(18,42)))
    elif pattern=='heart':
        add_craters(img,rnd,48,dense=False,large_bias=True)
        cx,cy=w*.57,h*.52; size=w*.12
        d.ellipse((cx-size,cy-size,cx,cy),fill=(235,218,198,155)); d.ellipse((cx,cy-size,cx+size,cy),fill=(235,218,198,155)); d.polygon([(cx-size,cy-size*.25),(cx+size,cy-size*.25),(cx,cy+size*1.4)],fill=(235,218,198,155))
        d.ellipse((w*.08,h*.26,w*.36,h*.73),fill=(71,51,44,70))
    elif pattern in {'frost','methane-frost','red-frost','deep-red','restrained-red','neutral-ice','ice','ice-dark','neutral','dark-satellite'}:
        for y in range(h):
            lat=abs(y/h*2-1); d.line((0,y,w,y),fill=(*accent,int((1-lat)*30)))
        count={'dark-satellite':10,'ice':18,'ice-dark':14}.get(pattern,9)
        for _ in range(count):
            x=rnd.randrange(w); y=rnd.randrange(h); rx=rnd.randint(w//28,w//9)
            ellipse_wrap(d,(x-rx,y-rx*.45,x+rx,y+rx*.45),(*accent,rnd.randint(20,55)))
    elif pattern=='elongated-frost':
        for y in range(h): d.line((0,y,w,y),fill=(230,230,222,int(12+34*math.cos(y/h*math.pi)**2)))
        curved_fault(d,w,h,rnd,(107,91,82,92),max(1,w//350),True,7)
    elif pattern in {'dark-nucleus','bilobed','pitted'}:
        for _ in range(20 if pattern=='pitted' else 11):
            x=rnd.randrange(w); y=rnd.randrange(h); r=rnd.randint(w//35,w//10)
            ellipse_wrap(d,(x-r,y-r*.65,x+r,y+r*.65),(*accent,rnd.randint(26,70)))
        add_craters(img,rnd,32 if pattern=='pitted' else 17,dense=False,large_bias=True)
    elif pattern=='polar-cap':
        d.rectangle((0,0,w,h*.22),fill=(112,67,70,130))
        add_craters(img,rnd,62,dense=True,large_bias=True)
        curved_fault(d,w,h,rnd,(61,56,56,135),max(1,w//320),False,10)


def make_texture(body):
    ident,name,category,(w,h),base,accent,pattern,*_=body
    seed=int(hashlib.sha256(ident.encode()).hexdigest()[:8],16)
    rnd=random.Random(seed)
    img=fractal_surface(w,h,base,accent,seed)
    add_body_signature(img,pattern,rnd,base,accent)
    # Keep useful high-frequency morphology: only the smallest anti-alias pass,
    # followed by restrained local contrast and sharpness.
    img=img.filter(ImageFilter.GaussianBlur(.12 if w>=1024 else .08))
    img=ImageEnhance.Contrast(img).enhance(1.16)
    img=ImageEnhance.Sharpness(img).enhance(1.28)
    return img


def dhash(img, size=12):
    gray=img.convert('L').resize((size+1,size),Image.Resampling.BILINEAR)
    px=gray.load(); value=0
    for y in range(size):
        for x in range(size):
            value=(value<<1) | int(px[x,y] > px[x+1,y])
    return value

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
    provider_license=USGS_LICENSE if provider.startswith('USGS') else ESA_LICENSE if provider.startswith('ESA') else NASA_LICENSE
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

runtime_path=ROOT/'scripts/data/texture-runtime-manifest.json'
runtime=json.loads(runtime_path.read_text())
by_path={entry['runtimePath']:entry for entry in manifest}
for asset in runtime['assets']:
    entry=by_path.get(asset['path'])
    if not entry: continue
    asset.update({
      'width':entry['runtimeDimensions']['width'],'height':entry['runtimeDimensions']['height'],
      'byteSize':entry['byteSize'],'decodedBytes':entry['decodedBytes'],'sha256':entry['sha256'],
      'provider':entry['publisherProvider'],'sourceId':entry['orientationSourceId'],
      'attribution':entry['attribution'],'license':entry['licenseOrPublicUseStatus'],
      'projection':entry['projection'],'northPoleConvention':entry['northPoleConvention'],
      'primeMeridianVerified':entry['primeMeridianVerified'],'representationType':entry['representationType'],
      'runtimeCeiling':f"{entry['runtimeDimensions']['width']}x{entry['runtimeDimensions']['height']}",
      'sourceMasterPolicy':'No source raster is shipped or copied; deterministic appearance reconstruction from cited mission products.',
    })
runtime_path.write_text(json.dumps(runtime,indent=2,ensure_ascii=False)+'\n')

hashes={}
for body in BODIES:
    ident=body[0]
    with Image.open(OUT/f'{ident}.webp') as img: hashes[ident]=dhash(img)
rows=[]
for ident,value in hashes.items():
    nearest_id,nearest_distance=min(((other,(value^other_value).bit_count()) for other,other_value in hashes.items() if other!=ident),key=lambda item:item[1])
    rows.append({'bodyId':ident,'dHash':f'{value:036x}','nearestBodyId':nearest_id,'nearestHammingDistance':nearest_distance})
rows.sort(key=lambda row:row['bodyId'])
artifact={'schemaVersion':1,'method':'12x12 grayscale difference hash; diagnostic only, GPU review remains required','bodies':rows,'summary':{'total':len(rows),'minimumNearestHammingDistance':min(row['nearestHammingDistance'] for row in rows),'pairsBelowReviewThreshold':sum(row['nearestHammingDistance']<12 for row in rows)}}
(ROOT/'test-artifacts').mkdir(exist_ok=True)
(ROOT/'test-artifacts/gate3b-texture-distinctiveness.json').write_text(json.dumps(artifact,indent=2,ensure_ascii=False)+'\n')
print(f'generated {len(manifest)} assets, {sum(x["byteSize"] for x in manifest)} encoded bytes, {sum(x["decodedBytes"] for x in manifest)} decoded bytes; minimum dHash distance {artifact["summary"]["minimumNearestHammingDistance"]}')
